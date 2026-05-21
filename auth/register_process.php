<?php
session_start();
require_once '../includes/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../register.php");
    exit();
}

$name             = trim($_POST['name'] ?? '');
$email            = trim($_POST['email'] ?? '');
$phone            = trim($_POST['phone'] ?? '');
$password         = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

// Validation
if (empty($name) || empty($email) || empty($password)) {
    $_SESSION['register_error'] = "Please fill in all required fields.";
    header("Location: ../register.php");
    exit();
}

if ($password !== $confirm_password) {
    $_SESSION['register_error'] = "Passwords do not match.";
    header("Location: ../register.php");
    exit();
}

if (strlen($password) < 8) {
    $_SESSION['register_error'] = "Password must be at least 8 characters.";
    header("Location: ../register.php");
    exit();
}

// Check if email already exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    $_SESSION['register_error'] = "This email is already registered. Please sign in.";
    header("Location: ../register.php");
    exit();
}

// Hash password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'guest')");
$stmt->execute([$name, $email, $phone, $hashed_password]);

$_SESSION['success_msg'] = "Account created successfully! Please sign in.";
header("Location: ../login.php");
exit();
?>