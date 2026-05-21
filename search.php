<?php
session_start();
require_once 'includes/db.php';

$location = $_GET['location'] ?? '';
$checkin  = $_GET['checkin']  ?? '';
$checkout = $_GET['checkout'] ?? '';
$guests   = (int)($_GET['guests'] ?? 1);

// Calculate nights
$nights = 0;
if ($checkin && $checkout) {
    $d1     = new DateTime($checkin);
    $d2     = new DateTime($checkout);
    $nights = (int)$d2->diff($d1)->days;
}

// Build query
$sql    = "SELECT * FROM homestays WHERE status = 'available' AND max_guests >= ?";
$params = [$guests];

if ($location && $location !== 'All Homestays') {
    $sql    .= " AND name LIKE ?";
    $params[] = "%$location%";
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$results = $stmt->fetchAll();

// All homestays for dropdown
$allHomestays = $pdo->query("SELECT id, name FROM homestays WHERE status = 'available' ORDER BY id ASC")->fetchAll();

include 'includes/header.php';
?>

<link rel="stylesheet" href="css/detail.css">
<link rel="stylesheet" href="css/search.css">

<section class="search-hero">
  <div class="container">
    <h1>Search Results</h1>
    <p>
      <?php if ($checkin && $checkout): ?>
        <?= date('d M Y', strtotime($checkin)) ?> → <?= date('d M Y', strtotime($checkout)) ?>
        · <?= $nights ?> night<?= $nights !== 1 ? 's' : '' ?>
      <?php endif; ?>
      · <?= $guests ?> guest<?= $guests > 1 ? 's' : '' ?>
      <?php if ($location && $location !== 'All Homestays'): ?>
        · "<?= htmlspecialchars($location) ?>"
      <?php endif; ?>
    </p>
  </div>
</section>

<!-- REFINE SEARCH -->
<section class="search-refine">
  <div class="container">
    <form action="search.php" method="GET" class="refine-form">
      <div class="refine-field">
        <label>Homestay</label>
        <select name="location">
          <option value="All Homestays" <?= (!$location || $location === 'All Homestays') ? 'selected' : '' ?>>All Homestays</option>
          <?php foreach ($allHomestays as $hs): ?>
          <option value="<?= htmlspecialchars($hs['name']) ?>"
            <?= $location === $hs['name'] ? 'selected' : '' ?>>
            <?= htmlspecialchars($hs['name']) ?>
          </option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="refine-divider"></div>
      <div class="refine-field">
        <label>Check-in</label>
        <input type="date" name="checkin" value="<?= htmlspecialchars($checkin) ?>">
      </div>
      <div class="refine-divider"></div>
      <div class="refine-field">
        <label>Check-out</label>
        <input type="date" name="checkout" value="<?= htmlspecialchars($checkout) ?>">
      </div>
      <div class="refine-divider"></div>
      <div class="refine-field">
        <label>Guests</label>
        <select name="guests">
          <?php for ($g = 1; $g <= 20; $g++): ?>
          <option value="<?= $g ?>" <?= $guests === $g ? 'selected' : '' ?>><?= $g ?> Guest<?= $g > 1 ? 's' : '' ?></option>
          <?php endfor; ?>
        </select>
      </div>
      <button type="submit" class="refine-btn">Search</button>
    </form>
  </div>
</section>

<!-- RESULTS -->
<section class="search-results">
  <div class="container">

    <div class="results-header">
      <p><strong><?= count($results) ?></strong> homestay<?= count($results) !== 1 ? 's' : '' ?> found</p>
      <select class="filter-select" onchange="sortResults(this.value)">
        <option value="recommended">Recommended</option>
        <option value="low">Price: Low to High</option>
        <option value="high">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>

    <?php if (empty($results)): ?>
    <div class="no-results">
      <div class="no-results-icon">🔍</div>
      <h2>No homestays found</h2>
      <p>Try adjusting your search — fewer guests or a different homestay.</p>
      <a href="homestays.php" class="btn-book">View All Homestays</a>
    </div>

    <?php else: ?>
    <div class="homestay-list" id="resultsList">
      <?php foreach ($results as $hs):
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
          <div class="hs-amenities">
            <span>🛏 <?= $hs['rooms'] ?> Rooms</span>
            <span>🛁 <?= $hs['bathrooms'] ?> Bath</span>
            <span>👥 Max <?= $hs['max_guests'] ?> Guests</span>
            <?php foreach (array_slice($amenities, 0, 3) as $am): ?>
            <span>✅ <?= htmlspecialchars($am) ?></span>
            <?php endforeach; ?>
          </div>

          <?php if ($nights > 0): ?>
          <div class="hs-total-banner">
            💡 <strong>RM <?= number_format($hs['price_per_night'] * $nights, 0) ?></strong>
            total for <?= $nights ?> night<?= $nights > 1 ? 's' : '' ?>
          </div>
          <?php endif; ?>

          <div class="hs-list-footer">
            <div class="hs-price">RM <?= number_format($hs['price_per_night'], 0) ?> <small>/ night</small></div>
            <div class="hs-actions">
              <a href="homestay-detail.php?id=<?= $hs['id'] ?>" class="btn-detail">View Details</a>
              <a href="booking.php?id=<?= $hs['id'] ?>&checkin=<?= urlencode($checkin) ?>&checkout=<?= urlencode($checkout) ?>&guests=<?= $guests ?>" class="btn-book">Book Now</a>
            </div>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

  </div>
</section>

<script>
function sortResults(value) {
  const list = document.getElementById('resultsList');
  if (!list) return;
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