const express = require('express');
const router  = express.Router();
const db      = require('../db');
const jwt     = require('jsonwebtoken');

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

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/refunds — Guest submit refund
router.post('/', auth, async (req, res) => {
  try {
    const { booking_id, reason, bank_name, account_name, account_number } = req.body;
    const user_id = req.user.id;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Please provide a reason for the refund.' });
    }

    if (!bank_name || !account_name || !account_number) {
      return res.status(400).json({ error: 'Please provide your bank account details.' });
    }

    const [booking] = await db.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [booking_id, user_id]
    );

    if (booking.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const [existing] = await db.query(
      'SELECT id FROM refund_requests WHERE booking_id = ? AND user_id = ?',
      [booking_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already submitted a refund request for this booking.' });
    }

    await db.query(
      'INSERT INTO refund_requests (booking_id, user_id, reason, bank_name, account_name, account_number) VALUES (?, ?, ?, ?, ?, ?)',
      [booking_id, user_id, reason, bank_name, account_name, account_number]
    );

    res.json({ message: 'Refund request submitted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/refunds/my — Guest view own refunds
router.get('/my', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM refund_requests WHERE user_id = ?',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/refunds/admin — Admin view all refunds
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*,
             u.name AS user_name, u.email AS user_email,
             b.checkin_date, b.checkout_date, b.total_price,
             h.name AS homestay_name
      FROM refund_requests r
      JOIN users u ON r.user_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN homestays h ON b.homestay_id = h.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/refunds/:id — Admin update status
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query(
      'UPDATE refund_requests SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ message: `Refund ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;