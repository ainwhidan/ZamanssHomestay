import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import API from '../api';
import './HomestayDetail.css';

const MAPS = {
  1: { lat: 4.5975, lng: 101.0901 },
  2: { lat: 4.5985, lng: 101.0911 },
  3: { lat: 4.6320, lng: 101.0732 },
  4: { lat: 4.6512, lng: 101.1023 },
  5: { lat: 4.5812, lng: 101.1145 },
};

const RULES = [
  'No smoking inside the house',
  'No loud music after 11pm',
  'No additional guests without prior notice',
  'Keep the property clean and tidy',
  'Check-in: 3:00 PM | Check-out: 12:00 PM',
  'Pets are not allowed',
];

const ICONS = {
  'WiFi': '📶', 'Parking': '🅿️', 'Air-cond': '❄️',
  'Pool': '🏊', 'Kitchen': '🍳', 'Garden': '🌿',
  'Hill View': '🌄', 'BBQ': '🔥', 'Theatre': '🎬',
  'Porch': '🏡', 'TV': '📺',
};

function HomestayDetail() {
  const { id }         = useParams();
  const [searchParams] = useSearchParams();

  const urlCheckin  = searchParams.get('checkin')  || '';
  const urlCheckout = searchParams.get('checkout') || '';
  const urlGuests   = parseInt(searchParams.get('guests') || 1);

  const [hs,          setHs]          = useState(null);
  const [others,      setOthers]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [mainImg,     setMainImg]     = useState(0);
  const [checkin,     setCheckin]     = useState(urlCheckin);
  const [checkout,    setCheckout]    = useState(urlCheckout);
  const [guests,      setGuests]      = useState(urlGuests);
  const [nights,      setNights]      = useState(0);
  const [unavailable, setUnavailable] = useState(false);
  const [checking,    setChecking]    = useState(false);

  // ===========================
  // REVIEWS / RATING
  // ===========================
  const [reviews,        setReviews]        = useState([]);
  const [reviewsLoading,  setReviewsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  // ===========================
  // FETCH HOMESTAY DATA
  // ===========================
  useEffect(() => {
    setLoading(true);
    API.get(`/homestays/${id}`)
      .then(res => setHs(res.data))
      .catch(() => window.location.href = '/homestays')
      .finally(() => setLoading(false));

    API.get('/homestays')
      .then(res => setOthers(res.data.filter(h => h.id !== parseInt(id)).slice(0, 4)));
  }, [id]);

  // ===========================
  // FETCH REVIEWS (published only)
  // ===========================
  useEffect(() => {
    setReviewsLoading(true);
    API.get(`/reviews/homestay/${id}`)
      .then(res => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  // ===========================
  // CHECK AVAILABILITY
  // ===========================
  useEffect(() => {
    if (checkin && checkout) {
      const n = Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000);
      setNights(n > 0 ? n : 0);

      setChecking(true);
      API.get(`/bookings/availability?homestay_id=${id}`)
        .then(res => {
          const clash = res.data.some(b =>
            new Date(checkin)  < new Date(b.checkout_date) &&
            new Date(checkout) > new Date(b.checkin_date)
          );
          setUnavailable(clash);
        })
        .catch(() => setUnavailable(false))
        .finally(() => setChecking(false));
    } else {
      setNights(0);
      setUnavailable(false);
    }
  }, [checkin, checkout, id]);

  if (loading) return <div className="detail-loading">Loading...</div>;
  if (!hs)     return null;

  const amenities = hs.amenities ? hs.amenities.split(',').map(a => a.trim()) : [];
  const baseImg   = hs.image?.replace(/\.[^.]+$/, '');
  const ext       = hs.image?.split('.').pop();
  const images    = [hs.image, `${baseImg}b.${ext}`, `${baseImg}c.${ext}`, `${baseImg}d.${ext}`];
  const map       = MAPS[id] || MAPS[1];
  const bookingUrl = `/booking?id=${id}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <>
      {/* BREADCRUMB + TITLE */}
      <section className="detail-hero">
        <div className="container">
          <div className="detail-breadcrumb">
            <Link to="/">Home</Link> ›
            <Link to="/homestays">Our Homestays</Link> ›
            <span>{hs.name}</span>
          </div>
          <div className="detail-title-row">
            <div>
              <h1>{hs.name}</h1>
              <div className="detail-meta">
                <span className="detail-rating">⭐ {hs.rating}</span>
                <span className="detail-location">📍 {hs.location}</span>
              </div>
            </div>
            <div className="detail-price-block">
              <div className="detail-price">RM {Math.round(hs.price_per_night)} <small>/ night</small></div>
              <Link to={bookingUrl} className="btn-book-now">Book Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="gallery-section">
        <div className="container">
          <div className="gallery-grid">
            <div className="gallery-main">
              <img src={`/images/${images[mainImg]}`} alt={hs.name}
                onError={e => e.target.src = `https://placehold.co/800x500/e8f4f8/1a5276?text=${encodeURIComponent(hs.name)}`} />
            </div>
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <div key={i} className={`thumb ${mainImg === i ? 'active' : ''}`} onClick={() => setMainImg(i)}>
                  <img src={`/images/${img}`} alt={`Photo ${i + 1}`}
                    onError={e => e.target.src = `https://placehold.co/200x140/e8f4f8/1a5276?text=Photo+${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DETAIL BODY */}
      <section className="detail-body">
        <div className="container">
          <div className="detail-layout">

            {/* LEFT */}
            <div className="detail-main-col">

              <div className="quick-info">
                <div className="quick-info-item"><span className="qi-icon">🛏</span><div><strong>{hs.rooms} Rooms</strong><small>Bedrooms</small></div></div>
                <div className="quick-info-item"><span className="qi-icon">🛁</span><div><strong>{hs.bathrooms} Bath</strong><small>Bathrooms</small></div></div>
                <div className="quick-info-item"><span className="qi-icon">👥</span><div><strong>{hs.max_guests} Guests</strong><small>Max capacity</small></div></div>
                <div className="quick-info-item"><span className="qi-icon">🏡</span><div><strong>Entire Home</strong><small>Private property</small></div></div>
              </div>

              <div className="detail-section">
                <h2>About This Homestay</h2>
                <p>{hs.description}</p>
              </div>

              <div className="detail-section">
                <h2>Amenities</h2>
                <div className="amenities-grid">
                  {amenities.map((a, i) => {
                    const icon = Object.entries(ICONS).find(([k]) => a.toLowerCase().includes(k.toLowerCase()))?.[1] || '✅';
                    return <div className="amenity-item" key={i}>{icon} {a}</div>;
                  })}
                </div>
              </div>

              <div className="detail-section">
                <h2>House Rules</h2>
                <ul className="rules-list">
                  {RULES.map((r, i) => <li key={i}>✅ {r}</li>)}
                </ul>
              </div>

              <div className="detail-section">
                <h2>Guest Reviews {reviews.length > 0 && `(${reviews.length})`}</h2>

                {reviewsLoading ? (
                  <p>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p className="no-reviews">No reviews yet. Be the first to stay and share your experience!</p>
                ) : (
                  <>
                    <div className="rating-summary">
                      <span className="rating-summary-score">⭐ {avgRating}</span>
                      <span className="rating-summary-count">based on {reviews.length} review{reviews.length > 1 ? 's' : ''}</span>
                    </div>

                    <div className="review-list">
                      {reviews.map(r => (
                        <div className="review-card" key={r.id}>
                          <div className="review-card-head">
                            <strong>{r.user_name}</strong>
                            <span className="review-stars">{'⭐'.repeat(r.rating)}</span>
                          </div>
                          {r.comment && <p className="review-comment">{r.comment}</p>}
                          <small className="review-date">
                            {new Date(r.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </small>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="detail-section">
                <h2>Location</h2>
                <p className="map-address">📍 {hs.location}</p>
                <div className="map-container">
                  <iframe
                    src={`https://maps.google.com/maps?q=${map.lat},${map.lng}&z=15&output=embed`}
                    width="100%" height="380" style={{border: 0}} allowFullScreen loading="lazy"
                    title="Homestay Location">
                  </iframe>
                </div>
              </div>

            </div>

            {/* RIGHT — BOOKING WIDGET */}
            <div className="detail-side-col">
              <div className="booking-widget">
                <div className="widget-price">RM {Math.round(hs.price_per_night)} <small>/ night</small></div>
                <div className="widget-rating">⭐ {hs.rating} · Max {hs.max_guests} guests</div>

                <div className="widget-form">
                  <div className="widget-dates">
                    <div className="widget-field">
                      <label>Check-in</label>
                      <input type="date" min={today} value={checkin}
                        onChange={e => {
                          setCheckin(e.target.value);
                          if (checkout && checkout <= e.target.value) setCheckout('');
                        }} />
                    </div>
                    <div className="widget-field">
                      <label>Check-out</label>
                      <input type="date" min={checkin || today} value={checkout}
                        onChange={e => setCheckout(e.target.value)} />
                    </div>
                  </div>

                  <div className="widget-field full">
                    <label>Guests</label>
                    <select value={guests} onChange={e => setGuests(parseInt(e.target.value))}>
                      {Array.from({length: hs.max_guests}, (_, i) => i + 1).map(g => (
                        <option key={g} value={g}>{g} Guest{g > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  {nights > 0 && (
                    <div className="widget-total">
                      <div className="widget-calc">RM {Math.round(hs.price_per_night)} x {nights} night{nights > 1 ? 's' : ''}</div>
                      <div className="widget-grand">
                        <span>Total</span>
                        <strong>RM {Math.round(hs.price_per_night * nights)}</strong>
                      </div>
                    </div>
                  )}

                  {unavailable ? (
                    <div className="unavailable-msg">
                      <span>🚫 Not Available</span>
                      <small>These dates are already booked. Please choose different dates.</small>
                    </div>
                  ) : (
                    <Link to={bookingUrl}
                      className={`widget-book-btn ${checking ? 'disabled' : ''}`}
                      onClick={e => { if (checking || unavailable) e.preventDefault(); }}>
                      {checking ? 'Checking...' : 'Reserve Now'}
                    </Link>
                  )}
                  <p className="widget-note">You won't be charged yet</p>
                </div>
              </div>

              <div className="contact-host">
                <h4>Need help?</h4>
                <p>Contact us for special requests.</p>
                <a href="https://wa.me/601112345678" className="btn-whatsapp" target="_blank" rel="noreferrer">
                  💬 WhatsApp Us
                </a>
                <Link to="/contact" className="btn-contact-link">Or send us a message →</Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="other-homestays">
          <div className="container">
            <h2>Other Homestays You Might Like</h2>
            <div className="other-grid">
              {others.map(o => (
                <Link to={`/homestays/${o.id}`} className="other-card" key={o.id}>
                  <div className="other-img">
                    <img src={`/images/${o.image}`} alt={o.name}
                      onError={e => e.target.src = `https://placehold.co/300x200/e8f4f8/1a5276?text=${encodeURIComponent(o.name)}`} />
                  </div>
                  <div className="other-body">
                    <h4>{o.name}</h4>
                    <p>⭐ {o.rating} · RM {Math.round(o.price_per_night)}/night</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default HomestayDetail;