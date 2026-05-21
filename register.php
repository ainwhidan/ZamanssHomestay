<?php
session_start();

// Redirect if already logged in
if (isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit();
}

$error = $_SESSION['register_error'] ?? '';
unset($_SESSION['register_error']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Register — Zamanss Homestay</title>
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
      <h2>Join us today!</h2>
      <p>Create your account and start booking your perfect homestay experience in Ipoh, Perak.</p>
      <div class="auth-features">
        <div class="auth-feature">
          <span class="feature-icon">⚡</span>
          <span>Quick & easy booking</span>
        </div>
        <div class="auth-feature">
          <span class="feature-icon">🔒</span>
          <span>Secure & private account</span>
        </div>
        <div class="auth-feature">
          <span class="feature-icon">💬</span>
          <span>24/7 customer support</span>
        </div>
      </div>
    </div>
  </div>

  <!-- RIGHT PANEL -->
  <div class="auth-right">
    <div class="auth-form-wrap">

      <div class="auth-form-header">
        <h1>Create Account</h1>
        <p>Already have an account? <a href="login.php">Sign in here</a></p>
      </div>

      <?php if ($error): ?>
        <div class="alert alert-error">⚠️ <?= htmlspecialchars($error) ?></div>
      <?php endif; ?>

      <form action="auth/register_process.php" method="POST" class="auth-form">

        <div class="form-group">
          <label for="name">Full Name</label>
          <div class="input-wrap">
            <span class="input-icon">👤</span>
            <input type="text" id="name" name="name" placeholder="Your full name" required
              value="<?= htmlspecialchars($_POST['name'] ?? '') ?>">
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <div class="input-wrap">
            <span class="input-icon">✉️</span>
            <input type="email" id="email" name="email" placeholder="you@example.com" required
              value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
          </div>
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>
          <div class="input-wrap">
            <span class="input-icon">📞</span>
            <input type="tel" id="phone" name="phone" placeholder="01X-XXXXXXX"
              value="<?= htmlspecialchars($_POST['phone'] ?? '') ?>">
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrap">
            <span class="input-icon">🔒</span>
            <input type="password" id="password" name="password" placeholder="Minimum 8 characters" required>
            <button type="button" class="toggle-pass" onclick="togglePassword('password')">👁</button>
          </div>
        </div>

        <div class="form-group">
          <label for="confirm_password">Confirm Password</label>
          <div class="input-wrap">
            <span class="input-icon">🔒</span>
            <input type="password" id="confirm_password" name="confirm_password" placeholder="Repeat your password" required>
            <button type="button" class="toggle-pass" onclick="togglePassword('confirm_password')">👁</button>
          </div>
        </div>

        <div class="form-check">
          <input type="checkbox" id="agree" name="agree" required>
          <label for="agree">I agree to the <a href="#">Terms & Conditions</a></label>
        </div>

        <button type="submit" class="auth-btn">Create Account</button>

      </form>

      <div class="auth-divider"><span>or</span></div>

      <p class="auth-footer-text">
        Already have an account? <a href="login.php">Sign in</a>
      </p>

    </div>
  </div>

</div>

<script>
function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  field.type = field.type === 'password' ? 'text' : 'password';
}

// Password match validation
document.querySelector('form').addEventListener('submit', function(e) {
  const pass = document.getElementById('password').value;
  const confirm = document.getElementById('confirm_password').value;
  if (pass !== confirm) {
    e.preventDefault();
    alert('Passwords do not match!');
  }
  if (pass.length < 8) {
    e.preventDefault();
    alert('Password must be at least 8 characters!');
  }
});
</script>

</body>
</html>