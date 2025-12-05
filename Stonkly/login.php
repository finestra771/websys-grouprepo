<!DOCTYPE html>
<html lang="en">

<?php
  session_start();
  $flash_msg = $_SESSION['flash_msg'] ?? null;
  unset($_SESSION['flash_msg']);
  ?>

  <?php if ($flash_msg): ?>
  <div id="popup" class="popup">
      <?php echo htmlspecialchars($flash_msg); ?>
  </div>

  <script>
  const p = document.getElementById("popup");
  p.style.position = "fixed";
  p.style.bottom = "20px";
  p.style.right = "20px";
  p.style.background = "#222";
  p.style.color = "#fff";
  p.style.padding = "12px 18px";
  p.style.borderRadius = "6px";
  p.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
  p.style.zIndex = "9999";
  p.style.fontFamily = "Segoe UI, Tahoma, Geneva, Verdana, sans-serif";
  p.style.fontSize = "0.9em";

  // fade out after 4 seconds
  setTimeout(() => {
      p.style.transition = "opacity 0.5s";
      p.style.opacity = "0";
      setTimeout(() => p.remove(), 500);
  }, 4000);
  </script>
<?php endif; ?>

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="resources/styles.css">
  <style>
    header {
      padding-top: 3em;
    }

    .login-container,
    .register-container {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 30px;
    }

    .login-card,
    .register-card {
      flex: 1 1 300px;
      background-color: #F3DFCB;
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 4px 12px #0000001a;
      text-align: center;
      width: 24em;
    }

    .login-card h3,
    .register-card h3 {
      font-weight: 700;
      font-size: 1.8rem;
      color: #B87432;
      margin-bottom: 25px;
    }

    .login-card label,
    .register-card label {
      display: block;
      text-align: left;
      font-weight: 500;
      color: #B87432;
    }

    .login-card input[type="text"],
    .login-card input[type="password"],
    .register-card input[type="text"],
    .register-card input[type="password"] {
      width: 90%;
      padding: 12px 15px;
      border-radius: 12px;
      font-size: 1rem;
      border: 1px solid #ccc;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px #0000001a;
    }

    .login-card input::placeholder,
    .register-card input::placeholder {
      color: #B87432;
      opacity: 0.7;
      font-size: 1rem;
    }

    .submit-button {
      height: 45px;
      width: 140px;
      border-radius: 25px;
      border: none;
      background-color: #B87432;
      color: white;
      font-weight: bold;
      cursor: pointer;
      margin-left: 10px;
    }

    .button-row {
      display: flex;
      justify-content: flex-end;
    }

    .switcher {
      display: block;
      margin-top: 15px;
      color: #B87432;
      font-weight: 500;
      text-decoration: underline;
      cursor: pointer;
    }
  </style>
  <link rel="icon" href="resources/images/bubble-tea.png" type="image/png">
  <title>Stonkly 💸</title>
</head>

<body>
  <!-- Navigation Bar -->
  <nav>
    <h1 class="title">
      <a href="#" id="link0">STONKLY💸</a>
    </h1>
    <ul>
      <li><a href="./index.php" class="nav-button">HOME</a></li>
      <li><a href="./meet-team.php" class="nav-button">CONTACTS</a></li>
      <li><a href="./login.php" class="nav-button">LOGIN</a></li>
    </ul>
  </nav>

  <header>
    <?php 
    session_start();
    if(isset($_SESSION['success'])){
      echo '<p id="msg">'.$_SESSION['success'].'</p>';
      unset($_SESSION['success']);
    } else if(isset($_SESSION['error'])){
      echo '<p id="msg">'.$_SESSION['error'].'</p>';
      unset($_SESSION['error']);
    }
    ?>
    <section class="inForm"></section>
  </header>
  <footer id="contacts">
    <p>&copy; 2025 Gatcha!. All rights reserved.</p>
  </footer>
  <!-- Scripts -->
  <script src="resources/jquery-3.7.1.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
    crossorigin="anonymous"></script>
  <script src="resources/login.js"></script>
</body>

</html>