/* eslint-disable no-undef */
// public/scripts/seat_management.js

// 将 seatMap 和 isSvgRendered 定义在全局作用域，以便所有函数都可以访问它们
let seatMap = {};
let isSvgRendered = false;

$(document).ready(function () {
  // 获取URL中的eventId
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('eventId');
  if (!eventId) {
    alert('No event ID provided.');
    window.location.href = 'event_management.html';
    return;
  }

  // 获取并显示事件信息
  fetchEventInfo(eventId);

  // 获取并渲染座位图
  fetchEventSeats(eventId);

  // 将事件绑定修改为使用事件委托
  $(document).on('submit', '#editSeatForm', function (e) {
    e.preventDefault();
    const seatId = $('#editSeatId').val();
    const valid = $('#editValid').is(':checked');
    const type = $('#editType').val();

    const updateData = {
      valid: valid,
      type: type,
    };

    $.ajax({
      url: `/api/events/${eventId}/seats/${seatId}`,
      method: 'PATCH',
      contentType: 'application/json',
      data: JSON.stringify(updateData),
      success: function (response) {
        alert('Seat updated successfully!');
        $('#editSeatModal').modal('hide');
        // 更新本地seatMap数据
        seatMap[seatId].valid = valid;
        seatMap[seatId].type = type;
        // 更新SVG座位颜色
        updateSeatColor(seatId);
      },
      error: function (err) {
        console.error('Error updating seat:', err);
        alert('Failed to update seat: ' + (err.responseJSON?.error || 'Unknown error'));
      },
    });
  });

  // 处理座位点击事件，打开编辑模态框
  $('#seatMap').on('click', '.seat', function () {
    const seatId = $(this).attr('id'); // 假设座位的ID为seatId
    const seatData = seatMap[seatId];
    openEditSeatModal(seatId, seatData);
  });

  // 配置编辑座位模态框
  $('body').append(`
    <!-- Edit Seat Modal -->
    <div class="modal fade" id="editSeatModal" tabindex="-1" aria-labelledby="editSeatModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editSeatModalLabel">Edit Seat</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="editSeatForm">
              <input type="hidden" id="editSeatId" name="seatId" />
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="editValid" name="valid">
                <label class="form-check-label" for="editValid">Valid</label>
              </div>
              <div class="mb-3">
                <label for="editType" class="form-label">Seat Type</label>
                <select class="form-select" id="editType" name="type" required>
                  <option value="normal">Normal</option>
                  <option value="ev-charging">EV-Charging</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `);
});

// 获取并显示事件信息
function fetchEventInfo(eventId) {
  $.ajax({
    url: `/api/events/${eventId}`,
    method: 'GET',
    success: function (event) {
      const eventInfo = `
        <h4>${event.title}</h4>
        <p><strong>Date:</strong> ${event.date}</p>
        <p><strong>Venue:</strong> ${event.venue}</p>
        <p><strong>Description:</strong> ${event.description}</p>
      `;
      $('#eventInfo').html(eventInfo);
    },
    error: function (err) {
      console.error('Error fetching event info:', err);
      alert('Failed to fetch event info.');
      window.location.href = 'event_management.html';
    },
  });
}

// 获取事件的座位数据
function fetchEventSeats(eventId) {
  $.ajax({
    url: `/api/events/${eventId}`,
    method: 'GET',
    success: function (event) {
      seatMap = event.seat;
      renderSeatMap(seatMap);
    },
    error: function (err) {
      console.error('Error fetching event seats:', err);
      alert('Failed to fetch event seats.');
    },
  });
}

// 渲染座位图
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
  const labelOffset = 20; // 为标签留出空间

  // 添加列标（1-9）
  colsArray = Array.from({ length: cols }, (_, i) => i + 1);
  colsArray.forEach((colNum, index) => {
    const x = margin + index * (seatWidth + margin) + seatWidth / 2 + labelOffset;
    const y = margin / 2 + 8;
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '14');
    text.textContent = colNum;
    svg.appendChild(text);
  });

  rows.forEach((row, rowIndex) => {
    // 添加行标（A、B、C、D）
    const x = margin / 2;
    const y = margin + rowIndex * (seatHeight + margin) + seatHeight / 2 + labelOffset;
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
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
        rect.setAttribute('fill', getSeatFillColor(colorClass)); // 设置填充颜色

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

// 获取座位颜色类
function getSeatColorClass(seat) {
  if (!seat.valid) return 'invalid'; // 灰色表示无效
  if (seat.occupied) return 'occupied'; // 红色表示已占用
  return seat.type === 'ev-charging' ? 'ev-charging' : 'normal'; // 绿色或蓝色
}

function getSeatFillColor(colorClass) {
  switch (colorClass) {
    case 'invalid':
      return '#6c757d'; // 灰色
    case 'occupied':
      return '#dc3545'; // 红色
    case 'ev-charging':
      return '#28a745'; // 绿色
    case 'normal':
      return '#007bff'; // 蓝色
    default:
      return '#000000'; // 默认黑色
  }
}

// 获取座位工具提示内容
function getSeatTooltip(seat) {
  if (seat.occupied && seat.userID && seat.userID !== 'none') {
    return `User ID: ${seat.userID}`;
  }
  return 'No user';
}

// 打开编辑座位模态框
function openEditSeatModal(seatId, seatData) {
  $('#editSeatId').val(seatId);
  $('#editValid').prop('checked', seatData.valid);
  $('#editType').val(seatData.type);
  $('#editSeatModal').modal('show');
}

// 更新座位颜色
function updateSeatColor(seatId) {
  const seat = seatMap[seatId];
  const colorClass = getSeatColorClass(seat);
  const rect = document.getElementById(seatId);
  rect.setAttribute('class', `seat ${colorClass}`);
  rect.setAttribute('fill', getSeatFillColor(colorClass));

  // 更新工具提示
  rect.setAttribute('title', getSeatTooltip(seat));
  bootstrap.Tooltip.getInstance(rect)?.dispose();
  new bootstrap.Tooltip(rect);
}
