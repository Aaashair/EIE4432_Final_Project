let events = [];

// Fetch events data from the JSON file
fetch('assets/events.json')
    .then(response => response.json())
    .then(data => {
        events = data.events;
        displayEvents(events);
        setupSearch(events);
    })
    .catch(error => console.error('Error fetching events:', error));

// Display events on the dashboard
function displayEvents(events) {
    const eventList = document.getElementById('eventList');
    const resultsCount = document.getElementById('resultsCount');

    eventList.innerHTML = ''; // Clear previous events
    resultsCount.style.display = events.length >= 0 ? 'block' : 'none'; // Show or hide results count
    resultsCount.textContent = `${events.length} results found`; // Update results count

    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${event.title}</h5>
                <h6 class="card-subtitle mb-2 text-muted">Venue: ${event.venue}</h6>
                <p class="card-text"><strong>Date:</strong> ${event.date}</p>
                <p class="card-text"><strong>Description:</strong> ${event.description}</p>
                <p class="card-text"><strong>Tickets Available:</strong> ${event.tickets}</p>
                <img src="${event.coverImage}" class="img-fluid" alt="${event.title} cover image" />
                <a href="#" class="btn btn-primary mt-2">Buy Tickets</a>
            </div>
        `;
        eventList.appendChild(card);
    });
}

// Setup search functionality
function setupSearch(events) {
    const searchInput = document.getElementById('search');
    const suggestionsBox = document.getElementById('suggestions');
    const dateFilter = document.getElementById('dateFilter');
    const searchButton = document.getElementById('searchButton');

    // Bind button click event
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.toLowerCase();
        const filteredEvents = filterEvents(events, query, dateFilter.value);
        displayEvents(filteredEvents);
    });

    // Keep input event for showing suggestions (optional)
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        showSuggestions(events, query);
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            suggestionsBox.style.display = 'none'; // Hide suggestions after losing focus
        }, 100);
    });
}

// Filter events by title, venue, description, and date
function filterEvents(events, query, date) {
    return events.filter(event => {
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesVenue = event.venue.toLowerCase().includes(query);
        const matchesDescription = event.description.toLowerCase().includes(query);
        const matchesDate = date ? event.date === date : true;

        return (matchesTitle || matchesVenue || matchesDescription) && matchesDate;
    });
}

// Show event name suggestions
function showSuggestions(events, query) {
    const suggestionsBox = document.getElementById('suggestions');
    const searchInput = document.getElementById('search');
    suggestionsBox.innerHTML = ''; // Clear previous suggestions

    if (query.length > 0) {
        const suggestions = events.filter(event => event.title.toLowerCase().includes(query))
                                   .map(event => `<li class="autocomplete-suggestion">${event.title}</li>`);

        suggestionsBox.innerHTML = suggestions.join('');
        suggestionsBox.style.display = suggestions.length > 0 ? 'block' : 'none';

        // Handle suggestion click
        document.querySelectorAll('.autocomplete-suggestion').forEach(item => {
            item.addEventListener('click', () => {
                // Set input value to selected suggestion with a slight delay
                setTimeout(() => {
                    searchInput.value = item.textContent; // Update input value
                    suggestionsBox.innerHTML = ''; // Clear suggestions
                    suggestionsBox.style.display = 'none'; // Hide suggestions
                }, 0); // 0 milliseconds delay

                // Optionally, trigger search immediately
                const filteredEvents = filterEvents(events, item.textContent.toLowerCase(), dateFilter.value);
                displayEvents(filteredEvents); // Re-run display with filtered events
            });
        });
    } else {
        suggestionsBox.style.display = 'none'; // Hide suggestions if query is empty
    }
}