import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api';
import './Homestays.css';

function Homestays() {
  const [homestays, setHomestays] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [sortBy,    setSortBy]    = useState('recommended');
  const [searchParams] = useSearchParams();

  // Ambil dates dari URL (kalau datang dari search)
  const checkin  = searchParams.get('checkin')  || '';
  const checkout = searchParams.get('checkout') || '';
  const guests    = searchParams.get('guests')  || '';

  // Build query string untuk pass ke detail page
  const dateParams = checkin && checkout
    ? `?checkin=${checkin}&checkout=${checkout}&guests=${guests}`
    : '';

  useEffect(() => {
    API.get('/homestays')
      .then(res => setHomestays(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...homestays].sort((a, b) => {
    if (sortBy === 'low')    return a.price_per_night - b.price_per_night;
    if (sortBy === 'high')   return b.price_per_night - a.price_per_night;
    if (sortBy === 'rating') return b.rating - a.rating;
    return a.id - b.id;
  });

  return (
    <>
      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="container">
          <p className="section-tag" style={{ color: 'rgba(255,255,255,0.7)' }}>Where to Stay</p>
          <h1>Our Homestays</h1>
          <p>{homestays.length} handpicked properties in Ipoh, Perak — each unique, all exceptional.</p>
        </div>
      </section>

      {/* HOMESTAY LIST */}
      <section className="homestays-page">
        <div className="container">

          {/* SEARCH DATES BANNER */}
          {checkin && checkout && (
            <div className="search-dates-banner">
              <span>
                Showing availability for <strong>{new Date(checkin).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}</strong>
                {' → '}
                <strong>{new Date(checkout).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                {' · '}{guests} guest{guests > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* FILTER BAR */}
          <div className="filter-bar">
            <div className="filter-left">
              <span>{homestays.length} homestays available</span>
            </div>
            <div className="filter-right">
              <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* LIST */}
          {loading ? (
            <div className="loading">Loading homestays...</div>
          ) : (
            <div className="homestay-list">
              {sorted.map(hs => {
                const amenities = hs.amenities ? hs.amenities.split(',').map(a => a.trim()) : [];
                return (
                  <div className="hs-list-card" key={hs.id}>
                    <div className="hs-list-img">
                      <img src={`/images/${hs.image}`} alt={hs.name}
                        onError={e => e.target.src = `https://placehold.co/500x340/e8f4f8/1a5276?text=${encodeURIComponent(hs.name)}`} />
                    </div>
                    <div className="hs-list-body">
                      <div className="hs-list-top">
                        <div>
                          <h2>{hs.name}</h2>
                          <p className="hs-location">📍 {hs.location}</p>
                        </div>
                        <div className="hs-rating">⭐ {hs.rating}</div>
                      </div>
                      <p className="hs-desc">{hs.description?.substring(0, 150)}...</p>
                      <div className="hs-amenities">
                        <span>🛏 {hs.rooms} Rooms</span>
                        <span>🛁 {hs.bathrooms} Bath</span>
                        <span>👥 Max {hs.max_guests} Guests</span>
                        {amenities.slice(0, 3).map((am, i) => (
                          <span key={i}>✅ {am}</span>
                        ))}
                      </div>
                      <div className="hs-list-footer">
                        <div className="hs-price">
                          RM {Math.round(hs.price_per_night)} <small>/ night</small>
                        </div>
                        <div className="hs-actions">
                          <Link to={`/homestays/${hs.id}${dateParams}`} className="btn-detail">View Details</Link>
                          <Link to={`/homestays/${hs.id}${dateParams}`} className="btn-book">Book Now</Link>
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
    </>
  );
}

export default Homestays;