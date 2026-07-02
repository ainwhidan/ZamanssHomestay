import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api';
import './AdminLayout.css';

function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    API.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStats(res.data))
      .catch(err => {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
      Loading dashboard...
    </div>
  );

  if (!stats) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
      Failed to load dashboard.
    </div>
  );

  return (
    <div>

      {/* TOTAL REVENUE ONLY */}
      <div className="revenue-card">
        <div className="revenue-card-left">
          <small>Total Revenue</small>
          <strong>RM {parseFloat(stats.totalRevenue || 0).toLocaleString()}</strong>
        </div>
        <div className="revenue-card-right">
          <div className="revenue-stats-row">
            <div className="revenue-mini-stat">
              <span>{stats.totalBookings}</span>
              <small>Total Bookings</small>
            </div>
            <div className="revenue-mini-stat">
              <span>{stats.confirmedBookings}</span>
              <small>Confirmed</small>
            </div>
            <div className="revenue-mini-stat">
              <span>{stats.totalUsers}</span>
              <small>Guests</small>
            </div>
            <div className="revenue-mini-stat">
              <span>{stats.totalReviews}</span>
              <small>Reviews</small>
            </div>
          </div>
        </div>
      </div>

      {/* MONTHLY REVENUE */}
      {stats.monthlyRevenue?.length > 0 && (
        <div className="admin-table-wrap" style={{ marginBottom: '24px' }}>
          <div className="admin-table-header">
            <h2>Monthly Revenue (Last 6 Months)</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Bookings</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.monthlyRevenue.map((m, i) => (
                <tr key={i}>
                  <td><strong>{m.month}</strong></td>
                  <td>{m.bookings}</td>
                  <td><strong style={{ color: 'var(--primary)' }}>RM {parseFloat(m.revenue).toLocaleString()}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RECENT BOOKINGS */}
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h2>Recent Bookings</h2>
          <Link to="/admin/bookings" className="btn-sm btn-sm-primary">View All</Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Guest</th>
              <th>Homestay</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentBookings?.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '32px' }}>
                  No bookings yet
                </td>
              </tr>
            ) : stats.recentBookings?.map(b => (
              <tr key={b.id}>
                <td><strong>#{b.id}</strong></td>
                <td>{b.user_name}</td>
                <td>{b.homestay_name}</td>
                <td>{formatDate(b.checkin_date)}</td>
                <td>{formatDate(b.checkout_date)}</td>
                <td><strong>RM {parseFloat(b.total_price).toFixed(0)}</strong></td>
                <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default AdminDashboard;