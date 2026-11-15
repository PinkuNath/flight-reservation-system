
import { getCurrentUser } from "../api/authApi.js";
import { getUserBookings } from "../api/bookingApi.js";

export function initBookings() {
    const noBooking = document.getElementById("noBooking");
    const latestBooking = document.getElementById("latestBooking");

    if (!noBooking || !latestBooking) return;

    let currentBookings = [];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function formatCurrency(amount) {
        return Number(amount).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        });
    }

    function clearBookings(message) {
        currentBookings = [];
        latestBooking.replaceChildren();

        noBooking.textContent = message;
        noBooking.classList.remove("hidden");
    }

    function renderBookings(bookings) {
        currentBookings = bookings;
        latestBooking.replaceChildren();

        noBooking.classList.toggle("hidden", bookings.length > 0);

        if (bookings.length === 0) {
            noBooking.textContent = "You have no bookings yet.";
            return;
        }

        bookings.forEach((booking, index) => {
            const card = document.createElement("div");
            card.className = "card";

            const heading = document.createElement("h3");
            heading.textContent =
                `${booking.source} → ${booking.destination}`;

            const date = document.createElement("p");
            date.textContent = `Date: ${booking.travelDate}`;

            const flight = document.createElement("p");
            flight.textContent = `Flight: ${booking.flightName}`;

            const total = document.createElement("p");
            total.textContent =
                `Total: ${formatCurrency(booking.totalAmount)}`;

            const passengerCount = document.createElement("p");
            passengerCount.textContent =
                `Passengers: ${booking.passengers.length}`;

            const viewButton = document.createElement("button");
            viewButton.type = "button";
            viewButton.className = "btn view-current-btn";
            viewButton.textContent = "View Ticket";
            viewButton.dataset.idx = String(index);

            card.append(
                heading,
                date,
                flight,
                total,
                passengerCount,
                viewButton
            );

            latestBooking.appendChild(card);
        });
    }

    async function loadBookings() {
        // Clear previous user's data before checking the session.
        clearBookings("Loading your bookings...");

        try {
            const user = await getCurrentUser();

            if (!user) {
                clearBookings("Please log in to view your bookings.");
                return;
            }

            const bookings = await getUserBookings();

            if (!Array.isArray(bookings)) {
                console.error("Invalid bookings response:", bookings);
                clearBookings("Unable to load your bookings. Please try again.");
                return;
            }

            renderBookings(bookings);

        } catch (error) {
            console.error("Unable to load bookings:", error);

            clearBookings(
                "Unable to load your bookings. Please try again."
            );
        }
    }


    function viewTicket(index) {
        const booking = currentBookings[index];

        if (!booking) return;

        const ticketWindow = window.open("", "_blank");

        if (!ticketWindow) {
            alert("Please allow pop-ups to view your ticket.");
            return;
        }

        const doc = ticketWindow.document;

        doc.documentElement.lang = "en";
        doc.title = "Flight Ticket";

        const style = doc.createElement("style");
        style.textContent = `
        body {
            font-family: Arial, sans-serif;
            padding: 30px;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th, td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
        }

        button {
            padding: 10px 18px;
            cursor: pointer;
        }
    `;

        doc.head.appendChild(style);

        const heading = doc.createElement("h2");
        heading.textContent = "Java Airlines - Flight Ticket";

        const details = [
            ["Booking ID", booking.id],
            ["Route", `${booking.source} → ${booking.destination}`],
            ["Date", booking.travelDate],
            ["Flight", booking.flightName],
            ["Time", booking.flightTime],
            ["Seat Type", booking.seatType]
        ];

        const detailElements = details.map(([label, value]) => {
            const paragraph = doc.createElement("p");
            const strong = doc.createElement("strong");

            strong.textContent = `${label}: `;
            paragraph.append(strong, doc.createTextNode(String(value ?? "")));

            return paragraph;
        });

        const passengerHeading = doc.createElement("h3");
        passengerHeading.textContent = "Passengers";

        const table = doc.createElement("table");
        const headerRow = doc.createElement("tr");

        ["Name", "Age", "Boarding Number"].forEach(label => {
            const th = doc.createElement("th");
            th.textContent = label;
            headerRow.appendChild(th);
        });

        table.appendChild(headerRow);

        booking.passengers.forEach(passenger => {
            const row = doc.createElement("tr");

            const name = doc.createElement("td");
            name.textContent = passenger.name;

            const age = doc.createElement("td");
            age.textContent = String(passenger.age);

            const boardingNumber = doc.createElement("td");
            boardingNumber.textContent =
                String(passenger["boardingNumber"] ?? "");

            row.append(name, age, boardingNumber);
            table.appendChild(row);
        });

        const total = doc.createElement("h3");
        total.textContent = `Total: ${formatCurrency(booking.totalAmount)}`;

        const printButton = doc.createElement("button");
        printButton.textContent = "Print Ticket";
        printButton.addEventListener("click", () => {
            ticketWindow.print();
        });

        doc.body.replaceChildren(
            heading,
            ...detailElements,
            passengerHeading,
            table,
            total,
            printButton
        );
    }


    latestBooking.addEventListener("click", event => {
        const button = event.target.closest(".view-current-btn");

        if (!button) return;

        viewTicket(Number(button.dataset.idx));
    });

    // Refresh bookings whenever the user opens My Bookings.
    document.querySelectorAll('a[href="#mybookings"]').forEach(link => {
        link.addEventListener("click", () => {
            void loadBookings();
        });
    });

    // Load bookings when the application starts.
    loadBookings();
}
