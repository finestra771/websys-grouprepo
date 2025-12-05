@ -0,0 +1,70 @@
<?php
session_start();
require "conn.php";

error_reporting(E_ALL);
ini_set("display_errors", 1);

if (!isset($_SESSION['username'])) {
    header("Location: myinfo.php?msg=not_logged_in");
    exit();
}

$user = $_SESSION['username'];

$cur      = $_POST['current_password'] ?? "";
$new      = $_POST['new_password'] ?? "";
$confirm  = $_POST['confirm_password'] ?? "";

// 0) Check confirm match
if ($new !== $confirm) {
    header("Location: myinfo.php?msg=confirm_mismatch");
    exit();
}

// 1) Load stored password hash
$stmt = $conn->prepare("SELECT password_hash FROM users WHERE username=?");
$stmt->bind_param("s", $user);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();

if (!$result) {
    header("Location: myinfo.php?msg=user_not_found");
    exit();
}

$stored_hash = $result["password_hash"];

// 2) Check current password
if (!password_verify($cur, $stored_hash)) {
    header("Location: myinfo.php?msg=wrong_current");
    exit();
}

// 3) Check if new password is same as old
if (password_verify($new, $stored_hash)) {
    header("Location: myinfo.php?msg=same_password");
    exit();
}

// 4) Hash and update
$newHash = password_hash($new, PASSWORD_DEFAULT);

$update = $conn->prepare("UPDATE users SET password_hash=? WHERE username=?");
$update->bind_param("ss", $newHash, $user);
$update->execute();

// 5) Set flash message BEFORE logging out
$_SESSION['flash_msg'] = "Password changed successfully! Please log in again.";

// 6) Destroy session except flash message
foreach ($_SESSION as $key => $val) {
    if ($key !== 'flash_msg') {
        unset($_SESSION[$key]);
    }
}

// 7) Redirect to login
header("Location: login.php");
exit();
?>