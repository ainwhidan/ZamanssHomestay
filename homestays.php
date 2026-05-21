<?php
session_start();
require_once 'includes/db.php';

$homestays = $pdo->query("SELECT * FROM homestays WHERE status = 'available' ORDER BY id ASC")->fetchAll();

include 'includes/header.php';
?>

<link rel="stylesheet" href="css/detail.css">

<div class="page-hero">
  <div class="container">
    <p class="section-tag">Where to Stay</p>
    <h1>Our Homestays</h1>
    <p><?= count($homestays) ?> handpicked properties in Ipoh, Perak — each unique, all exceptional.</p>
  </div>
</div>

<section class="homestays-page">
  <div class="container">

    <div class="filter-bar">
      <div class="filter-left">
        <span><?= count($homestays) ?> homestays available</span>
      </div>
      <div class="filter-right">
        <select class="filter-select" onchange="filterHomestays(this.value)">
          <option value="all">All Properties</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </div>

    <div class="homestay-list" id="homestayList">
      <?php foreach ($homestays as $hs):
        $amenities = array_map('trim', explode(',', $hs['amenities']));
      ?>
      <div class="hs-list-card" data-price="<?= $hs['price_per_night'] ?>" data-rating="<?= $hs['rating'] ?>">
        <div class="hs-list-img">
          <img src="images/<?= htmlspecialchars($hs['image']) ?>" alt="<?= htmlspecialchars($hs['name']) ?>"
            onerror="this.src='https://placehold.co/500x340/e8f4f8/1a5276?text=<?= urlencode($hs['name']) ?>'">
        </div>
        <div class="hs-list-body">
          <div class="hs-list-top">
            <div>
              <h2><?= htmlspecialchars($hs['name']) ?></h2>
              <p class="hs-location">📍 <?= htmlspecialchars($hs['location']) ?></p>
            </div>
            <div class="hs-rating">⭐ <?= $hs['rating'] ?></div>
          </div>
          <p class="hs-desc"><?= htmlspecialchars(substr($hs['description'], 0, 150)) ?>...</p>
          <div class="hs-amenities">
            <span>🛏 <?= $hs['rooms'] ?> Rooms</span>
            <span>🛁 <?= $hs['bathrooms'] ?> Bath</span>
            <span>👥 Max <?= $hs['max_guests'] ?> Guests</span>
            <?php foreach (array_slice($amenities, 0, 3) as $am): ?>
            <span>✅ <?= htmlspecialchars($am) ?></span>
            <?php endforeach; ?>
          </div>
          <div class="hs-list-footer">
            <div class="hs-price">RM <?= number_format($hs['price_per_night'], 0) ?> <small>/ night</small></div>
            <div class="hs-actions">
              <a href="homestay-detail.php?id=<?= $hs['id'] ?>" class="btn-detail">View Details</a>
              <a href="booking.php?id=<?= $hs['id'] ?>" class="btn-book">Book Now</a>
            </div>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>

  </div>
</section>

<script>
function filterHomestays(value) {
  const list  = document.getElementById('homestayList');
  const cards = Array.from(list.querySelectorAll('.hs-list-card'));
  cards.sort((a, b) => {
    if (value === 'low')    return a.dataset.price - b.dataset.price;
    if (value === 'high')   return b.dataset.price - a.dataset.price;
    if (value === 'rating') return b.dataset.rating - a.dataset.rating;
    return 0;
  });
  cards.forEach(c => list.appendChild(c));
}
</script>

<?php include 'includes/footer.php'; ?>