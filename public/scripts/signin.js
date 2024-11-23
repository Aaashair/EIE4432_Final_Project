// scripts/signin.js
/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the username and password values
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Front-end Input Validation
    if (username === '' || password === '') {
      alert('Username and password cannot be empty.');
      return;
    }

    // Prepare data to send to the server
    const loginData = {
      username: username,
      password: password,
    };

    // Send data to the server via fetch API or jQuery AJAX
    fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          // Redirect based on role
          if (result.role === 'user') {
            window.location.href = 'HomePage.html';
          } else if (result.role === 'admin') {
            window.location.href = 'EventManagePage.html';
          } else {
            alert('Unknown role.');
          }
        } else {
          // Show error message from server
          alert(result.message || 'Login failed.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Error processing login. Please try again later.');
      });
  });
});
