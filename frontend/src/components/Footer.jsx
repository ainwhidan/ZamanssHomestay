import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">

        <div className="footer-brand">
          <Link to="/" className="footer-logo">🏡 Zamanss Homestay</Link>
          <p>Your home away from home in the heart of Perak, Malaysia. Warm, comfortable, and affordable stays for everyone.</p>
          <div className="social-links">
            <a href="#">📘 Facebook</a>
            <a href="#">📸 Instagram</a>
            <a href="#">🐦 Twitter</a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/homestays">Our Homestays</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/login">Sign In</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Our Homestays</h4>
          <ul>
            <li><Link to="/homestays/1">Anderson 1</Link></li>
            <li><Link to="/homestays/2">Anderson 2</Link></li>
            <li><Link to="/homestays/3">Meru Prima</Link></li>
            <li><Link to="/homestays/4">Manjoi</Link></li>
            <li><Link to="/homestays/5">Bandar Baru Putra</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p>📍 Ipoh, Perak, Malaysia</p>
          <p>📞 +60 11-1234 5678</p>
          <p>✉️ hello@zamanss.com.my</p>
          <p>🕐 Mon–Sun: 8am – 10pm</p>
        </div>

      </div>
      <div className="footer-bottom">
        <p>© {year} Zamanss Homestay. All rights reserved. Built with ❤️ in Malaysia.</p>
      </div>
    </footer>
  );
}

export default Footer;