<?php include 'includes/header.php'; ?>

<!-- HERO SECTION -->
<section class="hero">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <p class="hero-tag">🏡 Malaysia's Finest Homestays</p>
    <h1>Find Your <span>Perfect Stay</span></h1>
    <p class="hero-sub">Handpicked homestays that feel like home — comfort, warmth, and local charm.</p>

    <!-- SEARCH BAR -->
    <div class="search-box">
      <div class="search-field">
        <label>Homestay</label>
        <select>
          <option value="">All Homestays</option>
          <option>Anderson 1</option>
          <option>Anderson 2</option>
          <option>Meru</option>
          <option>Manjoi</option>
          <option>Bandar Baru Putra</option>
        </select>
      </div>
      <div class="search-divider"></div>
      <div class="search-field">
        <label>Check-in</label>
        <input type="date" id="checkin">
      </div>
      <div class="search-divider"></div>
      <div class="search-field">
        <label>Check-out</label>
        <input type="date" id="checkout">
      </div>
      <div class="search-divider"></div>
      <div class="search-field">
        <label>Guests</label>
        <select>
          <option>1 Guest</option>
          <option>2 Guests</option>
          <option>3 Guests</option>
          <option>4 Guests</option>
          <option>5+ Guests</option>
        </select>
      </div>
      <button class="search-btn" onclick="handleSearch()">Search</button>
    </div>
  </div>
</section>

<!-- STATS STRIP -->
<section class="stats-strip">
  <div class="stat-item">
    <span class="stat-num">5</span>
    <span class="stat-label">Homestays</span>
  </div>
  <div class="stat-item">
    <span class="stat-num">500+</span>
    <span class="stat-label">Happy Guests</span>
  </div>
  <div class="stat-item">
    <span class="stat-num">4.9★</span>
    <span class="stat-label">Average Rating</span>
  </div>
  <div class="stat-item">
    <span class="stat-num">3 yrs</span>
    <span class="stat-label">Of Service</span>
  </div>
</section>

<!-- HOMESTAYS SECTION -->
<section class="homestays" id="homestays">
  <div class="container">
    <div class="section-header">
      <p class="section-tag">Where to Stay</p>
      <h2>Our Homestays</h2>
      <p class="section-sub">Choose from our 5 carefully maintained properties — each unique, all exceptional.</p>
    </div>

    <div class="cards-grid">

      <!-- Card 1 -->
      <div class="homestay-card" data-aos="fade-up">
        <div class="card-img-wrap">
          <img src="images/homestay1.jpg" alt="Anderson 1" onerror="this.src='https://placehold.co/600x400/e8f4f8/1a5276?text=Anderson 1'">
          <span class="badge">Popular</span>
          <button class="wishlist-btn">♡</button>
        </div>
        <div class="card-body">
          <div class="card-top">
            <h3>Anderson 1</h3>
            <div class="rating">⭐ 4.9 <span>(38 reviews)</span></div>
          </div>
          <p class="card-location">📍 Ipoh, Perak</p>
          <p class="card-desc">A cozy retreat surrounded by lush gardens with modern amenities and warm hospitality.</p>
          <div class="card-features">
            <span>🛏 3 Rooms</span>
            <span>🛁 2 Bath</span>
            <span>📶 WiFi</span>
            <span>🅿️ Parking</span>
          </div>
          <div class="card-footer">
            <div class="price">RM 180 <small>/ night</small></div>
            <a href="booking.php?id=1" class="book-btn">Book Now</a>
          </div>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="homestay-card" data-aos="fade-up" data-aos-delay="100">
        <div class="card-img-wrap">
          <img src="images/homestay2.jpg" alt="Anderson 2" onerror="this.src='https://placehold.co/600x400/e8f8f0/1a5246?text=Anderson 2'">
          <button class="wishlist-btn">♡</button>
        </div>
        <div class="card-body">
          <div class="card-top">
            <h3>Anderson 2</h3>
            <div class="rating">⭐ 4.8 <span>(25 reviews)</span></div>
          </div>
          <p class="card-location">📍 Ipoh, Perak</p>
          <p class="card-desc">Spacious family home with a private pool and traditional Malay architecture.</p>
          <div class="card-features">
            <span>🛏 4 Rooms</span>
            <span>🛁 3 Bath</span>
            <span>🏊 Pool</span>
            <span>📶 WiFi</span>
          </div>
          <div class="card-footer">
            <div class="price">RM 250 <small>/ night</small></div>
            <a href="booking.php?id=2" class="book-btn">Book Now</a>
          </div>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="homestay-card" data-aos="fade-up" data-aos-delay="200">
        <div class="card-img-wrap">
          <img src="images/homestay3.jpg" alt="Meru" onerror="this.src='https://placehold.co/600x400/fdf3e8/7d6608?text=Meru'">
          <span class="badge badge-new">New</span>
          <button class="wishlist-btn">♡</button>
        </div>
        <div class="card-body">
          <div class="card-top">
            <h3>Meru</h3>
            <div class="rating">⭐ 4.7 <span>(12 reviews)</span></div>
          </div>
          <p class="card-location">📍 Ipoh, Perak</p>
          <p class="card-desc">A charming hilltop home with breathtaking views and a peaceful atmosphere.</p>
          <div class="card-features">
            <span>🛏 2 Rooms</span>
            <span>🛁 1 Bath</span>
            <span>🌄 Hill View</span>
            <span>📶 WiFi</span>
          </div>
          <div class="card-footer">
            <div class="price">RM 150 <small>/ night</small></div>
            <a href="booking.php?id=3" class="book-btn">Book Now</a>
          </div>
        </div>
      </div>

      <!-- Card 4 -->
      <div class="homestay-card" data-aos="fade-up" data-aos-delay="300">
        <div class="card-img-wrap">
          <img src="images/homestay4.jpg" alt="Manjoi" onerror="this.src='https://placehold.co/600x400/f8e8f4/6c1a72?text=Manjoi'">
          <button class="wishlist-btn">♡</button>
        </div>
        <div class="card-body">
          <div class="card-top">
            <h3>Manjoi</h3>
            <div class="rating">⭐ 4.9 <span>(44 reviews)</span></div>
          </div>
          <p class="card-location">📍 Ipoh, Perak</p>
          <p class="card-desc">Modern interiors with a lush garden — perfect for couples and small families.</p>
          <div class="card-features">
            <span>🛏 3 Rooms</span>
            <span>🛁 2 Bath</span>
            <span>🌿 Garden</span>
            <span>🅿️ Parking</span>
          </div>
          <div class="card-footer">
            <div class="price">RM 200 <small>/ night</small></div>
            <a href="booking.php?id=4" class="book-btn">Book Now</a>
          </div>
        </div>
      </div>

      <!-- Card 5 -->
      <div class="homestay-card" data-aos="fade-up" data-aos-delay="400">
        <div class="card-img-wrap">
          <img src="images/homestay5.jpg" alt="Bandar Baru Putra" onerror="this.src='https://placehold.co/600x400/f8e8e8/721a1a?text=Bandar Baru Putra'">
          <span class="badge badge-sale">Best Value</span>
          <button class="wishlist-btn">♡</button>
        </div>
        <div class="card-body">
          <div class="card-top">
            <h3>Bandar Baru Putra</h3>
            <div class="rating">⭐ 4.8 <span>(31 reviews)</span></div>
          </div>
          <p class="card-location">📍 Ipoh, Perak</p>
          <p class="card-desc">Budget-friendly without compromising comfort — ideal for large group getaways.</p>
          <div class="card-features">
            <span>🛏 5 Rooms</span>
            <span>🛁 3 Bath</span>
            <span>📶 WiFi</span>
            <span>🅿️ Parking</span>
          </div>
          <div class="card-footer">
            <div class="price">RM 130 <small>/ night</small></div>
            <a href="booking.php?id=5" class="book-btn">Book Now</a>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- WHY CHOOSE US -->
