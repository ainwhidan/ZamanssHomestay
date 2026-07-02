import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import './Home.css';

function Home() {
  const [homestays, setHomestays] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search, setSearch] = useState({
    location: 'All',
    checkin:  '',
    checkout: '',
    guests:   '1',
  });

  const navigate  = useNavigate();
  const today     = new Date().toISOString().split('T')[0];

  useEffect(() => {
    API.get('/homestays')
      .then(res => setHomestays(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
  if (!search.checkin || !search.checkout) {
    alert('Please select check-in and check-out dates.');
    return;
  }

  const params = `checkin=${search.checkin}&checkout=${search.checkout}&guests=${search.guests}`;

  // All Homestays → pergi listing page, bawa dates sekali
  if (search.location === 'All Homestays') {
    navigate(`/homestays?${params}`);
    return;
  }

  // Specific homestay → pergi detail page terus
  const selected = homestays.find(hs => hs.name === search.location);
  if (selected) {
    navigate(`/homestays/${selected.id}?${params}`);
    return;
  }

  navigate(`/homestays?${params}`);
};

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="hero-tag">🏡 Malaysia's Finest Homestays</p>
          <h1>Find Your <span>Perfect Stay</span></h1>
          <p className="hero-sub">Handpicked homestays that feel like home — comfort, warmth, and local charm.</p>

          {/* SEARCH BOX */}
          <div className="search-box">
            <div className="search-field">
              <label>Homestay</label>
              <select value={search.location} onChange={e => setSearch({...search, location: e.target.value})}>
                <option>All Homestays</option>
                {homestays.map(hs => (
                  <option key={hs.id}>{hs.name}</option>
                ))}
              </select>
            </div>
            <div className="search-divider"></div>
            <div className="search-field">
              <label>Check-in</label>
              <input type="date" min={today}
                value={search.checkin}
                onChange={e => setSearch({...search, checkin: e.target.value})} />
            </div>
            <div className="search-divider"></div>
            <div className="search-field">
              <label>Check-out</label>
              <input type="date" min={search.checkin || today}
                value={search.checkout}
                onChange={e => setSearch({...search, checkout: e.target.value})} />
            </div>
            <div className="search-divider"></div>
           <div className="search-field">
              <label>Guests</label>
              <input
                type="number"
                min="1"
                max="20"
                value={search.guests}
                placeholder="1"
                onChange={e => setSearch({...search, guests: e.target.value})}
              />
            </div>
            <button className="search-btn" onClick={handleSearch}>Search</button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-strip">
        <div className="stat-item"><span className="stat-num">5</span><span className="stat-label">Homestays</span></div>
        <div className="stat-item"><span className="stat-num">500+</span><span className="stat-label">Happy Guests</span></div>
        <div className="stat-item"><span className="stat-num">4.9★</span><span className="stat-label">Average Rating</span></div>
        <div className="stat-item"><span className="stat-num">3 yrs</span><span className="stat-label">Of Service</span></div>
      </section>

      {/* HOMESTAYS */}
      <section className="homestays" id="homestays">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">Where to Stay</p>
            <h2>Our Homestays</h2>
            <p className="section-sub">Choose from our 5 carefully maintained properties.</p>
          </div>

          {loading ? (
            <div className="loading">Loading homestays...</div>
          ) : (
            <div className="cards-grid">
              {homestays.map(hs => (
                <div className="homestay-card" key={hs.id}>
                  <div className="card-img-wrap">
                    <img src={`/images/${hs.image}`} alt={hs.name}
                      onError={e => e.target.src = `https://placehold.co/600x400/e8f4f8/1a5276?text=${encodeURIComponent(hs.name)}`} />
                  </div>
                  <div className="card-body">
                    <div className="card-top">
                      <h3>{hs.name}</h3>
                      <div className="rating">⭐ {hs.rating}</div>
                    </div>
                    <p className="card-location">📍 {hs.location}</p>
                    <p className="card-desc">{hs.description?.substring(0, 100)}...</p>
                    <div className="card-features">
                      <span>🛏 {hs.rooms} Rooms</span>
                      <span>🛁 {hs.bathrooms} Bath</span>
                      <span>👥 Max {hs.max_guests}</span>
                    </div>
                    <div className="card-footer">
                      <div className="price">RM {Math.round(hs.price_per_night)} <small>/ night</small></div>
                      <Link to={`/homestays/${hs.id}`} className="book-btn">Book Now</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY US */}
      <section className="why-us">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">Why Us</p>
            <h2>The Zamanss Difference</h2>
          </div>
          <div className="why-grid">
            {[
              { title: 'Handpicked Properties',  desc: 'Every homestay is personally vetted for cleanliness, safety, and comfort.' },
              { title: 'Easy Booking',           desc: 'Simple and fast booking process — confirmed in minutes, no hassle.' },
              { title: '24/7 Support',           desc: 'Our friendly team is always ready to assist you before and during your stay.' },
              { title: 'Secure Payment',         desc: 'Your bookings and payments are fully protected and encrypted.' },
            ].map((item, i) => (
              <div className="why-card" key={i}>
                <div className="why-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">Reviews</p>
            <h2>What Our Guests Say</h2>
          </div>
          <div className="testi-grid">
            {[
              { name: 'Amirah Hassan', loc: 'Kuala Lumpur', initial: 'A', text: 'Absolutely loved our stay at Anderson 1! The place was spotless and the host was incredibly warm.' },
              { name: 'Razif Ahmad',   loc: 'Johor Bahru',  initial: 'R', text: 'Anderson 2 was a dream for our family trip. The pool was amazing and the kids had a blast!' },
              { name: 'Sarah Lim',     loc: 'Penang',       initial: 'S', text: 'Booking was so easy and the homestay exceeded our expectations. Great value for money!' },
            ].map((t, i) => (
              <div className="testi-card" key={i}>
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p>"{t.text}"</p>
                <div className="testi-author">
                  <div className="author-avatar">{t.initial}</div>
                  <div><strong>{t.name}</strong><span>{t.loc}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready for Your Next Getaway?</h2>
          <p>Book your stay today and enjoy a warm, homely experience in the heart of Perak.</p>
          <Link to="/homestays" className="cta-btn">Browse Homestays</Link>
        </div>
      </section>
    </>
  );
}

export default Home;