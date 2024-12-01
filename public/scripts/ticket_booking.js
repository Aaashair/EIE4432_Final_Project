/* eslint-disable no-undef */
// public/scripts/ticket_booking.js

$(document).ready(function () {
  const selectedSeats = new Set();
  let totalPrice = 0;

  const priceMapping = {
    available: 50, // 普通停车位价格
    'ev-charging': 100, // EV 充电停车位价格
  };

  // 通过后端API获取停车位数据
  function loadParkingData() {
    $.ajax({
      url: '/api/seats', // 假定的API端点
      method: 'GET',
      success: function (data) {
        // data 应该是一个数组，包含每个停车位的信息
        data.forEach((seat) => {
          const seatElement = $('#' + seat.id);
          if (seat.status === 'invalid') {
            seatElement.addClass('invalid');
          } else if (seat.status === 'occupied') {
            seatElement.addClass('occupied');
          } else {
            // 可用状态
            seatElement.addClass('available');
            seatElement.attr('data-type', seat.type); // 存储停车位类型
          }
        });
      },
      error: function (err) {
        console.error('Error fetching seat data:', err);
      },
    });
  }

  // 更新总结面板
  function updateSummary() {
    const seatList = $('#selectedSeats');
    seatList.empty();
    totalPrice = 0;

    selectedSeats.forEach((seatId) => {
      const seatElement = $('#' + seatId);
      const seatType = seatElement.attr('data-type');
      const price = priceMapping[seatType] || 0;
      totalPrice += price;

      seatList.append(`<li class="list-group-item">${seatId} - $${price}</li>`);
    });

    $('#totalPrice').text(totalPrice);
    $('#bookButton').prop('disabled', selectedSeats.size === 0);
  }

  // 序列化选中的停车位并提交到后端
  function bookSeats() {
    const seatsArray = Array.from(selectedSeats);
    $.ajax({
      url: '/api/booking', // 假定的API端点
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ seats: seatsArray }),
      success: function (response) {
        alert('Booking successful!');
        // 更新停车位状态为occupied
        seatsArray.forEach((seatId) => {
          $('#' + seatId)
            .removeClass('available selected')
            .addClass('occupied');
        });
        selectedSeats.clear();
        updateSummary();
      },
      error: function (err) {
        console.error('Error booking seats:', err);
        alert('Booking failed. Please try again.');
      },
    });
  }

  // 处理停车位点击事件
  $('#parkingMap').on('click', '.parking-bay.available, .parking-bay.available.selected', function () {
    const seatId = $(this).attr('id');
    const seatType = $(this).attr('data-type');

    if ($(this).hasClass('selected')) {
      // 取消选择
      $(this).removeClass('selected');
      selectedSeats.delete(seatId);
    } else {
      // 选择
      $(this).addClass('selected');
      selectedSeats.add(seatId);
    }

    updateSummary();
  });

  // 处理预订按钮点击事件
  $('#bookButton').on('click', function () {
    if (selectedSeats.size === 0) {
      alert('Please select at least one seat to book.');
      return;
    }

    if (confirm(`Confirm booking for ${selectedSeats.size} seat(s) with total price $${totalPrice}?`)) {
      bookSeats();
    }
  });

  // 初始化
  loadParkingData();
});
