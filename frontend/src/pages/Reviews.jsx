import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './Reviews.css';

function StarRating({ value, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star-btn ${(hover || value) >= star ? 'filled' : ''}`}
          onClick={() => !readOnly && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          disabled={readOnly}
        >
          ★
        </button>
      ))}
      {value > 0 && (
        <span className="star-label">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
}

function Reviews() {
  const [trips,     setTrips]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [forms,     setForms]     = useState({});
  const [success,   setSuccess]   = useState(null);
  const [error,     setError]     = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || !token) { navigate('/login'); return; }

    API.get('/reviews/my-trips', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setTrips(res.data);
        // Pre-fill forms with existing reviews
        const initialForms = {};
        res.data.forEach(t => {
          initialForms[t.homestay_id] = {
            rating:  t.rating  || 0,
            comment: t.comment || '',
          };
        });
        setForms(initialForms);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (homestay_id) => {
    const form = forms[homestay_id];
    if (!form?.rating) return setError('Please select a star rating.');

    setSubmitting(homestay_id);
    setError(null);

    try {
      await API.post('/reviews', {
        homestay_id,
        rating:  form.rating,
        comment: form.comment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(homestay_id);
      // Update trips to show review
      setTrips(prev => prev.map(t =>
        t.homestay_id === homestay_id
          ? { ...t, review_id: 1, rating: form.rating, comment: form.comment }
          : t
      ));

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setSubmitting(null);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const getNights = (checkin, checkout) =>
    Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000);

  return (
    <>
      {/* HERO */}
      <section className="page-hero">
        <div className="container">
          <p className="section-tag" style={{color:'rgba(255,255,255,0.7)'}}>Guest Portal</p>
          <h1>My Reviews</h1>
          <p>Share your experience and help other guests find their perfect stay.</p>
        </div>
      </section>

      <section className="reviews-page">
        <div className="container">

          {loading ? (
            <div className="loading">Loading your trips...</div>
          ) : trips.length === 0 ? (
            <div className="no-trips">
              <div className="no-trips-icon">✈️</div>
              <h2>No completed trips yet</h2>
              <p>Once your booking is confirmed and stay is completed, you can leave a review here.</p>
            </div>
          ) : (
            <div className="reviews-list">
              {/* GROUP by homestay — show unique homestays */}
              {Array.from(new Map(trips.map(t => [t.homestay_id, t])).values()).map(trip => {
                const form    = forms[trip.homestay_id] || { rating: 0, comment: '' };
                const reviewed = trip.review_id !== null;
                const isSuccess = success === trip.homestay_id;

                return (
                  <div className="review-card" key={trip.homestay_id}>

                    {/* HOMESTAY INFO */}
                    <div className="review-card-top">
                      <div className="review-hs-img">
                        <img src={`/images/${trip.image}`} alt={trip.homestay_name}
                          onError={e => e.target.src = `https://placehold.co/120x90/e8f4f8/1a5276?text=HS`} />
                      </div>
                      <div className="review-hs-info">
                        <h3>{trip.homestay_name}</h3>
                        <p className="review-location">📍 {trip.location}</p>
                        <div className="review-trip-details">
                          <span>📅 {formatDate(trip.checkin_date)} → {formatDate(trip.checkout_date)}</span>
                          <span>🌙 {getNights(trip.checkin_date, trip.checkout_date)} nights</span>
                          <span>👥 {trip.num_guests} guests</span>
                        </div>
                      </div>
                      <div className="review-status-tag">
                        {reviewed
                          ? <span className="tag-reviewed">✅ Reviewed</span>
                          : <span className="tag-pending">⭐ Pending Review</span>
                        }
                      </div>
                    </div>

                    {/* REVIEW FORM */}
                    <div className="review-form-section">
                      <h4>{reviewed ? 'Your Review' : 'Write a Review'}</h4>

                      {isSuccess && (
                        <div className="alert alert-success">
                          ✅ {reviewed ? 'Review updated!' : 'Review submitted! Thank you!'}
                        </div>
                      )}

                      {error && submitting === null && (
                        <div className="alert alert-error">⚠️ {error}</div>
                      )}

                      <div className="review-form">
                        <div className="form-group">
                          <label>Rating</label>
                          <StarRating
                            value={form.rating}
                            onChange={val => setForms(prev => ({
                              ...prev,
                              [trip.homestay_id]: { ...prev[trip.homestay_id], rating: val }
                            }))}
                          />
                        </div>

                        <div className="form-group">
                          <label>Your Review <span style={{fontWeight:400, color:'var(--text-light)'}}>(optional)</span></label>
                          <textarea
                            rows={4}
                            placeholder="Share your experience — what did you love? Any suggestions?"
                            value={form.comment}
                            onChange={e => setForms(prev => ({
                              ...prev,
                              [trip.homestay_id]: { ...prev[trip.homestay_id], comment: e.target.value }
                            }))}
                          />
                        </div>

                        <button
                          className="btn-submit-review"
                          onClick={() => handleSubmit(trip.homestay_id)}
                          disabled={submitting === trip.homestay_id || !form.rating}
                        >
                          {submitting === trip.homestay_id
                            ? '⏳ Submitting...'
                            : reviewed ? '✏️ Update Review' : '⭐ Submit Review'
                          }
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>
    </>
  );
}

export default Reviews;