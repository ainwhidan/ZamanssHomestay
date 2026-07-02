const express = require('express');
const router  = express.Router();
const db      = require('../db');
const jwt     = require('jsonwebtoken');

// ===========================
// MIDDLEWARE — verify admin
// ===========================
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden — Admins only' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ===========================
// DASHBOARD STATS
// GET /api/admin/stats
// ===========================
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [[totalUsers]]     = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'guest'");
    const [[totalBookings]]  = await db.query("SELECT COUNT(*) AS count FROM bookings");
    const [[pendingBookings]]= await db.query("SELECT COUNT(*) AS count FROM bookings WHERE status = 'pending'");
    const [[confirmedBookings]]= await db.query("SELECT COUNT(*) AS count FROM bookings WHERE status = 'confirmed'");
    const [[totalRevenue]]   = await db.query("SELECT SUM(total_price) AS total FROM bookings WHERE status = 'confirmed'");
    const [[totalHomestays]] = await db.query("SELECT COUNT(*) AS count FROM homestays");
    const [[totalReviews]]   = await db.query("SELECT COUNT(*) AS count FROM reviews");

    // Monthly revenue (last 6 months)
    const [monthlyRevenue] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%b %Y') AS month,
             SUM(total_price) AS revenue,
             COUNT(*) AS bookings
      FROM bookings
      WHERE status = 'confirmed'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY created_at ASC
    `);

    // Recent bookings
    const [recentBookings] = await db.query(`
      SELECT b.*, u.name AS user_name, h.name AS homestay_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN homestays h ON b.homestay_id = h.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    res.json({
      totalUsers:       totalUsers.count,
      totalBookings:    totalBookings.count,
      pendingBookings:  pendingBookings.count,
      confirmedBookings:confirmedBookings.count,
      totalRevenue:     totalRevenue.total || 0,
      totalHomestays:   totalHomestays.count,
      totalReviews:     totalReviews.count,
      monthlyRevenue,
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// USERS
// ===========================
router.get('/users', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.*, COUNT(b.id) AS total_bookings
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    await db.query('UPDATE users SET name=?, email=?, phone=?, role=? WHERE id=?',
      [name, email, phone, role, req.params.id]);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// HOMESTAYS
// ===========================
router.get('/homestays', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM homestays ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/homestays/:id', adminAuth, async (req, res) => {
  try {
    const { name, location, description, price_per_night, max_guests, rooms, bathrooms, amenities, status } = req.body;
    await db.query(
      'UPDATE homestays SET name=?, location=?, description=?, price_per_night=?, max_guests=?, rooms=?, bathrooms=?, amenities=?, status=? WHERE id=?',
      [name, location, description, price_per_night, max_guests, rooms, bathrooms, amenities, status, req.params.id]
    );
    res.json({ message: 'Homestay updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// BOOKINGS
// ===========================
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, u.name AS user_name, u.email AS user_email,
             h.name AS homestay_name, h.location
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN homestays h ON b.homestay_id = h.id
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/bookings/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    // Update status
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);

    // Get booking details for email
    const [rows] = await db.query(`
      SELECT b.*, u.name AS user_name, u.email AS user_email,
             h.name AS homestay_name, h.location
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN homestays h ON b.homestay_id = h.id
      WHERE b.id = ?
    `, [req.params.id]);

    if (rows.length > 0) {
      const booking = rows[0];
      const formatDate = (d) => new Date(d).toLocaleDateString('en-MY', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      const isConfirmed = status === 'confirmed';

      const emailSubject = isConfirmed
        ? `✅ Booking Confirmed — ${booking.homestay_name}`
        : `❌ Booking Cancelled — ${booking.homestay_name}`;

      const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a6fbd;">🏡 Zamanss Homestay</h1>
          </div>

          <div style="background: #f7f9fc; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f1923; margin-bottom: 8px;">
              ${isConfirmed ? '✅ Booking Confirmed!' : '❌ Booking Cancelled'}
            </h2>
            <p style="color: #718096; margin-bottom: 24px;">
              Hi <strong>${booking.user_name}</strong>,<br><br>
              ${isConfirmed
                ? 'Great news! Your booking has been <strong>confirmed</strong>. We look forward to welcoming you!'
                : 'We regret to inform you that your booking has been <strong>cancelled</strong>. Please contact us for more information.'
              }
            </p>

            <div style="background: white; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
              <h3 style="color: #0f1923; margin-bottom: 16px;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0; color: #718096; width: 40%;">Booking ID</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #0f1923;">#${booking.id}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0; color: #718096;">Homestay</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #0f1923;">${booking.homestay_name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0; color: #718096;">Location</td>
                  <td style="padding: 10px 0; color: #0f1923;">${booking.location}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0; color: #718096;">Check-in</td>
                  <td style="padding: 10px 0; color: #0f1923;">${formatDate(booking.checkin_date)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0; color: #718096;">Check-out</td>
                  <td style="padding: 10px 0; color: #0f1923;">${formatDate(booking.checkout_date)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0; color: #718096;">Guests</td>
                  <td style="padding: 10px 0; color: #0f1923;">${booking.num_guests}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #718096;">Total</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #1a6fbd; font-size: 18px;">
                    RM ${parseFloat(booking.total_price).toFixed(0)}
                  </td>
                </tr>
              </table>
            </div>

            ${isConfirmed ? `
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #16a34a; margin: 0; font-size: 14px;">
                📞 Need help? Contact us at <strong>+60 11-1234 5678</strong> or WhatsApp us anytime.
              </p>
            </div>
            ` : `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #dc2626; margin: 0; font-size: 14px;">
                📞 For refund enquiries, contact us at <strong>+60 11-1234 5678</strong>.
              </p>
            </div>
            `}

            <div style="text-align: center;">
              <a href="http://localhost:5173/my-bookings"
                style="background: #1a6fbd; color: white; padding: 12px 28px; border-radius: 99px;
                       text-decoration: none; font-weight: bold; font-size: 14px;">
                View My Bookings
              </a>
            </div>
          </div>

          <p style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 24px;">
            © ${new Date().getFullYear()} Zamanss Homestay, Ipoh, Perak, Malaysia
          </p>
        </div>
      `;

      // Send email
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          }
        });

        await transporter.sendMail({
          from:    `"Zamanss Homestay" <${process.env.EMAIL_USER}>`,
          to:      booking.user_email,
          subject: emailSubject,
          html:    emailHTML,
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
        // Don't fail the request if email fails
      }
    }

    res.json({ message: `Booking ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// REVIEWS
// ===========================
router.get('/reviews', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, u.name AS user_name, h.name AS homestay_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN homestays h ON r.homestay_id = h.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/reviews/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/reviews/:id/publish', adminAuth, async (req, res) => {
  try {
    const { is_published } = req.body;
    await db.query('UPDATE reviews SET is_published = ? WHERE id = ?', [is_published ? 1 : 0, req.params.id]);
    res.json({ message: is_published ? 'Review published' : 'Review unpublished' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// REPORTS
// ===========================
router.get('/reports', adminAuth, async (req, res) => {
  try {
    const { from, to } = req.query;

    const [bookings] = await db.query(`
      SELECT b.*, u.name AS user_name, u.email AS user_email,
             h.name AS homestay_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN homestays h ON b.homestay_id = h.id
      WHERE b.created_at BETWEEN ? AND ?
      ORDER BY b.created_at DESC
    `, [from || '2000-01-01', to || '2099-12-31']);

    const [[revenue]] = await db.query(`
      SELECT SUM(total_price) AS total FROM bookings
      WHERE status = 'confirmed' AND created_at BETWEEN ? AND ?
    `, [from || '2000-01-01', to || '2099-12-31']);

    const [byHomestay] = await db.query(`
      SELECT h.name, COUNT(*) AS bookings, SUM(b.total_price) AS revenue
      FROM bookings b
      JOIN homestays h ON b.homestay_id = h.id
      WHERE b.created_at BETWEEN ? AND ?
      GROUP BY h.id
    `, [from || '2000-01-01', to || '2099-12-31']);

    res.json({ bookings, totalRevenue: revenue.total || 0, byHomestay });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;