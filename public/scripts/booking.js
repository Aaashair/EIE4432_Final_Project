/* eslint-disable no-undef */
// public/scripts/booking.js

$(document).ready(function () {
  let seatMap = {};
  let isSvgRendered = false;
  let selectedSeats = [];
  let eventId = null;
  let eventData = null;

  // Get eventId from URL
  const urlParams = new URLSearchParams(window.location.search);
  eventId = urlParams.get('eventId');
  if (!eventId) {
    alert('No event ID provided.');
    window.location.href = 'event_dashboard.html';
    return;
  }

  // Fetch event info and seats
  fetchEventInfo(eventId);

  // Handle seat click
  $('#seatMap').on('click', '.seat', function () {
    const seatId = $(this).attr('id');
    const seat = seatMap[seatId];

    // Cannot select invalid or occupied seats
    if (!seat.valid || seat.occupied) {
      return;
    }

    toggleSeatSelection(seatId);
  });

  // Handle booking confirmation button click
  $('#confirmBookingButton').on('click', function () {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    // Prepare booking data
    const bookingData = {
      eventId: eventId,
      seats: selectedSeats,
      totalPrice: calculateTotalPrice(),
    };

    // Store booking data in sessionStorage before redirecting
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

    // Redirect to payment page
    window.location.href = 'payment.html';
  });

  // Fetch event info and seat data
  function fetchEventInfo(eventId) {
    $.ajax({
      url: `/api/events/${eventId}`,
      method: 'GET',
      success: function (event) {
        eventData = event;
        seatMap = event.seat;
        displayEventInfo(event);
        renderSeatMap(seatMap);
      },
      error: function (err) {
        console.error('Error fetching event info:', err);
        alert('Failed to fetch event info.');
        window.location.href = 'event_dashboard.html';
      },
    });
  }

  // Display event information
  function displayEventInfo(event) {
    const eventInfoHtml = `
      <h3 class="fw-bolder mb-3">${event.title}</h3>
      <p><strong>Date:</strong> ${event.date}</p>
      <p><strong>Venue:</strong> ${event.venue}</p>
      <p><strong>Description:</strong> ${event.description}</p>
    `;
    $('#eventInfo').html(eventInfoHtml);
  }

  // Render seat map
  function renderSeatMap(seatMap) {
    if (isSvgRendered) return; // Ensure it only renders once
    isSvgRendered = true;

    const svg = document.getElementById('seatMap');
    const svgNS = 'http://www.w3.org/2000/svg';

    // Determine rows and columns
    const seatIds = Object.keys(seatMap);
    const rows = [...new Set(seatIds.map((seatId) => seatId.charAt(0)))].sort();
    const cols = Math.max(...seatIds.map((seatId) => parseInt(seatId.slice(1)))) || 1;

    const seatWidth = 50;
    const seatHeight = 50;
    const margin = 10;
    const labelOffset = 20; // For labels

    // Adjust SVG size
    svg.setAttribute('width', cols * (seatWidth + margin) + margin + labelOffset);
    svg.setAttribute('height', rows.length * (seatHeight + margin) + margin + labelOffset);

    // Add column labels
    const colsArray = Array.from({ length: cols }, (_, i) => i + 1);
    colsArray.forEach((colNum, index) => {
      const x = margin + index * (seatWidth + margin) + seatWidth / 2 + labelOffset;
      const y = margin / 2 + labelOffset;
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y - 10); // Adjust y position
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '14');
      text.textContent = colNum;
      svg.appendChild(text);
    });

    rows.forEach((row, rowIndex) => {
      // Add row labels
      const x = margin / 2 + labelOffset;
      const y = margin + rowIndex * (seatHeight + margin) + seatHeight / 2 + labelOffset;
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', x - 10); // Adjust x position
      text.setAttribute('y', y + 5); // Adjust y position
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '14');
      text.textContent = row;
      svg.appendChild(text);

      for (let col = 1; col <= cols; col++) {
        const seatId = `${row}${col}`;
        if (seatMap[seatId]) {
          const seat = seatMap[seatId];
          const x = margin + (col - 1) * (seatWidth + margin) + labelOffset;
          const y = margin + rowIndex * (seatHeight + margin) + labelOffset;
          const colorClass = getSeatColorClass(seat);

          // Create SVG rect element
          const rect = document.createElementNS(svgNS, 'rect');
          rect.setAttribute('id', seatId);
          rect.setAttribute('class', `seat ${colorClass}`);
          rect.setAttribute('x', x);
          rect.setAttribute('y', y);
          rect.setAttribute('width', seatWidth);
          rect.setAttribute('height', seatHeight);
          rect.setAttribute('data-bs-toggle', 'tooltip');
          rect.setAttribute('data-bs-html', 'true');
          rect.setAttribute('title', getSeatTooltip(seat));

          // Append rect to the SVG element
          svg.appendChild(rect);
        }
      }
    });

    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  // Get seat color class based on seat status
  function getSeatColorClass(seat) {
    if (!seat.valid) return 'invalid'; // Gray for unavailable seats
    if (seat.occupied) return 'occupied'; // Red for occupied seats
    return seat.type === 'ev-charging' ? 'ev-charging' : 'normal'; // Green or Blue
  }

  // Get seat tooltip content
  function getSeatTooltip(seat) {
    if (seat.occupied && seat.userID && seat.userID !== 'none') {
      return `Occupied by User ID: ${seat.userID}`;
    }
    if (!seat.valid) {
      return `Seat Unavailable`;
    }
    return `Seat Type: ${seat.type}`;
  }

  // Toggle seat selection
  function toggleSeatSelection(seatId) {
    const index = selectedSeats.indexOf(seatId);
    if (index > -1) {
      // Deselect seat
      selectedSeats.splice(index, 1);
      $(`#${seatId}`).removeClass('selected');
    } else {
      // Select seat
      selectedSeats.push(seatId);
      $(`#${seatId}`).addClass('selected');
    }
    updateTotalPrice();
  }

  // Update total price
  function updateTotalPrice() {
    const totalPrice = calculateTotalPrice();
    $('#totalPrice').text(totalPrice.toFixed(2));
  }

  // Calculate total price based on selected seats
  function calculateTotalPrice() {
    let totalPrice = 0;
    selectedSeats.forEach((seatId) => {
      const seat = seatMap[seatId];
      if (seat.type === 'ev-charging') {
        totalPrice += eventData.evPrice;
      } else {
        totalPrice += eventData.normalPrice;
      }
    });
    return totalPrice;
  }
});
