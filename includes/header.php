<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zamanss Homestay — Feel at Home, Everywhere</title>
  <meta name="description" content="Book comfortable and affordable homestays in Ipoh, Perak.">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/detail.css">
</head>
<body>

<!-- NAVBAR -->
<nav class="navbar" id="navbar">
  <div class="nav-container">
    <a href="index.php" class="nav-logo">
      <img src="images/logo.png" alt="Zamanss Homestay" class="nav-logo-img">
      <span>Zamanss Homestay</span>
    </a>

    <ul class="nav-links">
      <li><a href="index.php">Home</a></li>

      <!-- DROPDOWN -->
      <li class="nav-dropdown">
        <a href="homestays.php" class="dropdown-toggle">
          Our Homestays <span class="arrow">▾</span>
        </a>
        <ul class="dropdown-menu">
          <li>
            <a href="homestay-detail.php?id=1">
              <span class="drop-icon">🏡</span>
              <div>
                <strong>Anderson 1</strong>
                <small>3 Rooms · RM 180/night</small>
              </div>
            </a>
          </li>
          <li>
            <a href="homestay-detail.php?id=2">
              <span class="drop-icon">🏡</span>
              <div>
                <strong>Anderson 2</strong>
                <small>4 Rooms · RM 250/night</small>
              </div>
            </a>
          </li>
          <li>
            <a href="homestay-detail.php?id=3">
              <span class="drop-icon">🏡</span>
              <div>
                <strong>Meru</strong>
                <small>2 Rooms · RM 150/night</small>
              </div>
            </a>
          </li>
          <li>
            <a href="homestay-detail.php?id=4">
              <span class="drop-icon">🏡</span>
              <div>
                <strong>Manjoi</strong>
                <small>3 Rooms · RM 200/night</small>
              </div>
            </a>
          </li>
          <li>
            <a href="homestay-detail.php?id=5">
              <span class="drop-icon">🏡</span>
              <div>
                <strong>Bandar Baru Putra</strong>
                <small>5 Rooms · RM 130/night</small>
              </div>
            </a>
          </li>
          <li class="drop-divider"></li>
          <li>
            <a href="homestays.php" class="view-all-link">
              View All Homestays →
            </a>
          </li>
        </ul>
      </li>

      <li><a href="about.php">About</a></li>
      <li><a href="contact.php">Contact</a></li>
    </ul>

    <div class="nav-actions">
      <?php if (isset($_SESSION['user_id'])): ?>
        <span class="nav-user">👤 <?= htmlspecialchars($_SESSION['user_name']) ?></span>
        <a href="auth/logout.php" class="btn-login">Sign Out</a>
      <?php else: ?>
        <a href="login.php" class="btn-login">Sign In</a>
        <a href="register.php" class="btn-register">Register</a>
      <?php endif; ?>
    </div>

    <button class="hamburger" id="hamburger">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>