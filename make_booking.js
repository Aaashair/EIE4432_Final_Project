const jsonData = {
    "events": [
        {
            "title": "Surface Parking Lot Event",
            "date": "2024-11-15",
            "description": "The parking lot is located at the East Entrance of Disneyland.",
            "venue": "P1",
            "tickets": 50,
            "coverImage": "assets/surface_parking_lot.jpg",
            "seats": [
                { "seatID": "A1", "status": "available", "price": 10 },
                { "seatID": "A2", "status": "occupied" },
                { "seatID": "A3", "status": "available", "price": 10 },
                { "seatID": "A4", "status": "available", "price": 10 },
                { "seatID": "A5", "status": "available", "price": 10 },
                { "seatID": "A6", "status": "available", "price": 10 },
                { "seatID": "A7", "status": "available", "price": 10 },
                { "seatID": "B1", "status": "available", "price": 10 },
                { "seatID": "B2", "status": "occupied" },
                { "seatID": "B3", "status": "available", "price": 10 },
                { "seatID": "B4", "status": "available", "price": 10 },
                { "seatID": "B5", "status": "available", "price": 10 },
                { "seatID": "B6", "status": "available", "price": 10 },
                { "seatID": "B7", "status": "available", "price": 10 }
            ]
        },
        {
            "title": "Underground Parking Lot Event",
            "date": "2024-11-22",
            "description": "The parking lot is located at the West Entrance of Disneyland.",
            "venue": "P2",
            "tickets": 30,
            "coverImage": "assets/underground_parking_lot.jpg",
            "seats": [
                { "seatID": "A1", "status": "available", "price": 10 },
                { "seatID": "A2", "status": "occupied" },
                // ... other seats
            ]
        }
    ]
};

// Function to display the first event information and seats
function displayEvent(event) {
    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-date').textContent = event.date;
    document.getElementById('event-description').textContent = event.description;
    document.getElementById('event-image').src = event.coverImage;

    const seatingMap = document.getElementById('seating-map');
    const totalPriceElement = document.getElementById('total-price');
    let totalPrice = 0;

    event.seats.forEach((seat, index) => {
        const seatElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        seatElement.setAttribute("class", `seat ${seat.status}`);
        seatElement.setAttribute("x", 50 + (index % 7) * 50); // Adjust x-position
        seatElement.setAttribute("y", 50 + Math.floor(index / 7) * 50); // Adjust y-position
        seatElement.setAttribute("width", 40);
        seatElement.setAttribute("height", 40);
        seatElement.setAttribute("data-seat-id", seat.seatID);
        seatElement.setAttribute("data-price", seat.price || 0);

        seatElement.addEventListener('click', function() {
            const isOccupied = this.classList.contains('occupied');
            const isSelected = this.classList.contains('selected');

            if (isOccupied) {
                alert('This seat is occupied.');
                return;
            }

            if (isSelected) {
                this.classList.remove('selected');
                totalPrice -= parseFloat(this.getAttribute('data-price')) || 0;
            } else {
                this.classList.add('selected');
                totalPrice += parseFloat(this.getAttribute('data-price')) || 0;
            }

            totalPriceElement.textContent = `Total Price: $${totalPrice}`;
        });

        seatingMap.appendChild(seatElement);
    });
}

displayEvent(jsonData.events[0]);