import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { CalendarDays, User, Star, LayoutDashboard, LogOut } from 'lucide-react';

function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [user,         setUser]         = useState(null);

  const profileRef = useRef(null);
  const navigate   = useNavigate();
  const location   = useLocation();

  const homestays = [
    { id: 1, name: 'Anderson 1',        price: 180 },
    { id: 2, name: 'Anderson 2',        price: 180 },
    { id: 3, name: 'Meru Prima',        price: 250 },
    { id: 4, name: 'Manjoi',            price: 500 },
    { id: 5, name: 'Bandar Baru Putra', price: 650 },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      setUser(stored ? JSON.parse(stored) : null);
    } catch {
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setProfileOpen(false);
    navigate('/');
  };

  const initials = user
    ? (user.name || user.email || 'U')
        .trim().split(' ')
        .map(w => w[0]).join('')
        .toUpperCase().slice(0, 2)
    : '';

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

          <li
            className="nav-dropdown"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <Link to="/homestays" className="dropdown-toggle">
              Our Homestays <span className="arrow">▾</span>
            </Link>
            {dropdownOpen && (
              <ul className="dropdown-menu">
                {homestays.map(hs => (
                  <li key={hs.id}>
                    <Link to={`/homestays/${hs.id}`} onClick={() => setDropdownOpen(false)}>
                      
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

        {/* NAV ACTIONS */}
        <div className="nav-actions">
          {user ? (
            <div className="profile-wrap" ref={profileRef}>

              <button
                className="profile-btn"
                onClick={() => setProfileOpen(o => !o)}
                aria-expanded={profileOpen}
              >
                <div className="profile-avatar">{initials}</div>
                <span className="profile-name">{user.name || user.email}</span>
                <span className={`profile-chevron ${profileOpen ? 'open' : ''}`}>▾</span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="pd-header">
                    <span className="pd-fullname">{user.name || 'Guest'}</span>
                    <span className="pd-email">{user.email}</span>
                  </div>

                  <div className="pd-body">

                    {/* ADMIN ONLY */}
                    {user.role === 'admin' && (
                      <>
                        <Link to="/admin" className="pd-item" onClick={() => setProfileOpen(false)}>
                           <LayoutDashboard size={16} /> Admin Dashboard
                        </Link>
                        <div className="pd-sep" />
                      </>
                    )}

                    {/* GUEST ONLY */}
                    {user.role !== 'admin' && (
                      <Link to="/my-bookings" className="pd-item" onClick={() => setProfileOpen(false)}>
                        <CalendarDays size={16} /> My Bookings
                      </Link>
                    )}

                    <Link to="/profile" className="pd-item" onClick={() => setProfileOpen(false)}>
                      <User size={16} /> My Profile
                    </Link>

                    {user.role !== 'admin' && (
                    <>
                     <Link to="/reviews" className="pd-item" onClick={() => setProfileOpen(false)}>
                        <Star size={16} /> My Reviews
                     </Link>
                    </>
                    )}
                    <div className="pd-sep" />

                    <button className="pd-item pd-logout" onClick={handleLogout}>
                      <span className="pd-icon">↩</span> Sign Out
                    </button>

                  </div>
                </div>
              )}
            </div>
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