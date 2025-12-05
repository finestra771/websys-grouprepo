<?php
session_start();
require "conn.php";

if(!isset($_GET['action'])){
  die("No action provided.");
}

$action = $_GET['action'];
if($action === 'login') handleLogin($conn);
elseif($action === 'register') handleRegister($conn);
elseif($action === 'logout') handleLogout($conn);
else echo 'Invalid action.';

function validate($username){
  $username = trim($username);
  $username = filter_var($username, FILTER_SANITIZE_STRING);
  return $username;
}

function handleLogin($conn){
  rateLim();

  $username = validate($_POST['username']);
  $password = $_POST['password'];

  $stmt = $conn->prepare("SELECT password_hash FROM users WHERE username = ?");
  $stmt->bind_param("s", $username);
  $stmt->execute();
  $stmt->store_result();

  if($stmt->num_rows === 0){
    $_SESSION['loginAttempts']++;
    $_SESSION['lastAttempt'] = time();
    $_SESSION['error'] = "Incorrect credentials";
    header("Location: login.php?type=login");
    exit;
  }

  $stmt->bind_result($hashedPassword);
  $stmt->fetch();

  if(password_verify($password, $hashedPassword)){
    $_SESSION['loginAttempts'] = 0;
    $_SESSION['username'] = $username;
    header('Location: predictions.php');
    exit;
  }

  $_SESSION['loginAttempts']++;
  $_SESSION['lastAttempt'] = time();
  $_SESSION['error'] = "Incorrect credentials";
  header("Location: login.php?type=login");
  exit;
}

function handleRegister($conn) {
  if (!isset($_POST['username']) || !isset($_POST['password']) || !isset($_POST['passwordRedo']) || !isset($_POST['email'])) {
    $_SESSION['error'] = "All fields must be filled.";
    header("Location: login.php?type=register");
    exit;
  }

  $username = validate($_POST['username']);
  $password = $_POST['password'];
  $passwordRedo = $_POST['passwordRedo'];
  $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);

  if ($password !== $passwordRedo) {
    $_SESSION['error'] = "Passwords do not match";
    header("Location: login.php?type=register");
    exit;
  }

  $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

  $stmt = $conn->prepare('INSERT INTO users (username, password_hash, email) VALUES (?,?,?)');
  $stmt->bind_param("sss", $username, $hashedPassword, $email);

  $stmt->execute();
  $_SESSION['success'] = "Account created! Please log in.";
  header("Location: login.php?type=login");
  exit;
}

function rateLim(){
  if(!isset($_SESSION['loginAttempts'])){
    $_SESSION['loginAttempts'] = 0;
    $_SESSION['lastAttempt'] = time();
    return;
  }

  $attempts = $_SESSION['loginAttempts'];
  $last = $_SESSION['lastAttempt'];

  if(time() - $last > 900){
    $_SESSION['loginAttempts'] = 0;
    return;
  }

  if($attempts > 5){
    $_SESSION['error'] = "Too many failed login attempts. Please try again in 15 minutes.";
    header("Location: login.php?type=login");
    exit;
  }
}

function handleLogout($conn){
  session_destroy();
  echo 'Log out successful!';
  header('Location: index.php');
  exit;
}

?>