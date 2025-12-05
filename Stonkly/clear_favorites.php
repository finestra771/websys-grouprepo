<?php
session_start();
require "conn.php";

header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false]);
    exit();
}

$user = $_SESSION['username'];

$stmt = $conn->prepare("DELETE FROM favorites WHERE username = ?");
$stmt->bind_param("s", $user);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}

$stmt->close();
$conn->close();
?>
