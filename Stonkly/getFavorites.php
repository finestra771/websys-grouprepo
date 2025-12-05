<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();

header('Content-Type: application/json');

// Fake user session for testing
$_SESSION['username'] = $_SESSION['username'] ?? 'lala';
$username = $_SESSION['username'];

// DB connection
$host = "localhost";
$user = "root";
$pw = "229Huntsman##";
$db = "stonkly";
$mysqli = new mysqli($host, $user, $pw, $db);

if ($mysqli->connect_errno) {
    echo json_encode(['favorites' => [], 'error' => 'DB connection failed: ' . $mysqli->connect_error]);
    exit;
}

// Select favorites based on username
$stmt = $mysqli->prepare(
    "SELECT e.company_name AS ticker
     FROM favorites f
     JOIN tickers e ON f.ticker_id = e.id
     WHERE f.username = ?"
);
$stmt->bind_param("s", $username); // <-- "s" for string
$stmt->execute();
$result = $stmt->get_result();

$favs = [];
while ($row = $result->fetch_assoc()) {
    $favs[] = $row['ticker'];
}

echo json_encode(['favorites' => $favs]);

$stmt->close();
$mysqli->close();
?>
