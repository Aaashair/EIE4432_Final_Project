// public/scripts/userinformation.js
/* eslint-disable no-undef */
// 确保脚本在 DOM 内容加载后运行
document.addEventListener('DOMContentLoaded', function () {
  fetch('/auth/users')
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const users = data.users;
        displayUsers(users);
      } else {
        alert(data.message || 'Failed to fetch users.');
      }
    })
    .catch((error) => {
      console.error('Error fetching users:', error);
      alert('Error fetching users. Please try again later.');
    });

  function displayUsers(users) {
    const container = document.getElementById('users-container');

    users.forEach((user) => {
      // 创建用户卡片
      const card = document.createElement('div');
      card.className = 'card mb-4 mx-auto';
      card.style.width = '66.66%';
      card.style.border = '2px solid #02132f';

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      const row = document.createElement('div');
      row.className = 'row';

      const col12 = document.createElement('div');
      col12.className = 'col-12';

      const h4 = document.createElement('h4');
      h4.className = 'border-bottom pb-2 mb-3';
      h4.style.color = '#164596';
      h4.style.fontWeight = 'bold';
      h4.textContent = 'User Profile';

      col12.appendChild(h4);
      row.appendChild(col12);

      const col6_1 = document.createElement('div');
      col6_1.className = 'col-md-6';

      const accountIdP = document.createElement('p');
      accountIdP.innerHTML = `<strong style="font-size: 1.1rem">Account ID:</strong>
        <span style="font-size: 1rem">${user.username}</span>`;
      col6_1.appendChild(accountIdP);

      const nicknameP = document.createElement('p');
      nicknameP.innerHTML = `<strong style="font-size: 1.1rem">Nickname:</strong>
        <span style="font-size: 1rem">${user.nickname || '-'}</span>`;
      col6_1.appendChild(nicknameP);

      const emailP = document.createElement('p');
      emailP.innerHTML = `<strong style="font-size: 1.1rem">Email:</strong>
        <span style="font-size: 1rem">${user.email || '-'}</span>`;
      col6_1.appendChild(emailP);

      const col6_2 = document.createElement('div');
      col6_2.className = 'col-md-6';

      const birthdayP = document.createElement('p');
      birthdayP.innerHTML = `<strong style="font-size: 1.1rem">Birthday:</strong>
        <span style="font-size: 1rem">${user.birthday || '-'}</span>`;
      col6_2.appendChild(birthdayP);

      const genderP = document.createElement('p');
      genderP.innerHTML = `<strong style="font-size: 1.1rem">Gender:</strong>
        <span style="font-size: 1rem">${user.gender || '-'}</span>`;
      col6_2.appendChild(genderP);

      // 您可以在数据库中添加 registrationDate 字段，或者在此处省略
      const registrationDateP = document.createElement('p');
      registrationDateP.innerHTML = `<strong style="font-size: 1.1rem">Registration Date:</strong>
        <span style="font-size: 1rem">${formatDate(user.registrationDate)}</span>`;
      col6_2.appendChild(registrationDateP);

      row.appendChild(col6_1);
      row.appendChild(col6_2);
      cardBody.appendChild(row);
      card.appendChild(cardBody);

      container.appendChild(card);
    });
  }

  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
});
