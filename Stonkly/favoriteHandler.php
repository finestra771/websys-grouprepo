<?php
session_start();
require "conn.php"; // DB connection

// 1. Check login
if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo "Not logged in";
    exit;
}

// Get username
$user_id = $conn->real_escape_string($_SESSION['username']);

// 2. Validate input
if (!isset($_POST['ticker'], $_POST['action'])) {
    http_response_code(400);
    echo "Bad request";
    exit;
}

$ticker = $conn->real_escape_string($_POST['ticker']);
$action = $_POST['action'];

// 3. Look up ticker_id
$tickerQuery = $conn->query("SELECT id FROM tickers WHERE company_name = '$ticker' LIMIT 1");
if ($tickerQuery->num_rows === 0) {
    http_response_code(404);
    echo "Ticker not found";
    exit;
}

$tickerRow = $tickerQuery->fetch_assoc();
$ticker_id = intval($tickerRow['id']);

// 4. Insert or delete from favorites
if ($action === "add") {
    $sql = "INSERT IGNORE INTO favorites (username, ticker_id)
            VALUES ('$user_id', $ticker_id)";
    $conn->query($sql);
    echo "INSERT IGNORE INTO favorites (username, ticker_id)
            VALUES ('$user_id', $ticker_id)";
    echo "Favorited";

} elseif ($action === "remove") {
    $sql = "DELETE FROM favorites 
            WHERE username = '$user_id' AND ticker_id = $ticker_id";
    $conn->query($sql);
    echo "Unfavorited";

} else {
    echo "Invalid action";
}
