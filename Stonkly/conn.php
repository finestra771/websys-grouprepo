<?php
$host = "localhost";
$user = "root";
$pw = "229Huntsman##";
$db = "stonkly";

$conn = new mysqli($host, $user, $pw, $db);
if($conn->connect_error){
  die("Connection failed: " . $conn->connect_error);
}
?>