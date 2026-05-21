import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user,         setUser]         = useState(null);
  const navigate = useNavigate();

  const homestays = [
    { id: 1, name: 'Anderson 1',      rooms: 2, price: 180 },
    { id: 2, name: 'Anderson 2',      rooms: 2, price: 180 },
    { id: 3, name: 'Meru Prima',      rooms: 3, price: 250 },
    { id: 4, name: 'Manjoi',          rooms: 5, price: 500 },
    { id: 5, name: 'Bandar Baru Putra', rooms: 5, price: 650 },
  ];

  useEffect(() => {
    // Scroll effect
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Check logged in user
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">

        {/* LOGO */}
        <Link to="/" className="nav-logo">
          <img src="/images/logo.png" alt="Zamanss Homestay"
            onError={(e) => e.target.style.display = 'none'} />
          <span>Zamanss Homestay</span>
        </Link>

        {/* NAV LINKS */}
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>

          {/* DROPDOWN */}
          <li className="nav-dropdown"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}>
            <Link to="/homestays" className="dropdown-toggle">
              Our Homestays <span className="arrow">▾</span>
            </Link>
            {dropdownOpen && (
              <ul className="dropdown-menu">
                {homestays.map(hs => (
                  <li key={hs.id}>
                    <Link to={`/homestays/${hs.id}`} onClick={() => setDropdownOpen(false)}>
                      <span className="drop-icon">🏡</span>
                      <div>
                        <strong>{hs.name}</strong>
                        <small>RM {hs.price}/night</small>
                      </div>
                    </Link>
                  </li>
                ))}
                <li className="drop-divider"></li>
                <li>
                  <Link to="/homestays" className="view-all-link"
                    onClick={() => setDropdownOpen(false)}>
                    View All Homestays →
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li><Link to="/about"   onClick={() => setMenuOpen(false)}>About</Link></li>
          <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
        </ul>

        {/* AUTH BUTTONS */}
        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-user">👤 {user.name}</span>
              <button className="btn-login" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-login">Sign In</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </>
          )}
        </div>

        {/* HAMBURGER */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>

      </div>
    </nav>
  );
}

export default Navbar;