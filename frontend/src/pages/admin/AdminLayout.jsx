import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import './AdminLayout.css';
import { LayoutDashboard, CalendarDays, Home, Users, RefreshCcw, Star, BarChart2, LogOut } from 'lucide-react';
import API from '../../api';

function AdminLayout() {
  const [user,        setUser]        = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [badges,      setBadges]      = useState({ bookings: 0, refunds: 0, reviews: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'admin') { navigate('/'); return; }
    setUser(u);
  }, []);

  // Fetch badge counts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      API.get('/admin/bookings',  { headers }),
      API.get('/refunds/admin',   { headers }),
      API.get('/admin/reviews',   { headers }),
    ]).then(([bookRes, refundRes, reviewRes]) => {
      setBadges({
        bookings: bookRes.data.filter(b => b.status === 'pending').length,
        refunds:  refundRes.data.filter(r => r.status === 'pending').length,
        reviews: reviewRes.data.filter(r => !r.is_published).length,
      });
    }).catch(() => {});
  }, [location.pathname]); // refresh badge bila tukar page

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const navItems = [
    { path: '/admin',           label: 'Dashboard', icon: <LayoutDashboard size={18} />, badge: null },
    { path: '/admin/bookings',  label: 'Bookings',  icon: <CalendarDays    size={18} />, badge: 'bookings' },
    { path: '/admin/homestays', label: 'Homestays', icon: <Home            size={18} />, badge: null },
    { path: '/admin/users',     label: 'Users',     icon: <Users           size={18} />, badge: null },
    { path: '/admin/refunds',   label: 'Refunds',   icon: <RefreshCcw      size={18} />, badge: 'refunds' },
    { path: '/admin/reviews',   label: 'Reviews',   icon: <Star            size={18} />, badge: 'reviews' },
    { path: '/admin/reports',   label: 'Reports',   icon: <BarChart2       size={18} />, badge: null },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  if (!user) return null;

  return (
    <div className="admin-wrapper">

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <img
              src="/images/logo.png"
              alt="Zamanss"
              style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
            />
            {sidebarOpen && <span>Zamanss</span>}
          </Link>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => {
            const badgeCount = item.badge ? badges[item.badge] : 0;
            return (
              <Link key={item.path} to={item.path}
                className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}>
                <span className="sidebar-icon">{item.icon}</span>
                {sidebarOpen && <span className="sidebar-label">{item.label}</span>}
                {badgeCount > 0 && (
                  <span className="sidebar-badge">{badgeCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className={`admin-profile ${!sidebarOpen ? 'mini' : ''}`}>
            <div className="admin-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="admin-info">
                <strong>{user.name}</strong>
                <small>Administrator</small>
              </div>
            )}
          </div>
          <button className="sidebar-signout" onClick={handleLogout}>
            <LogOut size={18} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <h1 className="admin-page-title">
              {navItems.find(n => isActive(n.path))?.icon}{' '}
              {navItems.find(n => isActive(n.path))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="admin-header-right">
            <Link to="/" className="btn-view-site">View Site</Link>
            <span className="admin-badge">Admin</span>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>

    </div>
  );
}

export default AdminLayout;