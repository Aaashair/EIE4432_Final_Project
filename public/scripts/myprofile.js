// public/scripts/myprofile.js

/* eslint-disable no-undef */

document.addEventListener('DOMContentLoaded', function () {
  // 获取表单字段的引用
  const accountIdInput = document.getElementById('accountId');
  const nicknameInput = document.getElementById('nickname');
  const emailInput = document.getElementById('email');
  const birthdayInput = document.getElementById('birthday');
  const genderSelect = document.getElementById('gender');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const profileForm = document.getElementById('profileForm');
  const ticketsContainer = document.getElementById('ticketsContainer'); // 票务信息容器

  // 从服务器获取用户资料
  fetch('/auth/profile')
    .then((response) => {
      if (response.status === 401) {
        // 未登录，重定向到登录页面
        alert('Please log in to view your profile.');
        window.location.href = 'SignIn.html';
        return;
      }
      return response.json();
    })
    .then((result) => {
      if (!result) return; // 已处理重定向

      if (result.success) {
        const user = result.user;
        // 将用户信息填入表单
        accountIdInput.value = user.username;
        nicknameInput.value = user.nickname || '';
        emailInput.value = user.email || '';
        birthdayInput.value = user.birthday || '';
        genderSelect.value = user.gender || '';

        // 存储用户名到 localStorage
        localStorage.setItem('username', user.username);

        // 获取并显示用户的票务信息
        fetchUserTickets(user.username);
      } else {
        alert(result.message || 'Failed to load profile information.');
      }
    })
    .catch((error) => {
      console.error('Error fetching profile data:', error);
      alert('Error fetching profile data. Please try again later.');
    });

  profileForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // 从表单获取更新后的值
    const nickname = nicknameInput.value.trim();
    const email = emailInput.value.trim();
    const birthday = birthdayInput.value;
    const gender = genderSelect.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // 验证
    let errorMessages = [];
    if (!nickname) errorMessages.push('Nickname is required.');
    if (!email) errorMessages.push('Email is required.');
    if (!birthday) errorMessages.push('Birthday is required.');
    if (!gender) errorMessages.push('Gender is required.');

    // 邮箱格式验证
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailPattern.test(email)) {
      errorMessages.push('Please enter a valid email address.');
    }

    // 如果用户填写了密码，则验证密码
    if (password || confirmPassword) {
      if (password.length < 3) {
        errorMessages.push('Password must be at least 3 characters.');
      }
      if (password !== confirmPassword) {
        errorMessages.push('Passwords do not match.');
      }
    }

    if (errorMessages.length > 0) {
      alert(errorMessages.join('\n'));
      return;
    }

    // 准备发送到服务器的数据
    const updatedData = {
      nickname: nickname,
      email: email,
      birthday: birthday,
      gender: gender,
    };

    // 如果用户填写了新密码，则包含在更新数据中
    if (password) {
      updatedData.password = password;
    }

    // 发送数据到服务器，更新用户资料
    fetch('/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => {
        if (response.status === 401) {
          alert('Please log in to update your profile.');
          window.location.href = 'SignIn.html';
          return;
        }
        return response.json();
      })
      .then((result) => {
        if (!result) return; // 已处理重定向

        if (result.success) {
          alert('Profile updated successfully.');
          // 清空密码字段
          passwordInput.value = '';
          confirmPasswordInput.value = '';
          // 可选：刷新页面或更新其他 UI 元素
        } else {
          alert(result.message || 'Failed to update profile.');
        }
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again later.');
      });
  });

  // 获取并显示用户的票务信息
  function fetchUserTickets(username) {
    fetch(`/api/tickets/${username}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          renderTickets(result.tickets);
        } else {
          alert('Failed to load tickets for user.');
        }
      })
      .catch((error) => {
        console.error('Error fetching tickets:', error);
        alert('Error fetching tickets. Please try again later.');
      });
  }

  // 渲染票务信息
  function renderTickets(tickets) {
    ticketsContainer.innerHTML = ''; // 清空容器

    if (tickets.length === 0) {
      ticketsContainer.innerHTML = '<p>You have no tickets.</p>';
      return;
    }

    tickets.forEach((ticket) => {
      const ticketCard = document.createElement('div');
      ticketCard.classList.add('ticket-card', 'shadow');

      ticketCard.innerHTML = `
        <h2 class="ticket-title">My Ticket</h2>
        <div class="ticket-info">
          <div class="info-row">
            <span>${ticket.title}</span>
            <span>Venue: ${ticket.venue}</span>
            <span>Date: ${ticket.date}</span>
            <span>Seat: ${ticket.seatNo}</span>
          </div>
          <div class="info-row">
            <span>Price: ${ticket.price} HKD</span>
            <span>Type: ${ticket.type}</span>
          </div>
          <div class="info-row">
            <span>Description: ${ticket.description}</span>
          </div>
        </div>
      `;

      ticketsContainer.appendChild(ticketCard);
    });
  }
});
