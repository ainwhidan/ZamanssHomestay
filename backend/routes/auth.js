const express      = require('express');
const router       = express.Router();
const db           = require('../db');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const crypto       = require('crypto');
const nodemailer   = require('nodemailer');

// ===========================
// EMAIL TRANSPORTER
// ===========================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// ===========================
// REGISTER
// ===========================
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, hashed, 'guest']
    );
    res.json({ message: 'Account created successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// LOGIN
// ===========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const user  = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// UPDATE PROFILE
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

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user.id;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already used by another account.' });
    }
    await db.query('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone || null, userId]);
    res.json({ message: 'Profile updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ===========================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please enter your email address.' });
    }

    // Check if user exists
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      // Return success anyway (security — don't reveal if email exists)
      return res.json({ message: 'If this email exists, a reset link has been sent.' });
    }

    const user = rows[0];

    // Generate reset token
    const resetToken  = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, tokenExpiry, user.id]
    );

    // Reset link
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Send email
    await transporter.sendMail({
      from:    `"Zamanss Homestay" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: 'Reset Your Password — Zamanss Homestay',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a6fbd;">🏡 Zamanss Homestay</h1>
          </div>

          <div style="background: #f7f9fc; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f1923; margin-bottom: 16px;">Reset Your Password</h2>
            <p style="color: #718096; margin-bottom: 24px;">
              Hi <strong>${user.name}</strong>,<br><br>
              We received a request to reset your password. Click the button below to create a new password.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}"
                style="background: #1a6fbd; color: white; padding: 14px 32px; border-radius: 99px;
                       text-decoration: none; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>

            <p style="color: #718096; font-size: 14px;">
              This link will expire in <strong>1 hour</strong>.<br>
              If you didn't request this, you can safely ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

            <p style="color: #a0aec0; font-size: 12px;">
              Or copy this link: <a href="${resetLink}" style="color: #1a6fbd;">${resetLink}</a>
            </p>
          </div>

          <p style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 24px;">
            © ${new Date().getFullYear()} Zamanss Homestay, Ipoh, Perak
          </p>
        </div>
      `
    });

    res.json({ message: 'If this email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
});

// ===========================
// RESET PASSWORD
// POST /api/auth/reset-password
// ===========================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Invalid request.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    // Find user with valid token
    const [rows] = await db.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Reset link is invalid or has expired. Please request a new one.' });
    }

    const user   = rows[0];
    const hashed = await bcrypt.hash(password, 10);

    // Update password and clear token
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashed, user.id]
    );

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// VERIFY RESET TOKEN
// GET /api/auth/verify-token?token=xxx
// ===========================
router.get('/verify-token', async (req, res) => {
  try {
    const { token } = req.query;
    const [rows] = await db.query(
      'SELECT id, name FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ valid: false, error: 'Token is invalid or expired.' });
    }
    res.json({ valid: true, name: rows[0].name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    const match = await bcrypt.compare(current_password, rows[0].password);
    if (!match) return res.status(400).json({ error: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;