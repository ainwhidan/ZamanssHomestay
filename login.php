<?php
session_start();

// Redirect if already logged in
if (isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit();
}

$error = $_SESSION['login_error'] ?? '';
unset($_SESSION['login_error']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In — Zamanss Homestay</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/auth.css">
</head>
<body class="auth-page">

<div class="auth-wrapper">

  <!-- LEFT PANEL -->
  <div class="auth-left">
    <div class="auth-left-content">
      <a href="index.php" class="auth-logo">
        <img src="images/logo.png" alt="Zamanss Homestay" onerror="this.style.display='none'">
        <span>Zamanss Homestay</span>
      </a>
      <h2>Welcome back!</h2>
      <p>Sign in to manage your bookings, view your history, and enjoy exclusive offers.</p>
      <div class="auth-features">
        <div class="auth-feature">
          <span class="feature-icon">📅</span>
          <span>Manage your bookings easily</span>
        </div>
        <div class="auth-feature">
          <span class="feature-icon">🏡</span>
          <span>Access all 5 homestays</span>
        </div>
        <div class="auth-feature">
          <span class="feature-icon">🔔</span>
          <span>Get booking notifications</span>
        </div>
      </div>
    </div>
  </div>

  <!-- RIGHT PANEL -->
  <div class="auth-right">
    <div class="auth-form-wrap">

      <div class="auth-form-header">
        <h1>Sign In</h1>
        <p>Don't have an account? <a href="register.php">Register here</a></p>
      </div>

      <?php if ($error): ?>
        <div class="alert alert-error">⚠️ <?= htmlspecialchars($error) ?></div>
      <?php endif; ?>

      <?php if (isset($_SESSION['success_msg'])): ?>
        <div class="alert alert-success">✅ <?= htmlspecialchars($_SESSION['success_msg']) ?></div>
        <?php unset($_SESSION['success_msg']); ?>
      <?php endif; ?>

      <form action="auth/login_process.php" method="POST" class="auth-form">

        <div class="form-group">
          <label for="email">Email Address</label>
          <div class="input-wrap">
            <span class="input-icon">✉️</span>
            <input type="email" id="email" name="email" placeholder="you@example.com" required
              value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password
            <a href="forgot_password.php" class="forgot-link">Forgot password?</a>
          </label>
          <div class="input-wrap">
            <span class="input-icon">🔒</span>
            <input type="password" id="password" name="password" placeholder="Enter your password" required>
            <button type="button" class="toggle-pass" onclick="togglePassword('password')">👁</button>
          </div>
        </div>

        <div class="form-check">
          <input type="checkbox" id="remember" name="remember">
          <label for="remember">Remember me</label>
        </div>

        <button type="submit" class="auth-btn">Sign In</button>

      </form>

      <div class="auth-divider"><span>or</span></div>

      <p class="auth-footer-text">
        New to Zamanss Homestay? <a href="register.php">Create an account</a>
      </p>

    </div>
  </div>

</div>

<script>
function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  field.type = field.type === 'password' ? 'text' : 'password';
}
</script>

</body>
</html>