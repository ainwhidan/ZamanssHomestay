<?php
session_start();
require_once 'includes/db.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 1;

// Fetch homestay from database
$stmt = $pdo->prepare("SELECT * FROM homestays WHERE id = ? AND status = 'available'");
$stmt->execute([$id]);
$hs = $stmt->fetch();

if (!$hs) {
    header("Location: homestays.php");
    exit();
}

// Convert amenities string to array
$amenities = array_map('trim', explode(',', $hs['amenities']));

// Add emoji icons to amenities
$amenity_icons = [
    'WiFi'            => '📶',
    'Parking'         => '🅿️',
    'Air-cond'        => '❄️',
    'Pool'            => '🏊',
    'Mini Pool'       => '🏊',
    'Privacy Pool'    => '🏊',
    'Full Kitchen'    => '🍳',
    'Kitchen'         => '🍳',
    'Garden'          => '🌿',
    'Hill View'       => '🌄',
    'BBQ'             => '🔥',
    'Mini Theatre'    => '🎬',
    'Porch'           => '🏡',
    'Connecting Room' => '🚪',
    'Smart TV'        => '📺',
    'Washing Machine' => '🧺',
];

$amenities_display = array_map(function($a) use ($amenity_icons) {
    $icon = '✅';
    foreach ($amenity_icons as $key => $emoji) {
        if (stripos($a, $key) !== false) { $icon = $emoji; break; }
    }
    return "$icon $a";
}, $amenities);

// House rules (hardcoded — can add DB column later)
$rules = [
    'No smoking inside the house',
    'No loud music after 11pm',
    'No additional guests without prior notice',
    'Keep the property clean and tidy',
    'Check-in: 3:00 PM | Check-out: 12:00 PM',
    'Pets are not allowed',
];

// Map coordinates per ID
$maps = [
    1 => ['lat' => 4.5975, 'lng' => 101.0901],
    2 => ['lat' => 4.5985, 'lng' => 101.0911],
    3 => ['lat' => 4.6320, 'lng' => 101.0732],
    4 => ['lat' => 4.6512, 'lng' => 101.1023],
    5 => ['lat' => 4.5812, 'lng' => 101.1145],
];
$map = $maps[$id] ?? ['lat' => 4.5975, 'lng' => 101.0901];

// Fetch other homestays
$others = $pdo->query("SELECT * FROM homestays WHERE id != $id AND status = 'available' LIMIT 4")->fetchAll();

include 'includes/header.php';
?>

<link rel="stylesheet" href="css/detail.css">

<!-- DETAIL HERO -->
<section class="detail-hero">
  <div class="container">
    <div class="detail-breadcrumb">
      <a href="index.php">Home</a> ›
      <a href="homestays.php">Our Homestays</a> ›
      <span><?= htmlspecialchars($hs['name']) ?></span>
    </div>
    <div class="detail-title-row">
      <div>
        <h1><?= htmlspecialchars($hs['name']) ?></h1>
        <div class="detail-meta">
          <span class="detail-rating">⭐ <?= $hs['rating'] ?></span>
          <span class="detail-location">📍 <?= htmlspecialchars($hs['location']) ?></span>
        </div>
      </div>
      <div class="detail-price-block">
        <div class="detail-price">RM <?= number_format($hs['price_per_night'], 0) ?> <small>/ night</small></div>
        <a href="booking.php?id=<?= $id ?>" class="btn-book-now">Book Now</a>
      </div>
    </div>
  </div>
</section>

<!-- PHOTO GALLERY -->
<section class="gallery-section">
  <div class="container">
    <div class="gallery-grid">
      <div class="gallery-main">
        <img src="images/<?= htmlspecialchars($hs['image']) ?>" alt="<?= htmlspecialchars($hs['name']) ?>"
          id="mainImg"
          onerror="this.src='https://placehold.co/800x500/e8f4f8/1a5276?text=<?= urlencode($hs['name']) ?>'">
      </div>
      <div class="gallery-thumbs">
        <?php
        $baseImg = pathinfo($hs['image'], PATHINFO_FILENAME);
        $ext     = pathinfo($hs['image'], PATHINFO_EXTENSION);
        $imgs    = [$hs['image'], "{$baseImg}b.{$ext}", "{$baseImg}c.{$ext}", "{$baseImg}d.{$ext}"];
        foreach ($imgs as $i => $img): ?>
        <div class="thumb <?= $i === 0 ? 'active' : '' ?>"
          onclick="changeImg('images/<?= $img ?>', this, '<?= urlencode($hs['name']) ?>')">
          <img src="images/<?= $img ?>" alt="Photo <?= $i+1 ?>"
            onerror="this.src='https://placehold.co/200x140/e8f4f8/1a5276?text=Photo+<?= $i+1 ?>'">
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>

