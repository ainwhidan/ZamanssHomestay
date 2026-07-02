import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import './MyBookings.css';

function RefundModal({ booking, onClose, onSubmit }) {
  const [form,    setForm]    = useState({ reason: '', bank_name: '', account_name: '', account_number: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async () => {
    if (!form.reason.trim())         return setError('Please provide a reason for your refund request.');
    if (!form.bank_name.trim())      return setError('Please enter your bank name.');
    if (!form.account_name.trim())   return setError('Please enter your account holder name.');
    if (!form.account_number.trim()) return setError('Please enter your account number.');

    setLoading(true);
    setError('');
    try {
      await onSubmit(booking.id, form);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit refund request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <h2>Request Refund</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {/* BOOKING INFO */}
          <div className="refund-booking-info">
            <p><strong>Homestay:</strong> {booking.homestay_name}</p>
            <p><strong>Check-in:</strong> {new Date(booking.checkin_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p><strong>Check-out:</strong> {new Date(booking.checkout_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p><strong>Total Paid:</strong> RM {parseFloat(booking.total_price).toFixed(0)}</p>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {/* REASON */}
          <div className="form-group">
            <label>Reason for Refund *</label>
            <textarea
              rows={3}
              placeholder="Please explain why you are requesting a refund..."
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
            />
          </div>

          {/* CUSTOMER BANK DETAILS */}
          <div className="refund-account-box">
            <h4>Your Refund Account Details</h4>
            <p>Please enter your bank account details. Refund will be transferred here upon approval.</p>

            <div className="form-group">
              <label>Bank Name *</label>
              <input
                type="text"
                placeholder="e.g. Maybank, CIMB, Public Bank"
                value={form.bank_name}
                onChange={e => setForm({ ...form, bank_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Account Holder Name *</label>
              <input
                type="text"
                placeholder="Full name as in bank account"
                value={form.account_name}
                onChange={e => setForm({ ...form, account_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Account Number *</label>
              <input
                type="text"
                placeholder="e.g. 1234567890"
                value={form.account_number}
                onChange={e => setForm({ ...form, account_number: e.target.value })}
              />
            </div>
          </div>

          <div className="refund-note">
            <p>Refund requests may take <strong>3–7 working days</strong> to process after approval. Our team will review your request and notify you via email.</p>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-cancel-refund" onClick={onClose}>Cancel</button>
          <button className="btn-submit-refund" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Refund Request'}
          </button>
        </div>

      </div>
    </div>
  );
}

function MyBookings() {
  const [bookings,    setBookings]    = useState([]);
  const [refunds,     setRefunds]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('all');
  const [refundModal, setRefundModal] = useState(null);
  const [success,     setSuccess]     = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || !token) { navigate('/login'); return; }

    API.get('/bookings/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBookings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    API.get('/refunds/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRefunds(res.data))
      .catch(() => setRefunds([]));

  }, []);

  const handleRefundSubmit = async (bookingId, form) => {
    await API.post('/refunds', {
      booking_id:     bookingId,
      reason:         form.reason,
      bank_name:      form.bank_name,
      account_name:   form.account_name,
      account_number: form.account_number,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRefunds(prev => [...prev, { booking_id: bookingId, status: 'pending' }]);
    setSuccess('Refund request submitted! We will get back to you within 3–7 working days.');
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await API.put(`/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch {
      alert('Failed to cancel booking.');
    }
  };

  const getRefundStatus = (bookingId) => refunds.find(r => r.booking_id === bookingId);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const getNights = (checkin, checkout) =>
    Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="section-tag" style={{ color: 'rgba(255,255,255,0.7)' }}>Guest Portal</p>
          <h1>My Bookings</h1>
          <p>Track and manage all your homestay reservations.</p>
        </div>
      </section>

      <section className="my-bookings-page">
        <div className="container">

          {success && (
            <div className="alert alert-success" style={{ marginBottom: '24px' }}>
              ✅ {success}
            </div>
          )}

          {/* FILTER TABS */}
          <div className="booking-filter-tabs">
            {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
              <button key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'all' && ` (${bookings.length})`}
                {f !== 'all' && ` (${bookings.filter(b => b.status === f).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading">Loading your bookings...</div>
          ) : filtered.length === 0 ? (
            <div className="no-bookings">
              <div className="no-bookings-icon">📭</div>
              <h2>No bookings found</h2>
              <p>{filter === 'all' ? "You haven't made any bookings yet." : `No ${filter} bookings.`}</p>
              <Link to="/homestays" className="btn-browse">Browse Homestays</Link>
            </div>
          ) : (
            <div className="bookings-list">
              {filtered.map(b => {
                const nights       = getNights(b.checkin_date, b.checkout_date);
                const refundStatus = getRefundStatus(b.id);

                return (
                  <div className="booking-card" key={b.id}>

                    <div className="booking-card-img">
                      <img
                        src={`/images/${b.image}`}
                        alt={b.homestay_name}
                        onError={e => e.target.src = `https://placehold.co/300x200/e8f4f8/1a5276?text=${encodeURIComponent(b.homestay_name)}`}
                      />
                      <span className={`status-badge ${b.status}`}>
                        {b.status === 'pending'   && 'Pending'}
                        {b.status === 'confirmed' && 'Confirmed'}
                        {b.status === 'cancelled' && 'Cancelled'}
                      </span>
                    </div>

                    <div className="booking-card-body">

                      <div className="booking-card-top">
                        <div>
                          <h3>{b.homestay_name}</h3>
                          <p className="booking-location">📍 {b.location}</p>
                        </div>
                        <div className="booking-id">#{b.id}</div>
                      </div>

                      <div className="booking-dates">
                        <div className="booking-date-item">
                          <small>Check-in</small>
                          <strong>{formatDate(b.checkin_date)}</strong>
                        </div>
                        <div className="booking-date-arrow">→</div>
                        <div className="booking-date-item">
                          <small>Check-out</small>
                          <strong>{formatDate(b.checkout_date)}</strong>
                        </div>
                        <div className="booking-date-item">
                          <small>Duration</small>
                          <strong>{nights} night{nights > 1 ? 's' : ''}</strong>
                        </div>
                        <div className="booking-date-item">
                          <small>Guests</small>
                          <strong>{b.num_guests}</strong>
                        </div>
                      </div>

                      <div className="booking-card-footer">
                        <div className="booking-total">
                          Total: <strong>RM {parseFloat(b.total_price).toFixed(0)}</strong>
                        </div>
                        <div className="booking-actions">

                          <Link to={`/homestays/${b.homestay_id}`} className="btn-view-hs">
                            View Homestay
                          </Link>

                          {b.status === 'pending' && (
                            <button className="btn-cancel" onClick={() => handleCancel(b.id)}>
                              Cancel
                            </button>
                          )}

                          {(b.status === 'confirmed' || b.status === 'cancelled') && (
                            refundStatus ? (
                              <span className={`refund-status-tag refund-${refundStatus.status}`}>
                                Refund: {refundStatus.status.charAt(0).toUpperCase() + refundStatus.status.slice(1)}
                              </span>
                            ) : (
                              <button className="btn-refund" onClick={() => setRefundModal(b)}>
                                Request Refund
                              </button>
                            )
                          )}

                          {b.status === 'confirmed' && (
                            <div className="confirmed-badge">Payment Verified</div>
                          )}

                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {refundModal && (
        <RefundModal
          booking={refundModal}
          onClose={() => setRefundModal(null)}
          onSubmit={handleRefundSubmit}
        />
      )}
    </>
  );
}

export default MyBookings;