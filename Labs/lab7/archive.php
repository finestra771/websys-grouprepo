<?php
  require('conn.php');
  header('Content-Type: application/json');

  $response = [];

  // connect to the database
  $dbOk = false;
  @$db = new mysqli($dbhost, $dbuser, $dbpass, $dbbase);
  if($db->connect_error){
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
  } else {
    $dbOk = true;
  }

  // get the item information sent by the JS
  $data = json_decode(file_get_contents('php://input'), true);
  if($data === null){
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit();
  }

  $id = $data['id'];
  $title = $data['title'];
  $description = $data['description'];
  $type = $data['type'];

  if($type == 'lectures'){
    $id_type = 'lecture_id';
  } else {
    $id_type = 'lab_id';
  }

  if($dbOk){
    // add the item into the database
    $insQuery = "INSERT INTO `$type` (`$id_type`, `title`, `description`) VALUES(?,?,?)";
    $statement = $db->prepare($insQuery);
    $statement->bind_param('iss', $id, $title, $description);
    if($statement->execute()){
      echo json_encode([
        'status' => 'success',
        'message' => "$title archived successfully",
        'title' => $title,
        'description' => $description
      ]);
    } else {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Database insertion failed']);
    }
    $statement->close();
  }
  $db->close();
?>