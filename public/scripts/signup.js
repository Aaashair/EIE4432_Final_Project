// scripts/signup.js
/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.getElementById('signupForm');

  signupForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get the input values
    const accountIdInput = document.getElementById('accountId');
    const passwordInput = document.getElementById('password');
    const nicknameInput = document.getElementById('nickname');
    const emailInput = document.getElementById('email');
    const birthdayInput = document.getElementById('birthday');
    const genderSelect = document.getElementById('gender');

    const accountId = accountIdInput.value.trim();
    const password = passwordInput.value.trim();
    const nickname = nicknameInput.value.trim();
    const email = emailInput.value.trim();
    const birthday = birthdayInput.value;
    const gender = genderSelect.value;

    // Validation checks
    let errorMessages = [];

    // (a) Check for empty fields
    if (accountId === '') errorMessages.push('Account ID is required.');
    if (password === '') errorMessages.push('Password is required.');
    if (nickname === '') errorMessages.push('Nickname is required.');
    if (email === '') errorMessages.push('Email address is required.');
    if (birthday === '') errorMessages.push('Birthday is required.');
    if (gender === '') errorMessages.push('Gender is required.');

    // (b) Check lengths
    if (accountId.length > 0 && accountId.length < 3) errorMessages.push('Account ID must be at least 3 characters.');
    if (password.length > 0 && password.length < 3) errorMessages.push('Password must be at least 3 characters.');

    // (b) Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 0 && !emailPattern.test(email)) {
      errorMessages.push('Please enter a valid email address.');
    }

    // If there are validation errors, alert them
    if (errorMessages.length > 0) {
      alert(errorMessages.join('\n'));
      return;
    }

    // Prepare data to send to the server
    const registrationData = {
      username: accountId,
      password: password,
      nickname: nickname,
      email: email,
      birthday: birthday,
      gender: gender,
    };

    // Send data to the server via fetch API
    fetch('/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          // Registration successful
          alert('Registration successful!');
          window.location.href = 'SignIn.html';
        } else {
          // Show error message from server
          alert(result.message || 'Registration failed.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Error processing registration. Please try again later.');
      });
  });
});
