import { useState, useEffect, useRef } from 'react';
import API from '../../api';

function BookingModal({ booking, onClose, onUpdate }) {
  const formatDate = (d) => new Date(d).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const nights = Math.ceil((new Date(booking.checkout_date) - new Date(booking.checkin_date)) / 86400000);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>

        <div className="modal-header">
          <h2>Booking #{booking.id}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {/* GUEST INFO */}
          <div className="booking-detail-section">
            <h4>Guest Information</h4>
            <div className="booking-detail-grid">
              <div className="booking-detail-item">
                <small>Full Name</small>
                <strong>{booking.user_name}</strong>
              </div>
              <div className="booking-detail-item">
                <small>Email</small>
                <strong>{booking.user_email}</strong>
              </div>
            </div>
          </div>

          {/* BOOKING INFO */}
          <div className="booking-detail-section">
            <h4>Booking Details</h4>
            <div className="booking-detail-grid">
              <div className="booking-detail-item">
                <small>Homestay</small>
                <strong>{booking.homestay_name}</strong>
              </div>
              <div className="booking-detail-item">
                <small>Location</small>
                <strong>{booking.location}</strong>
              </div>
              <div className="booking-detail-item">
                <small>Check-in</small>
                <strong>{formatDate(booking.checkin_date)}</strong>
              </div>
              <div className="booking-detail-item">
                <small>Check-out</small>
                <strong>{formatDate(booking.checkout_date)}</strong>
              </div>
              <div className="booking-detail-item">
                <small>Duration</small>
                <strong>{nights} night{nights > 1 ? 's' : ''}</strong>
              </div>
              <div className="booking-detail-item">
                <small>Guests</small>
                <strong>{booking.num_guests} pax</strong>
              </div>
              <div className="booking-detail-item">
                <small>Total Amount</small>
                <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                  RM {parseFloat(booking.total_price).toFixed(0)}
                </strong>
              </div>
              <div className="booking-detail-item">
                <small>Status</small>
                <span className={`badge badge-${booking.status}`}>{booking.status}</span>
              </div>
            </div>
          </div>

          {/* RECEIPT */}
          <div className="booking-detail-section">
            <h4>Payment Receipt</h4>
            {booking.receipt_image ? (
              <a href={`/receipts/${booking.receipt_image}`} target="_blank" rel="noreferrer"
                className="btn-sm btn-sm-primary" style={{ display: 'inline-block' }}>
                View Receipt
              </a>
            ) : (
              <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>No receipt uploaded.</p>
            )}
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-cancel-refund" onClick={onClose}>Close</button>
          {booking.status === 'pending' && (
            <>
              <button className="btn-sm btn-sm-success"
                onClick={() => { onUpdate(booking.id, 'confirmed'); onClose(); }}>
                Confirm Booking
              </button>
              <button className="btn-sm btn-sm-danger"
                onClick={() => { onUpdate(booking.id, 'cancelled'); onClose(); }}>
                Cancel Booking
              </button>
            </>
          )}
          {booking.status === 'confirmed' && (
            <button className="btn-sm btn-sm-danger"
              onClick={() => { onUpdate(booking.id, 'cancelled'); onClose(); }}>
              Cancel Booking
            </button>
          )}
          {booking.status === 'cancelled' && (
            <button className="btn-sm btn-sm-success"
              onClick={() => { onUpdate(booking.id, 'confirmed'); onClose(); }}>
              Restore Booking
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

function ActionDropdown({ booking, onUpdate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="action-dropdown" ref={ref}>
      <button className="action-dropdown-btn" onClick={() => setOpen(!open)}>
        Actions
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: '6px' }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="action-dropdown-menu">
          {booking.status === 'pending' && (
            <>
              <button onClick={() => { onUpdate(booking.id, 'confirmed'); setOpen(false); }}>
                Confirm
              </button>
              <button onClick={() => { onUpdate(booking.id, 'cancelled'); setOpen(false); }}
                style={{ color: '#dc2626' }}>
                Cancel
              </button>
            </>
          )}
          {booking.status === 'confirmed' && (
            <button onClick={() => { onUpdate(booking.id, 'cancelled'); setOpen(false); }}
              style={{ color: '#dc2626' }}>
              Cancel
            </button>
          )}
          {booking.status === 'cancelled' && (
            <button onClick={() => { onUpdate(booking.id, 'confirmed'); setOpen(false); }}>
              Restore
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AdminBookings() {
  const [bookings,      setBookings]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState('all');
  const [search,        setSearch]        = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    API.get('/admin/bookings', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBookings(res.data))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch {
      alert('Failed to update status.');
    }
  };

  const filtered = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => !search ||
      b.user_name.toLowerCase().includes(search.toLowerCase()) ||
      b.homestay_name.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div>
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h2>All Bookings ({filtered.length})</h2>
          <div className="admin-table-actions">
            <select className="admin-search" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input className="admin-search" placeholder="Search guest or homestay..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Guest</th>
                <th>Homestay</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-light)' }}>
                    No bookings found
                  </td>
                </tr>
              ) : filtered.map(b => (
                <tr key={b.id}>
                  <td><strong>#{b.id}</strong></td>
                  <td>
                    <button className="booking-name-btn" onClick={() => setSelectedBooking(b)}>
                      <strong>{b.user_name}</strong>
                      <small>{b.user_email}</small>
                    </button>
                  </td>
                  <td>{b.homestay_name}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td>
                    <ActionDropdown booking={b} onUpdate={updateStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={updateStatus}
        />
      )}
    </div>
  );
}

export default AdminBookings;