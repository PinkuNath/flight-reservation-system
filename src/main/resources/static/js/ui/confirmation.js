
import { getCurrentUser } from "../api/authApi.js";
import { createBooking } from "../api/bookingApi.js";

export async function initConfirmation() {
    const summary = document.getElementById("summary");
    const passList = document.getElementById("passList");

    const baseFareEl = document.getElementById("baseFare");
    const seatSurchargeEl = document.getElementById("seatSurcharge");
    const finalPriceEl = document.getElementById("finalPrice");

    const confirmBtn = document.getElementById("confirmBtn");
    const messageEl = document.getElementById("confirmationMessage");
    const cancelBtn = document.getElementById("cancelBookingBtn");

    const WINDOW_SURCHARGE = 300;
    const DRAFT_KEY = "pendingBooking";

    confirmBtn.disabled = true;

    let pendingBooking;

    try {
        pendingBooking = JSON.parse(
            sessionStorage.getItem(DRAFT_KEY) || "null"
        );
    } catch {
        pendingBooking = null;
    }

    if (
        !pendingBooking ||
        !pendingBooking.flight ||
        !Array.isArray(pendingBooking.passengers) ||
        pendingBooking.passengers.length === 0
    ) {
        const confirmCard = document.getElementById("confirmCard");

        const heading = document.createElement("h2");
        heading.textContent = "No Booking Found";

        const paragraph = document.createElement("p");
        paragraph.textContent =
            "Please return to the main page and select a flight.";

        const homeLink = document.createElement("a");
        homeLink.href = "./index.html#book";
        homeLink.className = "btn";
        homeLink.textContent = "Back to Booking";

        confirmCard.replaceChildren(heading, paragraph, homeLink);
        return;
    }

    const flight = pendingBooking.flight;
    const passengers = pendingBooking.passengers;

    const passengerCount = passengers.length;
    const baseFare = Number(flight.price);

    passengers.forEach(passenger => {
        if (!["MIDDLE", "CORNER", "WINDOW"].includes(passenger.seatType)) {
            passenger.seatType = "MIDDLE";
        }
    });

    function saveDraft() {
        sessionStorage.setItem(
            DRAFT_KEY,
            JSON.stringify(pendingBooking)
        );
    }

    cancelBtn?.addEventListener("click", () => {
        try {
            pendingBooking.currentStep = 3;
            saveDraft();

            window.location.href = "index.html#book";
        } catch (error) {
            console.error("Unable to restore booking draft:", error);
            alert("Unable to return to flight selection.");
        }
    });

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount);
    }

    function formatDate(dateValue) {
        const date = new Date(`${dateValue}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    function renderSummary() {
        const details = [
            ["Flight", `${flight.name} — ${formatCurrency(baseFare)} per passenger`],
            ["Route", `${pendingBooking.from} → ${pendingBooking.to}`],
            ["Date", formatDate(pendingBooking.date)],
            ["Departure", flight.time],
            ["Passengers", passengerCount]
        ];

        summary.replaceChildren();

        details.forEach(([label, value]) => {
            const paragraph = document.createElement("p");
            paragraph.className = "summary-item";

            const strong = document.createElement("strong");
            strong.textContent = `${label}: `;

            paragraph.append(
                strong,
                document.createTextNode(String(value))
            );

            summary.appendChild(paragraph);
        });
    }

    function renderPassengers() {
        passList.replaceChildren();

        passengers.forEach((passenger, index) => {
            const passengerCard = document.createElement("div");
            passengerCard.className = "passenger-item";

            const name = document.createElement("p");
            name.textContent = `${index + 1}. ${passenger.name}`;

            const age = document.createElement("p");
            age.textContent = `Age: ${passenger.age}`;

            const seatLabel = document.createElement("label");
            seatLabel.textContent = "Seat Preference";
            seatLabel.htmlFor = `seatType-${index}`;

            const seatSelect = document.createElement("select");
            seatSelect.id = `seatType-${index}`;
            seatSelect.className = "book-input passenger-seat-select";

            const options = [
                { value: "MIDDLE", text: "Middle" },
                { value: "CORNER", text: "Corner" },
                { value: "WINDOW", text: "Window (+₹300)" }
            ];

            options.forEach(option => {
                const optionElement = document.createElement("option");
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                seatSelect.appendChild(optionElement);
            });

            seatSelect.value = passenger.seatType;

            function updateSeatHighlight() {
                seatSelect.dataset.seatType = seatSelect.value;
            }

            updateSeatHighlight();

            seatSelect.addEventListener("change", () => {
                passenger.seatType = seatSelect.value;

                updateSeatHighlight();
                saveDraft();
                calculateFare();
            });

            passengerCard.append(
                name,
                age,
                seatLabel,
                seatSelect
            );

            passList.appendChild(passengerCard);
        });
    }

    function calculateFare() {
        const baseTotal = baseFare * passengerCount;

        const windowPassengers = passengers.filter(
            passenger => passenger.seatType === "WINDOW"
        ).length;

        const surcharge = windowPassengers * WINDOW_SURCHARGE;
        const total = baseTotal + surcharge;

        baseFareEl.textContent = formatCurrency(baseTotal);
        seatSurchargeEl.textContent = formatCurrency(surcharge);
        finalPriceEl.textContent = formatCurrency(total);

        return total;
    }

    function showMessage(message, isError = false) {
        messageEl.textContent = message;
        messageEl.style.color = isError ? "red" : "inherit";
    }

    async function checkAuthentication() {
        try {
            const currentUser = await getCurrentUser();

            if (!currentUser) {
                confirmBtn.disabled = true;

                showMessage(
                    "Your session is not active. Please log in from the main page before booking.",
                    true
                );

                return false;
            }

            return true;
        } catch (error) {
            confirmBtn.disabled = true;

            showMessage(
                "Unable to verify your login session. Please try again.",
                true
            );

            return false;
        }
    }

    async function handleBooking() {
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Booking...";

        showMessage("");

        const bookingRequest = {
            source: pendingBooking.from,
            destination: pendingBooking.to,
            travelDate: pendingBooking.date,
            flightName: flight.name,
            passengers: passengers.map(passenger => ({
                name: passenger.name,
                age: Number(passenger.age),
                idProof: passenger.idProof,
                seatType: passenger.seatType
            }))
        };

        try {
            const response = await createBooking(bookingRequest);

            showMessage(
                `Booking confirmed successfully! Booking ID: ${response.id}`
            );

            passList.replaceChildren();

            response.passengers.forEach((passenger, index) => {
                const passengerCard = document.createElement("div");
                passengerCard.className = "passenger-item";

                const name = document.createElement("p");
                name.textContent = `${index + 1}. ${passenger.name}`;

                const age = document.createElement("p");
                age.textContent = `Age: ${passenger.age}`;

                const seat = document.createElement("p");
                seat.textContent = `Seat Preference: ${passenger.seatType}`;

                const boardingNumber = document.createElement("p");
                boardingNumber.textContent =
                    `Boarding Number: ${passenger.boardingNumber}`;

                passengerCard.append(name, age, seat, boardingNumber);
                passList.appendChild(passengerCard);
            });

            const actualBaseTotal =
                Number(response.baseFare) * response.passengers.length;

            baseFareEl.textContent = formatCurrency(actualBaseTotal);

            seatSurchargeEl.textContent = formatCurrency(
                Number(response.totalAmount) - actualBaseTotal
            );

            finalPriceEl.textContent = formatCurrency(
                Number(response.totalAmount)
            );

            sessionStorage.removeItem(DRAFT_KEY);

            // Hide both actions after successful booking.
            confirmBtn.hidden = true;

            if (cancelBtn) {
                cancelBtn.hidden = true;
            }

            const bookingsLink = document.createElement("a");
            bookingsLink.href = "index.html#mybookings";
            bookingsLink.className = "btn";
            bookingsLink.textContent = "Go to My Bookings";

            document.querySelector(".confirmation-actions")
                .appendChild(bookingsLink);

        } catch (error) {
            showMessage(error.message, true);

            confirmBtn.disabled = false;
            confirmBtn.textContent = "Book Ticket";
        }
    }

    renderSummary();
    renderPassengers();
    calculateFare();

    const authenticated = await checkAuthentication();

    if (authenticated) {
        confirmBtn.disabled = false;
        confirmBtn.addEventListener("click", handleBooking);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initConfirmation().catch(error => {
        console.error("Confirmation page initialization failed:", error);
    });
});
