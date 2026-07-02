import { useState } from 'react';
import './Contact.css';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import API from '../api';

function Contact() {
  const [form,     setForm]     = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
  e.preventDefault();

  console.log('SUBMIT CLICKED');
  alert('SUBMIT CLICKED');

  setError('');
  setLoading(true);

  try {
    await API.post('/contact', form);

    setSuccess(true);
    setForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  } catch (err) {
    console.error(err);
    setError(
      err.response?.data?.error ||
      'Something went wrong. Please try again.'
    );
  } finally {
    setLoading(false);
  }
};

  const faqs = [
    { q: 'What time is check-in and check-out?', a: 'Check-in is at 3:00 PM and check-out is at 12:00 PM (noon). Early check-in or late check-out may be arranged subject to availability.' },
    { q: 'How do I confirm my booking?', a: 'After submitting your booking and payment receipt, our team will verify and confirm within 24 hours via WhatsApp or email.' },
    { q: 'Is parking available?', a: 'Yes, free parking is available at most of our properties. Check individual homestay listings for details.' },
    { q: 'Can I bring pets?', a: 'Pets are generally not allowed. However, please contact us directly to discuss special arrangements.' },
    { q: 'What payment methods do you accept?', a: 'We accept QR Pay (DuitNow) and bank transfer. Full payment is required to confirm your booking.' },
    { q: 'Can I cancel my booking?', a: 'You can cancel through your account under My Bookings. Please contact us directly for refund arrangements.' },
  ];

  return (
    <>
      {/* HERO */}
      <section className="contact-hero">
        <div className="container">
          <p className="section-tag" style={{color:'rgba(255,255,255,0.7)'}}>Get In Touch</p>
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Send us a message or reach us directly.</p>
        </div>
      </section>

      {/* CONTACT INFO STRIP */}
      <section className="contact-info-strip">
        <div className="container">
          <div className="contact-info-grid">
            <div className="contact-info-item">
              <MapPin size={22} />
              <div>
                <strong>Location</strong>
                <p>Ipoh, Perak, Malaysia</p>
              </div>
            </div>
            <div className="contact-info-item">
              <Phone size={22} />
              <div>
                <strong>Phone</strong>
                <p>+60 16-2042291</p>
              </div>
            </div>
            <div className="contact-info-item">
              <Mail size={22} />
              <div>
                <strong>Email</strong>
                <p>zamansshomestay@gmail.com</p>
              </div>
            </div>
            <div className="contact-info-item">
              <Clock size={22} />
              <div>
                <strong>Operating Hours</strong>
                <p>Mon–Sun: 8am – 10pm</p>
              </div>
            </div>
          </div>
       </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-layout">

            {/* LEFT — FORM */}
            <div className="contact-form-wrap">
              <h2>Send Us a Message</h2>
              <p>Fill in the form below and we'll get back to you within 24 hours.</p>

              {success ? (
                <div className="contact-success">
                  <div className="success-icon">🎉</div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <button className="btn-send-another" onClick={() => setSuccess(false)}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  {error && <div className="alert alert-error">⚠️ {error}</div>}

                  <div className="contact-form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input name="name" value={form.name}
                        onChange={handleChange} placeholder="Your full name" required />
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input type="email" name="email" value={form.email}
                        onChange={handleChange} placeholder="you@example.com" required />
                    </div>
                  </div>

                  <div className="contact-form-row">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input name="phone" value={form.phone}
                        onChange={handleChange} placeholder="01X-XXXXXXX" />
                    </div>
                    <div className="form-group">
                      <label>Subject *</label>
                      <select name="subject" value={form.subject} onChange={handleChange} required>
                        <option value="">Select a subject</option>
                        <option>Booking Enquiry</option>
                        <option>Payment Issue</option>
                        <option>General Question</option>
                        <option>Feedback</option>
                        <option>Special Request</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Message *</label>
                    <textarea name="message" value={form.message}
                      onChange={handleChange} rows={6}
                      placeholder="Tell us how we can help you..." required />
                  </div>

                  <button type="submit" className="btn-send" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* RIGHT — MAP + WHATSAPP */}
            <div className="contact-side">

              {/* WHATSAPP */}
              <div className="whatsapp-card">
                <div className="wa-icon">💬</div>
                <h3>Chat on WhatsApp</h3>
                <p>For faster response, reach us directly on WhatsApp. We typically reply within minutes!</p>
                <a href="https://wa.me/60162042291?text=Hi%20Zamanss%20Homestay%2C%20I%20have%20an%20enquiry."
                  className="btn-whatsapp" target="_blank" rel="noreferrer">
                  Open WhatsApp Chat
                </a>
              </div>

              {/* MAP */}
              <div className="contact-map">
                <h3>📍 Find Us</h3>
                <div className="map-embed">
                  <iframe
                    src="https://maps.google.com/maps?q=Ipoh,Perak,Malaysia&z=13&output=embed"
                    width="100%" height="280" style={{border:0}}
                    allowFullScreen loading="lazy" title="Zamanss Homestay Location">
                  </iframe>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="contact-faq">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">Quick Answers</p>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, i) => (
              <div className="faq-item" key={i}>
                <h3>❓ {faq.q}</h3>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;