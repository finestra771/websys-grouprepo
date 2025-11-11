<?php
  require('conn.php');
  header('Content-Type: application/json');

  $dbOk = false;
  @$db = new mysqli($dbhost, $dbuser, $dbpass, $dbbase);
  if($db->connect_error){
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
  } else {
    $dbOk = true;
  }

  if($dbOk){
    $db->query("TRUNCATE TABLE lectures");
    $db->query("TRUNCATE TABLE labs");
    echo json_encode(['status' => 'sucess', 'message' => 'Tables reset successfully']);
  }
  $db->close();
?>