import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Home, Users, Star, BarChart2, MapPin, Phone, Mail, Clock, ShieldCheck, KeyRound, MessageCircle, Send, FileText, Bookmark, CheckCircle, Clock3, Wallet } from 'lucide-react';
import API from '../api';
import './Profile.css';

function Profile() {
  const [user,        setUser]        = useState(null);
  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [editing,     setEditing]     = useState(false);
  const [changingPw,  setChangingPw]  = useState(false);
  const [form,        setForm]        = useState({});
  const [pwForm,      setPwForm]      = useState({ current: '', newPw: '', confirm: '' });
  const [success,     setSuccess]     = useState('');
  const [error,       setError]       = useState('');
  const [pwSuccess,   setPwSuccess]   = useState('');
  const [pwError,     setPwError]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token  = localStorage.getItem('token');
    if (!stored || !token) { navigate('/login'); return; }

    const u = JSON.parse(stored);
    setUser(u);
    setForm({ name: u.name, email: u.email, phone: u.phone || '' });

    if (u.role !== 'admin') {
      API.get('/bookings/my', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setBookings(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    setError(''); setSuccess('');
    if (!form.name || !form.email) return setError('Name and email are required.');
    try {
      const token = localStorage.getItem('token');
      await API.put('/auth/profile', form, { headers: { Authorization: `Bearer ${token}` } });
      const updatedUser = { ...user, ...form };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async () => {
    setPwError(''); setPwSuccess('');
    if (!pwForm.current) return setPwError('Please enter your current password.');
    if (!pwForm.newPw)   return setPwError('Please enter a new password.');
    if (pwForm.newPw.length < 8) return setPwError('New password must be at least 8 characters.');
    if (pwForm.newPw !== pwForm.confirm) return setPwError('Passwords do not match.');

    try {
      const token = localStorage.getItem('token');
      await API.put('/auth/change-password', {
        current_password: pwForm.current,
        new_password:     pwForm.newPw,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setPwSuccess('Password changed successfully!');
      setPwForm({ current: '', newPw: '', confirm: '' });
      setChangingPw(false);
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password.');
    }
  };

  if (loading || !user) return <div className="profile-loading">Loading...</div>;

  const totalSpent     = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + parseFloat(b.total_price), 0);
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const pendingCount   = bookings.filter(b => b.status === 'pending').length;

  return (
    <>
      {/* HERO */}
      <section className="profile-hero">
        <div className="container">
          <div className="profile-hero-content">
            <div className="profile-big-avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <div className="profile-hero-info">
              <h1>{user.name}</h1>
              <p>{user.email}</p>
              <span className={`profile-role-badge ${user.role}`}>
                {user.role === 'admin' ? 'Administrator' : 'Guest'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="profile-page">
        <div className="container">
          <div className="profile-layout">

            {/* LEFT */}
            <div className="profile-main">

              {success && <div className="alert alert-success">{success}</div>}
              {error   && <div className="alert alert-error">{error}</div>}

              {/* PERSONAL INFO */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h2>Personal Information</h2>
                  {!editing && (
                    <button className="btn-edit" onClick={() => setEditing(true)}>Edit</button>
                  )}
                </div>

                {editing ? (
                  <div className="profile-form">
                    <div className="profile-form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01X-XXXXXXX" />
                    </div>
                    <div className="profile-form-btns">
                      <button className="btn-cancel-edit" onClick={() => setEditing(false)}>Cancel</button>
                      <button className="btn-save" onClick={handleSave}>Save Changes</button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-info-grid">
                    <div className="profile-info-item"><small>Full Name</small><strong>{user.name}</strong></div>
                    <div className="profile-info-item"><small>Email Address</small><strong>{user.email}</strong></div>
                    <div className="profile-info-item"><small>Phone Number</small><strong>{user.phone || '—'}</strong></div>
                    <div className="profile-info-item"><small>Account Role</small><strong>{user.role === 'admin' ? 'Administrator' : 'Guest'}</strong></div>
                  </div>
                )}
              </div>

              {/* ADMIN — COMPANY INFO */}
              {user.role === 'admin' && (
                <>
                  <div className="profile-card">
                    <div className="profile-card-header">
                      <h2>Company Information</h2>
                    </div>
                    <div className="profile-info-grid">
                      <div className="profile-info-item"><small>Business Name</small><strong>Zamanss Homestay</strong></div>
                      <div className="profile-info-item"><small>Location</small><strong>Ipoh, Perak, Malaysia</strong></div>
                      <div className="profile-info-item"><small>Contact Email</small><strong>zamansshomestay@gmail.com</strong></div>
                      <div className="profile-info-item"><small>Contact Phone</small><strong>+60 11-1234 5678</strong></div>
                      <div className="profile-info-item"><small>Total Properties</small><strong>5 Homestays</strong></div>
                      <div className="profile-info-item"><small>Operating Hours</small><strong>Mon–Sun: 8am – 10pm</strong></div>
                    </div>
                  </div>

                  <div className="profile-card">
                    <div className="profile-card-header">
                      <h2>Admin Quick Access</h2>
                    </div>
                    <div className="admin-quick-links">
                      <Link to="/admin"           className="quick-link-card blue">  <LayoutDashboard size={22} /><strong>Dashboard</strong> <small>View stats</small></Link>
                      <Link to="/admin/bookings"  className="quick-link-card green"> <CalendarDays    size={22} /><strong>Bookings</strong>  <small>Manage bookings</small></Link>
                      <Link to="/admin/homestays" className="quick-link-card yellow"><Home            size={22} /><strong>Homestays</strong> <small>Edit listings</small></Link>
                      <Link to="/admin/users"     className="quick-link-card purple"><Users           size={22} /><strong>Users</strong>     <small>Manage accounts</small></Link>
                      <Link to="/admin/reviews"   className="quick-link-card teal">  <Star            size={22} /><strong>Reviews</strong>   <small>Manage reviews</small></Link>
                      <Link to="/admin/reports"   className="quick-link-card red">   <BarChart2       size={22} /><strong>Reports</strong>   <small>Generate reports</small></Link>
                    </div>
                  </div>
                </>
              )}

              {/* GUEST — BOOKING SUMMARY */}
              {user.role !== 'admin' && (
                <>
                  <div className="profile-card">
                    <div className="profile-card-header">
                      <h2>Booking Summary</h2>
                      <Link to="/my-bookings" className="btn-edit">View All</Link>
                    </div>
                    <div className="booking-summary-grid">
                      <div className="summary-stat-card"><FileText size={20} /><strong>{bookings.length}</strong><small>Total Bookings</small></div>
                      <div className="summary-stat-card"><CheckCircle size={20} /><strong>{confirmedCount}</strong><small>Confirmed</small></div>
                      <div className="summary-stat-card"><Clock3 size={20} /><strong>{pendingCount}</strong><small>Pending</small></div>
                      <div className="summary-stat-card"><Wallet size={20} /><strong>RM {totalSpent.toFixed(0)}</strong><small>Total Spent</small></div>
                    </div>

                    {bookings.length > 0 && (
                      <div className="recent-bookings-list">
                        <h3>Recent Bookings</h3>
                        {bookings.slice(0, 3).map(b => (
                          <div className="recent-booking-item" key={b.id}>
                            <div className="rbi-img">
                              <img src={`/images/${b.image}`} alt={b.homestay_name}
                                onError={e => e.target.src = `https://placehold.co/60x60/e8f4f8/1a5276?text=HS`} />
                            </div>
                            <div className="rbi-info">
                              <strong>{b.homestay_name}</strong>
                              <small>
                                {new Date(b.checkin_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })} →{' '}
                                {new Date(b.checkout_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </small>
                            </div>
                            <div className="rbi-right">
                              <strong>RM {parseFloat(b.total_price).toFixed(0)}</strong>
                              <span className={`status-pill ${b.status}`}>{b.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="profile-card">
                    <div className="profile-card-header"><h2>Quick Links</h2></div>
                    <div className="guest-quick-links">
                      <Link to="/homestays"  className="guest-link"><Home size={16} /> Browse Homestays</Link>
                      <Link to="/my-bookings" className="guest-link"><CalendarDays size={16} /> My Bookings</Link>
                      <Link to="/contact"    className="guest-link"><MessageCircle size={16} /> Contact Us</Link>
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* RIGHT SIDEBAR */}
            <div className="profile-sidebar">

              {/* ACCOUNT SECURITY */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h2>Account Security</h2>
                </div>

                {pwSuccess && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{pwSuccess}</div>}
                {pwError   && <div className="alert alert-error"   style={{ marginBottom: '16px' }}>{pwError}</div>}

                <div className="security-info">
                  <div className="security-item">
                    <ShieldCheck size={20} color="#16a34a" />
                    <div>
                      <strong>Email Verified</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>
                  <div className="security-item">
                    <KeyRound size={20} color="var(--primary)" />
                    <div>
                      <strong>Password</strong>
                      <small>••••••••</small>
                    </div>
                  </div>
                </div>

                {changingPw ? (
                  <div className="change-pw-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input type="password" placeholder="Enter current password"
                        value={pwForm.current}
                        onChange={e => setPwForm({ ...pwForm, current: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input type="password" placeholder="Minimum 8 characters"
                        value={pwForm.newPw}
                        onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input type="password" placeholder="Repeat new password"
                        value={pwForm.confirm}
                        onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
                    </div>
                    <div className="profile-form-btns">
                      <button className="btn-cancel-edit" onClick={() => { setChangingPw(false); setPwForm({ current: '', newPw: '', confirm: '' }); setPwError(''); }}>
                        Cancel
                      </button>
                      <button className="btn-save" onClick={handleChangePassword}>
                        Save Password
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="btn-change-pass" onClick={() => setChangingPw(true)}>
                    Change Password
                  </button>
                )}
              </div>

              {/* NEED HELP */}
              <div className="profile-card help-card">
                <h3>Need Help?</h3>
                <p>Contact our support team for any questions or issues.</p>
                <a href="https://wa.me/601112345678" className="btn-whatsapp-small" target="_blank" rel="noreferrer">
                  <MessageCircle size={15} /> WhatsApp Us
                </a>
                <Link to="/contact" className="btn-contact-small">
                  <Send size={15} /> Send Message
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Profile;