// AdminUsers.jsx
import { useState, useEffect } from 'react';
import API from '../../api';

export function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    API.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await API.delete(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch { alert('Failed to delete user.'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-header">
        <h2>All Users ({filtered.length})</h2>
        <input className="admin-search" placeholder="Search name or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? (
        <div style={{textAlign:'center', padding:'40px', color:'var(--text-light)'}}>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Bookings</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.phone || '—'}</td>
                <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                <td>{u.total_bookings}</td>
                <td>{formatDate(u.created_at)}</td>
                <td>
                  <div className="action-btns">
                    {u.role !== 'admin' && (
                      <button className="btn-sm btn-sm-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

 

// AdminReports.jsx
export function AdminReports() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [from,    setFrom]    = useState('');
  const [to,      setTo]      = useState('');
  const token = localStorage.getItem('token');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/reports?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch { alert('Failed to fetch report.'); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

  const printReport = () => window.print();

  return (
    <div>
      {/* FILTER */}
      <div className="admin-table-wrap" style={{marginBottom:'24px'}}>
        <div className="admin-table-header">
          <h2>📈 Generate Report</h2>
        </div>
        <div style={{padding:'24px', display:'flex', gap:'16px', alignItems:'flex-end', flexWrap:'wrap'}}>
          <div className="form-group" style={{flex:1, minWidth:'160px'}}>
            <label style={{fontSize:'0.82rem', fontWeight:600, color:'var(--dark)', display:'block', marginBottom:'6px'}}>From Date</label>
            <input type="date" className="admin-search" style={{width:'100%'}}
              value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="form-group" style={{flex:1, minWidth:'160px'}}>
            <label style={{fontSize:'0.82rem', fontWeight:600, color:'var(--dark)', display:'block', marginBottom:'6px'}}>To Date</label>
            <input type="date" className="admin-search" style={{width:'100%'}}
              value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <button className="btn-sm btn-sm-primary" style={{padding:'10px 24px', fontSize:'0.9rem'}}
            onClick={fetchReport} disabled={loading}>
            {loading ? 'Loading...' : 'Generate'}
          </button>
          {data && (
            <button className="btn-sm btn-sm-success" style={{padding:'10px 24px', fontSize:'0.9rem'}}
              onClick={printReport}>
              🖨️ Print
            </button>
          )}
        </div>
      </div>

      {data && (
        <>
          {/* SUMMARY */}
          <div className="stat-cards" style={{marginBottom:'24px'}}>
            <div className="stat-card">
              <div className="stat-card-icon blue">💰</div>
              <div className="stat-card-info">
                <small>Total Revenue</small>
                <strong>RM {parseFloat(data.totalRevenue).toLocaleString()}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon green">📅</div>
              <div className="stat-card-info">
                <small>Total Bookings</small>
                <strong>{data.bookings.length}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon yellow">✅</div>
              <div className="stat-card-info">
                <small>Confirmed</small>
                <strong>{data.bookings.filter(b => b.status === 'confirmed').length}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon red">❌</div>
              <div className="stat-card-info">
                <small>Cancelled</small>
                <strong>{data.bookings.filter(b => b.status === 'cancelled').length}</strong>
              </div>
            </div>
          </div>

          {/* BY HOMESTAY */}
          <div className="admin-table-wrap" style={{marginBottom:'24px'}}>
            <div className="admin-table-header"><h2>Revenue by Homestay</h2></div>
            <table>
              <thead>
                <tr><th>Homestay</th><th>Bookings</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                {data.byHomestay.map((h, i) => (
                  <tr key={i}>
                    <td><strong>{h.name}</strong></td>
                    <td>{h.bookings}</td>
                    <td><strong style={{color:'var(--primary)'}}>RM {parseFloat(h.revenue || 0).toLocaleString()}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BOOKINGS TABLE */}
          <div className="admin-table-wrap">
            <div className="admin-table-header"><h2>Booking Details</h2></div>
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
                {data.bookings.map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
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
        </>
      )}
    </div>
  );
}