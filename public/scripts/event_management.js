/* eslint-disable no-undef */
// public/scripts/event_management.js

$(document).ready(function () {
  // 初始化 - 获取所有事件并显示
  fetchAllEvents();

  // 创建事件表单提交事件
  $('#createEventForm').on('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    $.ajax({
      url: '/api/events',
      method: 'POST',
      data: formData,
      processData: false, // 不处理数据
      contentType: false, // 不设置内容类型
      success: function (response) {
        alert('Event created successfully!');
        $('#createEventForm')[0].reset();
        fetchAllEvents();
      },
      error: function (err) {
        console.error('Error creating event:', err);
        alert('Failed to create event: ' + (err.responseJSON?.error || 'Unknown error'));
      },
    });
  });

  // 现有事件列表中点击编辑按钮事件
  $('#existingEventsList').on('click', '.edit-event-btn', function () {
    const eventId = $(this).data('id');
    openEditModal(eventId);
  });

  // 现有事件列表中点击 map 按钮事件
  $('#existingEventsList').on('click', '.map-event-btn', function () {
    const eventId = $(this).data('id');
    window.location.href = `seat_management.html?eventId=${eventId}`;
  });

  // 编辑事件表单提交事件
  $('#editEventForm').on('submit', function (e) {
    e.preventDefault();

    const eventId = $('#editEventId').val();
    const formData = new FormData(this);

    $.ajax({
      url: `/api/events/${eventId}`,
      method: 'PUT',
      data: formData,
      processData: false, // 不处理数据
      contentType: false, // 不设置内容类型
      success: function (response) {
        alert('Event updated successfully!');
        $('#editEventModal').modal('hide');
        fetchAllEvents();
      },
      error: function (err) {
        console.error('Error updating event:', err);
        alert('Failed to update event: ' + (err.responseJSON?.error || 'Unknown error'));
      },
    });
  });

  // 删除事件按钮点击事件
  $('#existingEventsList').on('click', '.delete-event-btn', function () {
    const eventId = $(this).data('id');
    if (confirm('Are you sure you want to delete this event?')) {
      $.ajax({
        url: `/api/events/${eventId}`,
        method: 'DELETE',
        success: function (response) {
          alert('Event deleted successfully!');
          fetchAllEvents();
        },
        error: function (err) {
          console.error('Error deleting event:', err);
          alert('Failed to delete event: ' + (err.responseJSON?.error || 'Unknown error'));
        },
      });
    }
  });
});

// 获取并显示所有事件
function fetchAllEvents() {
  $.ajax({
    url: '/api/events',
    method: 'GET',
    success: displayExistingEvents,
    error: function (err) {
      console.error('Error fetching events:', err);
      alert('Failed to fetch events. Please check the console for details.');
    },
  });
}

// 显示现有事件列表
function displayExistingEvents(events) {
  const existingEventsList = $('#existingEventsList');
  existingEventsList.empty();

  if (events.length === 0) {
    existingEventsList.append('<p>No events available.</p>');
    return;
  }

  events.forEach((event) => {
    const eventCard = `
      <div class="col-md-6">
        <div class="card mb-3">
          <div class="row g-0">
            <div class="col-md-4">
              <img src="${event.coverImage}" class="img-fluid rounded-start" alt="${event.title}">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">${event.title}</h5>
                <p class="card-text"><strong>Date:</strong> ${event.date}</p>
                <p class="card-text"><strong>Venue:</strong> ${event.venue}</p>
                <p class="card-text"><strong>Description:</strong> ${event.description}</p>
                <p class="card-text"><strong>Normal Price:</strong> $${event.normalPrice}</p>
                <p class="card-text"><strong>EV-Charging Price:</strong> $${event.evPrice}</p>
                <button class="btn btn-primary edit-event-btn" data-id="${event._id}" data-bs-toggle="modal" data-bs-target="#editEventModal">Edit</button>
                <button class="btn btn-danger delete-event-btn ms-2" data-id="${event._id}">Delete</button>
                <!-- 将此代码添加到 eventCard 模板中，在 Edit 和 Delete 按钮之后 -->
                <button class="btn btn-secondary map-event-btn ms-2" data-id="${event._id}">Map</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    existingEventsList.append(eventCard);
  });

  // 加载事件到编辑模态框
  $('#editEventModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget);
    const eventId = button.data('id');
    loadEventData(eventId);
  });
}

// 加载事件数据到编辑模态框
function loadEventData(eventId) {
  $.ajax({
    url: `/api/events/${eventId}`,
    method: 'GET',
    success: function (event) {
      $('#editEventId').val(event._id);
      $('#editTitle').val(event.title);
      $('#editDate').val(event.date);
      $('#editVenue').val(event.venue);
      $('#editDescription').val(event.description);
      $('#editNormalPrice').val(event.normalPrice);
      $('#editEvPrice').val(event.evPrice);
      $('#editDiscountCode').val(event.discountCode);
      // 不填充 coverImage 字段，以便用户选择是否上传新图片
    },
    error: function (err) {
      console.error('Error fetching event data:', err);
      alert('Failed to load event data. Please check the console for details.');
      $('#editEventModal').modal('hide');
    },
  });
}
