/* eslint-disable no-undef */
// public/scripts/bookingRecords.js

$(document).ready(function () {
  // Function to fetch tickets from the server
  function fetchTickets() {
    $.ajax({
      url: '/api/tickets', // Adjust the URL if needed
      method: 'GET',
      success: function (response) {
        if (response.success) {
          renderTickets(response.tickets);
        } else {
          alert('Failed to fetch tickets.');
        }
      },
      error: function (err) {
        console.error('Error fetching tickets:', err);
        alert('An error occurred while fetching tickets.');
      },
    });
  }

  // Function to render tickets on the page
  function renderTickets(tickets) {
    const container = $('#ticketsContainer');
    container.empty(); // Clear existing content

    if (tickets.length === 0) {
      container.append('<p>No booking records found.</p>');
      return;
    }

    tickets.forEach((ticket) => {
      const ticketCard = `
        <div class="ticket-card shadow">
          <h2 class="ticket-title">Ticket Information</h2>
          <div class="ticket-info">
            <div class="info-row">
              <span>Account ID: ${ticket.username}</span>
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
        </div>
      `;
      container.append(ticketCard);
    });
  }

  // Fetch tickets on page load
  fetchTickets();
});
