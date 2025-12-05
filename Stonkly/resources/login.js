// Builds the LogIn form
function loadLogin(){
  var output = `
    <div class="login-container">
      <form class="login-card" action="auth.php?action=login" method="POST">
        <h3>Log In</h3>
        <label for="username">Username:</label>
        <input type="text" placeholder="Enter your username" id="username" name="username" required><br>
        <label for="password">Password:</label>
        <input type="password" placeholder="Enter your password" id="password" name="password" required><br>
        <div class="button-row">
          <button class="submit-button" type="submit">Login</button>
        </div> 
        <a class="switcher" onclick="event.preventDefault(); clearMessage(); loadRegister()">Create Account</a>
      </form>
    </div>
  `;

  $('.inForm').html(output);
}

// Builds the Register form
function loadRegister(){
  var output = `
    <div class="register-container">
      <form class="register-card" action="auth.php?action=register" method="POST">
        <h3>Register</h3>
        <label for="username">Username:</label>
        <input type="text" placeholder="Enter your username" id="username" name="username" required>
        <label for="email">Email:</label>
        <input type="text" placeholder="Enter your email" id="email" name="email" required><br>
        <label for="password">Password:</label>
        <input type="password" placeholder="Enter your password" id="password" name="password" required><br>
        <label for="passwordRedo">Confirm Password:</label>
        <input type="password" placeholder="Re-enter your password" id="passwordRedo" name="passwordRedo" required><br>
        <div class="button-row">
          <button class="submit-button" type="submit">Register</button>
        </div> 
        <a class="switcher" onClick="event.preventDefault(); clearMessage(); loadLogin()">Log into Existing Account</a>
      </form>
    </div>
  `;

  $('.inForm').html(output);
}

function clearMessage(){
  $('#msg').remove();
}

$(document).ready(function(){
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");

  if(type === "register") loadRegister();
  else loadLogin();
});