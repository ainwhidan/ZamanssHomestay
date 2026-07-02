const express = require('express');
const router  = express.Router();
const db      = require('../db');
const jwt     = require('jsonwebtoken');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// ===========================
// MULTER — Receipt Upload
// ===========================
const uploadDir = path.join(__dirname, '../../frontend/public/receipts');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'receipt-' + unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  }
});

// ===========================
// MIDDLEWARE — verify token
// ===========================
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

// ===========================
// CHECK AVAILABILITY — public
// GET /api/bookings/availability?homestay_id=1
// ===========================
router.get('/availability', async (req, res) => {
  try {
    const { homestay_id } = req.query;
    const [bookedDates] = await db.query(`
      SELECT checkin_date, checkout_date, status
      FROM bookings
      WHERE homestay_id = ?
        AND status IN ('pending', 'confirmed')
    `, [homestay_id]);
    res.json(bookedDates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// CREATE BOOKING
// POST /api/bookings
// ===========================
router.post('/', auth, upload.single('receipt'), async (req, res) => {
  try {
    const { homestay_id, checkin_date, checkout_date, num_guests, total_price } = req.body;
    const user_id       = req.user.id;
    const receipt_image = req.file ? req.file.filename : null;

    // Check homestay exists
    const [hs] = await db.query('SELECT * FROM homestays WHERE id = ?', [homestay_id]);
    if (hs.length === 0) return res.status(404).json({ error: 'Homestay not found' });

    // Check availability
    const [clash] = await db.query(`
      SELECT id FROM bookings
      WHERE homestay_id = ?
        AND status IN ('pending', 'confirmed')
        AND checkin_date  < ?
        AND checkout_date > ?
    `, [homestay_id, checkout_date, checkin_date]);

    if (clash.length > 0) {
      return res.status(400).json({
        error: 'Sorry, this homestay is not available for the selected dates.'
      });
    }

    // Insert booking
    const [result] = await db.query(
      'INSERT INTO bookings (user_id, homestay_id, checkin_date, checkout_date, num_guests, total_price, receipt_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, homestay_id, checkin_date, checkout_date, num_guests, total_price, receipt_image, 'pending']
    );

    res.json({ message: 'Booking created!', booking_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// GET MY BOOKINGS
// GET /api/bookings/my
// ===========================
router.get('/my', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, h.name AS homestay_name, h.location, h.image, h.price_per_night
       FROM bookings b
       JOIN homestays h ON b.homestay_id = h.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// GET SINGLE BOOKING
// GET /api/bookings/:id
// ===========================
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, h.name AS homestay_name, h.location, h.image, h.price_per_night, h.max_guests
       FROM bookings b
       JOIN homestays h ON b.homestay_id = h.id
       WHERE b.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// CANCEL BOOKING
// PUT /api/bookings/:id/cancel
// ===========================
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    await db.query(
      'UPDATE bookings SET status = ? WHERE id = ? AND user_id = ?',
      ['cancelled', req.params.id, req.user.id]
    );
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;