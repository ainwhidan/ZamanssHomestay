const express = require('express');
const router  = express.Router();
const db      = require('../db');
const jwt     = require('jsonwebtoken');

// Middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET my completed trips (confirmed bookings) that can be reviewed
// GET /api/reviews/my-trips
router.get('/my-trips', auth, async (req, res) => {
  try {
    const [trips] = await db.query(`
      SELECT 
        b.id AS booking_id,
        b.checkin_date,
        b.checkout_date,
        b.num_guests,
        b.total_price,
        h.id AS homestay_id,
        h.name AS homestay_name,
        h.location,
        h.image,
        h.price_per_night,
        r.id AS review_id,
        r.rating,
        r.comment
      FROM bookings b
      JOIN homestays h ON b.homestay_id = h.id
      LEFT JOIN reviews r ON r.homestay_id = h.id AND r.user_id = ?
      WHERE b.user_id = ? AND b.status = 'confirmed'
      ORDER BY b.checkin_date DESC
    `, [req.user.id, req.user.id]);

    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST submit review
// POST /api/reviews
router.post('/', auth, async (req, res) => {
  try {
    const { homestay_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    // Check if already reviewed
    const [existing] = await db.query(
      'SELECT id FROM reviews WHERE user_id = ? AND homestay_id = ?',
      [user_id, homestay_id]
    );

    if (existing.length > 0) {
      // Update existing review
      await db.query(
        'UPDATE reviews SET rating = ?, comment = ? WHERE user_id = ? AND homestay_id = ?',
        [rating, comment, user_id, homestay_id]
      );
      return res.json({ message: 'Review updated!' });
    }

    // Insert new review
    await db.query(
      'INSERT INTO reviews (user_id, homestay_id, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id, homestay_id, rating, comment]
    );

    // Update homestay average rating
    await db.query(`
      UPDATE homestays SET rating = (
        SELECT ROUND(AVG(rating), 1) FROM reviews WHERE homestay_id = ?
      ) WHERE id = ?
    `, [homestay_id, homestay_id]);

    res.json({ message: 'Review submitted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all reviews for a homestay
// GET /api/reviews/homestay/:id
router.get('/homestay/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, u.name AS user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.homestay_id = ? AND r.is_published = 1
      ORDER BY r.created_at DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;