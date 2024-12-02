/* eslint-disable no-undef */
// public/scripts/event_dashboard.js

$(document).ready(function () {
  // 初始化 - 获取所有事件
  fetchEvents();

  // 搜索按钮点击事件
  $('#searchButton').on('click', function () {
    const searchQuery = $('#search').val().trim();
    const dateFilter = $('#dateFilter').val();

    const queryParams = {};

    if (searchQuery) {
      queryParams.search = searchQuery;
    }

    if (dateFilter) {
      queryParams.date = dateFilter;
    }

    fetchEvents(queryParams);
  });

  // 重置按钮点击事件
  $('#resetButton').on('click', function () {
    $('#search').val('');
    $('#dateFilter').val('');
    $('#suggestions').empty();
    $('#resultsCount').addClass('d-none').text('');
    fetchEvents();
  });

  // 搜索输入框输入事件 - 实时建议
  let debounceTimeout;
  $('#search').on('input', function () {
    const query = $(this).val().trim();
    clearTimeout(debounceTimeout);

    if (query.length > 0) {
      debounceTimeout = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    } else {
      $('#suggestions').empty();
    }
  });

  // 输入框失焦事件 - 隐藏建议列表
  $('#search').on('blur', function () {
    setTimeout(() => {
      $('#suggestions').empty();
    }, 200);
  });

  // 建议列表点击事件
  $('#suggestions').on('click', 'li', function () {
    const selectedText = $(this).text();
    $('#search').val(selectedText);
    $('#suggestions').empty();
    fetchEvents({ search: selectedText });
  });
});

// 获取并显示事件
function fetchEvents(queryParams = {}) {
  let url = '/api/events';

  if (Object.keys(queryParams).length > 0) {
    url = '/api/events/search?' + $.param(queryParams);
  }

  $.ajax({
    url: url,
    method: 'GET',
    success: displayEvents,
    error: function (err) {
      console.error('Error fetching events:', err);
    },
  });
}

// 显示事件列表
function displayEvents(events) {
  const eventList = $('#eventList');
  const resultsCount = $('#resultsCount');

  eventList.empty();
  resultsCount.addClass('d-none').text('');

  if (events.length === 0) {
    resultsCount.removeClass('d-none').text('No events found');
    return;
  } else {
    resultsCount.removeClass('d-none').text(`${events.length} event(s) found`);
  }

  events.forEach((event) => {
    const eventCard = `
      <div class="col-md-4">
        <div class="card h-100">
          <img src="${event.coverImage}" class="card-img-top" alt="${event.title}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${event.title}</h5>
            <p class="card-text"><strong>Date:</strong> ${event.date}</p>
            <p class="card-text"><strong>Venue:</strong> ${event.venue}</p>
            <p class="card-text">${event.description}</p>
            <p class="card-text mt-auto"><strong>Tickets Available:</strong> ${event.tickets}</p>
          </div>
        </div>
      </div>
    `;
    eventList.append(eventCard);
  });
}

// 获取实时建议
function fetchSuggestions(query) {
  $.ajax({
    url: '/api/events/suggestions?q=' + encodeURIComponent(query),
    method: 'GET',
    success: function (suggestions) {
      const suggestionsList = $('#suggestions');
      suggestionsList.empty();

      if (suggestions.length > 0) {
        suggestions.forEach((suggestion) => {
          suggestionsList.append(`
            <li class="autocomplete-suggestion list-group-item list-group-item-action">${suggestion}</li>
          `);
        });
      }
    },
    error: function (err) {
      console.error('Error fetching suggestions:', err);
    },
  });
}