<!-- DETAILS -->
<section class="detail-body">
  <div class="container">
    <div class="detail-layout">

      <!-- LEFT COLUMN -->
      <div class="detail-main-col">

        <div class="quick-info">
          <div class="quick-info-item">
            <span class="qi-icon">🛏</span>
            <div><strong><?= $hs['rooms'] ?> Rooms</strong><small>Bedrooms</small></div>
          </div>
          <div class="quick-info-item">
            <span class="qi-icon">🛁</span>
            <div><strong><?= $hs['bathrooms'] ?> Bath</strong><small>Bathrooms</small></div>
          </div>
          <div class="quick-info-item">
            <span class="qi-icon">👥</span>
            <div><strong><?= $hs['max_guests'] ?> Guests</strong><small>Max capacity</small></div>
          </div>
          <div class="quick-info-item">
            <span class="qi-icon">🏡</span>
            <div><strong>Entire Home</strong><small>Private property</small></div>
          </div>
        </div>

        <div class="detail-section">
          <h2>About This Homestay</h2>
          <p><?= nl2br(htmlspecialchars($hs['description'])) ?></p>
        </div>

        <div class="detail-section">
          <h2>Amenities</h2>
          <div class="amenities-grid">
            <?php foreach ($amenities_display as $a): ?>
            <div class="amenity-item"><?= htmlspecialchars($a) ?></div>
            <?php endforeach; ?>
          </div>
        </div>

        <div class="detail-section">
          <h2>House Rules</h2>
          <ul class="rules-list">
            <?php foreach ($rules as $rule): ?>
            <li>✅ <?= htmlspecialchars($rule) ?></li>
            <?php endforeach; ?>
          </ul>
        </div>

        <div class="detail-section">
          <h2>Location</h2>
          <p class="map-address">📍 <?= htmlspecialchars($hs['location']) ?></p>
          <div class="map-container">
            <iframe
              src="https://maps.google.com/maps?q=<?= $map['lat'] ?>,<?= $map['lng'] ?>&z=15&output=embed"
              width="100%" height="380" style="border:0;" allowfullscreen="" loading="lazy">
            </iframe>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN -->
      <div class="detail-side-col">
        <div class="booking-widget">
          <div class="widget-price">RM <?= number_format($hs['price_per_night'], 0) ?> <small>/ night</small></div>
          <div class="widget-rating">⭐ <?= $hs['rating'] ?> · Max <?= $hs['max_guests'] ?> guests</div>

          <div class="widget-form">
            <div class="widget-dates">
              <div class="widget-field">
                <label>Check-in</label>
                <input type="date" id="w-checkin">
              </div>
              <div class="widget-field">
                <label>Check-out</label>
                <input type="date" id="w-checkout">
              </div>
            </div>
            <div class="widget-field">
              <label>Guests</label>
              <select id="w-guests">
                <?php for ($g = 1; $g <= $hs['max_guests']; $g++): ?>
                <option><?= $g ?> Guest<?= $g > 1 ? 's' : '' ?></option>
                <?php endfor; ?>
              </select>
            </div>
            <div class="widget-total" id="widgetTotal" style="display:none;">
              <div class="widget-calc" id="widgetCalc"></div>
              <div class="widget-grand">
                <span>Total</span>
                <strong id="widgetGrand"></strong>
              </div>
            </div>
            <a href="booking.php?id=<?= $id ?>" class="widget-book-btn" id="bookBtn">Reserve Now</a>
            <p class="widget-note">You won't be charged yet</p>
          </div>
        </div>

        <div class="contact-host">
          <h4>Need help?</h4>
          <p>Contact us for special requests or enquiries.</p>
          <a href="https://wa.me/601112345678" class="btn-whatsapp" target="_blank">💬 WhatsApp Us</a>
          <a href="contact.php" class="btn-contact-link">Or send us a message →</a>
        </div>
      </div>

    </div>
  </div>
</section>

<?php if (!empty($others)): ?>
<section class="other-homestays">
  <div class="container">
    <h2>Other Homestays You Might Like</h2>
    <div class="other-grid">
      <?php foreach ($others as $other): ?>
      <a href="homestay-detail.php?id=<?= $other['id'] ?>" class="other-card">
        <div class="other-img">
          <img src="images/<?= htmlspecialchars($other['image']) ?>" alt="<?= htmlspecialchars($other['name']) ?>"
            onerror="this.src='https://placehold.co/300x200/e8f4f8/1a5276?text=<?= urlencode($other['name']) ?>'">
        </div>
        <div class="other-body">
          <h4><?= htmlspecialchars($other['name']) ?></h4>
          <p>⭐ <?= $other['rating'] ?> · RM <?= number_format($other['price_per_night'], 0) ?>/night</p>
        </div>
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<script>
function changeImg(src, el, name) {
  const main = document.getElementById('mainImg');
  main.src = src;
  main.onerror = () => main.src = 'https://placehold.co/800x500/e8f4f8/1a5276?text=' + name;
  document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

const price   = <?= $hs['price_per_night'] ?>;
const checkin = document.getElementById('w-checkin');
const checkout= document.getElementById('w-checkout');
const bookBtn = document.getElementById('bookBtn');
checkin.setAttribute('min', new Date().toISOString().split('T')[0]);

function calcPrice() {
  if (!checkin.value || !checkout.value) return;
  const nights = Math.ceil((new Date(checkout.value) - new Date(checkin.value)) / 86400000);
  if (nights <= 0) return;
  document.getElementById('widgetTotal').style.display = 'block';
  document.getElementById('widgetCalc').textContent = `RM ${price} x ${nights} night${nights > 1 ? 's' : ''}`;
  document.getElementById('widgetGrand').textContent = `RM ${nights * price}`;
  bookBtn.href = `booking.php?id=<?= $id ?>&checkin=${checkin.value}&checkout=${checkout.value}&guests=${document.getElementById('w-guests').value}`;
}

checkin.addEventListener('change', () => { checkout.setAttribute('min', checkin.value); calcPrice(); });
checkout.addEventListener('change', calcPrice);
</script>

<?php include 'includes/footer.php'; ?>