<section class="why-us">
  <div class="container">
    <div class="section-header">
      <p class="section-tag">Why Us</p>
      <h2>The Zamanss Difference</h2>
    </div>
    <div class="why-grid">
      <div class="why-card">
        <div class="why-icon">🏡</div>
        <h4>Handpicked Properties</h4>
        <p>Every homestay is personally vetted for cleanliness, safety, and comfort.</p>
      </div>
      <div class="why-card">
        <div class="why-icon">📅</div>
        <h4>Easy Booking</h4>
        <p>Simple and fast booking process — confirmed in minutes, no hassle.</p>
      </div>
      <div class="why-card">
        <div class="why-icon">💬</div>
        <h4>24/7 Support</h4>
        <p>Our friendly team is always ready to assist you before and during your stay.</p>
      </div>
      <div class="why-card">
        <div class="why-icon">🔒</div>
        <h4>Secure Payment</h4>
        <p>Your bookings and payments are fully protected and encrypted.</p>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="testimonials">
  <div class="container">
    <div class="section-header">
      <p class="section-tag">Reviews</p>
      <h2>What Our Guests Say</h2>
    </div>
    <div class="testi-grid">
      <div class="testi-card">
        <div class="stars">⭐⭐⭐⭐⭐</div>
        <p>"Absolutely loved our stay at Homestay Melati! The place was spotless and the host was incredibly warm. Will definitely come back!"</p>
        <div class="testi-author">
          <div class="author-avatar">A</div>
          <div>
            <strong>Amirah Hassan</strong>
            <span>Kuala Lumpur</span>
          </div>
        </div>
      </div>
      <div class="testi-card">
        <div class="stars">⭐⭐⭐⭐⭐</div>
        <p>"Homestay Seroja was a dream for our family trip. The pool was amazing and the kids had a blast. Highly recommended!"</p>
        <div class="testi-author">
          <div class="author-avatar">R</div>
          <div>
            <strong>Razif Ahmad</strong>
            <span>Johor Bahru</span>
          </div>
        </div>
      </div>
      <div class="testi-card">
        <div class="stars">⭐⭐⭐⭐⭐</div>
        <p>"Booking was so easy and the homestay exceeded our expectations. Great value for money. Already planning our next trip!"</p>
        <div class="testi-author">
          <div class="author-avatar">S</div>
          <div>
            <strong>Sarah Lim</strong>
            <span>Penang</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA BANNER -->
<section class="cta-banner">
  <div class="cta-content">
    <h2>Ready for Your Next Getaway?</h2>
    <p>Book your stay today and enjoy a warm, homely experience in the heart of Perak.</p>
    <a href="#homestays" class="cta-btn">Browse Homestays</a>
  </div>
</section>

<?php include 'includes/footer.php'; ?>