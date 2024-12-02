/* eslint-disable no-undef */
// public/scripts/payment.js

$(document).ready(function () {
  let bookingData = null;
  let eventData = null;
  let discountedPrice = 0;

  // 从 sessionStorage 中获取预订数据
  bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
  console.log('Retrieved bookingData:', bookingData); // 调试输出

  if (!bookingData) {
    alert('No booking data found.');
    window.location.href = 'event_dashboard.html';
    return;
  }

  // 获取活动详细信息
  fetchEventInfo(bookingData.eventId);

  // 显示预订摘要信息
  function displayBookingSummary() {
    const seats = bookingData.seats.join(', ');
    const totalPrice = bookingData.totalPrice.toFixed(2);

    const summaryHtml = `
      <p><strong>Event:</strong> ${eventData.title}</p>
      <p><strong>Date:</strong> ${eventData.date}</p>
      <p><strong>Venue:</strong> ${eventData.venue}</p>
      <p><strong>Selected Seats:</strong> ${seats}</p>
    `;

    $('#bookingSummary').html(summaryHtml);
    // 显示初始总价
    $('#totalPrice').text(totalPrice);
    discountedPrice = bookingData.totalPrice;
  }

  // 获取活动信息
  function fetchEventInfo(eventId) {
    $.ajax({
      url: `/api/events/${eventId}`,
      method: 'GET',
      success: function (event) {
        eventData = event;
        displayBookingSummary();
      },
      error: function (err) {
        console.error('Error fetching event info:', err);
        alert('Failed to fetch event info.');
        window.location.href = 'event_dashboard.html';
      },
    });
  }

  // 处理折扣码输入
  $('#discountCode').on('input', function () {
    const enteredCode = $(this).val().trim();
    if (enteredCode === eventData.discountCode) {
      // 折扣码匹配，减去 10 单位
      discountedPrice = bookingData.totalPrice - 10;
      if (discountedPrice < 0) discountedPrice = 0; // 确保价格不为负
      $('#totalPrice').text(discountedPrice.toFixed(2));
    } else {
      // 折扣码不匹配，恢复原始价格
      discountedPrice = bookingData.totalPrice;
      $('#totalPrice').text(discountedPrice.toFixed(2));
    }
  });

  // 处理支付表单提交
  $('#paymentForm').on('submit', function (e) {
    e.preventDefault();

    const cardNumber = $('#cardNumber').val().trim();

    if (!cardNumber) {
      alert('Please enter your credit card number.');
      return;
    }

    // 构建支付数据
    const paymentData = {
      eventId: bookingData.eventId,
      seats: bookingData.seats,
      totalPrice: discountedPrice,
      cardNumber: cardNumber,
      discountCode: $('#discountCode').val().trim(),
      // 传递用户信息（如果有用户登录）
      user: {
        username: localStorage.getItem('username'), // 如果有用户登录系统，替换为实际用户名
      },
    };

    // Log paymentData for debugging
    console.log('Sending paymentData:', paymentData);

    // 发送支付请求到服务器
    $.ajax({
      url: '/api/booking',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(paymentData),
      success: function (response) {
        alert('Payment successful!');
        // 清除 sessionStorage 中的预订数据
        sessionStorage.removeItem('bookingData');
        // 跳转到 my_profile.html
        window.location.href = 'my_profile.html';
      },
      error: function (err) {
        console.error('Error processing payment:', err);
        alert('Failed to process payment: ' + (err.responseJSON?.error || 'Unknown error'));
      },
    });
  });
});
