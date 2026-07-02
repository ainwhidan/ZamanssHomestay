const express    = require('express');
const router     = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    // Email to admin
    await transporter.sendMail({
      from:    `"Zamanss Homestay" <${process.env.EMAIL_USER}>`,
      to:      process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1a6fbd;">Zamanss Homestay</h1>
            <p style="color: #718096;">New message from contact form</p>
          </div>

          <div style="background: #f7f9fc; border-radius: 12px; padding: 28px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f1923; margin-bottom: 20px;">Contact Details</h2>

            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; color: #718096; width: 35%;">Name</td>
                <td style="padding: 10px 0; font-weight: 600; color: #0f1923;">${name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; color: #718096;">Email</td>
                <td style="padding: 10px 0; font-weight: 600; color: #0f1923;">
                  <a href="mailto:${email}" style="color: #1a6fbd;">${email}</a>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; color: #718096;">Phone</td>
                <td style="padding: 10px 0; color: #0f1923;">${phone || '—'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; color: #718096;">Subject</td>
                <td style="padding: 10px 0; font-weight: 600; color: #0f1923;">${subject}</td>
              </tr>
            </table>

            <div style="margin-top: 20px;">
              <p style="color: #718096; margin-bottom: 8px;">Message:</p>
              <div style="background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0;
                          color: #2d3748; line-height: 1.7; font-size: 15px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>

            <div style="margin-top: 24px; padding: 14px; background: #eff6ff;
                        border-radius: 8px; border: 1px solid #bfdbfe;">
              <p style="color: #1a6fbd; margin: 0; font-size: 14px;">
                Reply directly to this email to respond to ${name}.
              </p>
            </div>
          </div>

          <p style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 24px;">
            © ${new Date().getFullYear()} Zamanss Homestay, Ipoh, Perak, Malaysia
          </p>
        </div>
      `
    });

    // Auto-reply to guest
    await transporter.sendMail({
      from:    `"Zamanss Homestay" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `Thank you for contacting us — Zamanss Homestay`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1a6fbd;">Zamanss Homestay</h1>
          </div>

          <div style="background: #f7f9fc; border-radius: 12px; padding: 28px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f1923; margin-bottom: 12px;">Thank You, ${name}!</h2>
            <p style="color: #718096; line-height: 1.7; margin-bottom: 20px;">
              We have received your message regarding <strong>${subject}</strong>.
              Our team will get back to you within <strong>24 hours</strong>.
            </p>

            <div style="background: #fff; border-radius: 8px; padding: 16px;
                        border: 1px solid #e2e8f0; margin-bottom: 20px;">
              <p style="color: #718096; font-size: 14px; margin-bottom: 8px;">Your message:</p>
              <p style="color: #2d3748; line-height: 1.7; font-size: 14px;">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>

            <p style="color: #718096; font-size: 14px;">
              Need urgent help? WhatsApp us at <strong>+60 11-1234 5678</strong>.
            </p>
          </div>

          <p style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 24px;">
            © ${new Date().getFullYear()} Zamanss Homestay, Ipoh, Perak, Malaysia
          </p>
        </div>
      `
    });

    res.json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact email error:', err);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

module.exports = router;