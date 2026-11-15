
import { bookingState } from "../utils.js";
import { getFlights } from "../api/flightApi.js";

const DRAFT_KEY = "pendingBooking";

export function initFlight() {
    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const step3 = document.getElementById("step3");

    const toFlightsBtn = document.getElementById("toFlightsBtn");
    const backToPassengers = document.getElementById("backToPassengers");

    const flightList = document.getElementById("flightList");
    const pricePreview = document.getElementById("pricePreview");

    const fromEl = document.getElementById("from");
    const toEl = document.getElementById("to");
    const dateEl = document.getElementById("date");
    const pcountEl = document.getElementById("pcount");

    let flights = [];
    let selectedFlight = null;

    const continueBtn = document.createElement("button");
    continueBtn.type = "button";
    continueBtn.className = "btn";
    continueBtn.textContent = "Continue to Confirmation";
    continueBtn.hidden = true;

    pricePreview.after(continueBtn);

    function getDraft() {
        try {
            return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || {};
        } catch {
            return {};
        }
    }

    function saveDraft(draft) {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        bookingState.pendingBooking = draft;
    }

    // Show only the requested booking step.
    function showStep(step) {
        step1.classList.toggle("hidden", step !== 1);
        step2.classList.toggle("hidden", step !== 2);
        step3.classList.toggle("hidden", step !== 3);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount);
    }

    function getPassengers() {
        const passengers = [];
        const count = Number(pcountEl.value);

        for (let i = 1; i <= count; i++) {
            const name = document.getElementById(`pname${i}`)?.value.trim();
            const age = document.getElementById(`page${i}`)?.value;
            const id = document.getElementById(`pid${i}`)?.value.trim();

            if (!name || !age || !id || Number(age) <= 0) {
                throw new Error(
                    `Please complete all details for Passenger ${i}.`
                );
            }

            passengers.push({
                name,
                age: Number(age),
                idProof: id
            });
        }

        return passengers;
    }

    // Display base fare only. Seat surcharges are calculated on confirmation.
    function updatePreview() {
        if (!selectedFlight || !bookingState.pendingBooking?.passengers) {
            pricePreview.textContent = "Select a flight to see the base fare.";
            return;
        }

        const passengerCount =
            bookingState.pendingBooking.passengers.length;

        const baseTotal =
            Number(selectedFlight.price) * passengerCount;

        pricePreview.textContent =
            `Base fare: ${formatCurrency(baseTotal)} ` +
            `(${passengerCount} passenger${passengerCount === 1 ? "" : "s"})`;
    }

    function updateSelectedFlightHighlight() {
        flightList.querySelectorAll(".flight-card").forEach(card => {
            const isSelected =
                card.dataset.flightName === selectedFlight?.name;

            card.classList.toggle("selected-flight", isSelected);
        });

        flightList.querySelectorAll(".choose-btn").forEach(button => {
            const flight = flights[Number(button.dataset.flightIndex)];
            const isSelected = flight?.name === selectedFlight?.name;

            button.textContent = isSelected ? "Selected" : "Choose Flight";
            button.disabled = isSelected;
        });
    }

    function selectFlight(flight) {
        selectedFlight = flight;

        const draft = getDraft();
        draft.flight = flight;
        draft.currentStep = 3;

        saveDraft(draft);

        continueBtn.hidden = false;

        updateSelectedFlightHighlight();
        updatePreview();
    }

    function renderFlights() {
        flightList.replaceChildren();

        if (flights.length === 0) {
            flightList.textContent = "No flights available.";
            continueBtn.hidden = true;
            return;
        }

        flights.forEach((flight, index) => {
            const card = document.createElement("div");
            card.className = "flight-card";
            card.dataset.flightName = flight.name;

            const heading = document.createElement("h4");
            heading.textContent = flight.name;

            const time = document.createElement("p");
            time.textContent = flight.time;

            const price = document.createElement("p");
            price.textContent =
                `${formatCurrency(Number(flight.price))} per passenger`;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "btn choose-btn";
            button.textContent = "Choose Flight";
            button.dataset.flightIndex = String(index);

            card.append(heading, time, price, button);
            flightList.appendChild(card);
        });

        updateSelectedFlightHighlight();
        updatePreview();
    }

    async function loadFlights() {
        flightList.textContent = "Loading flights...";

        try {
            flights = await getFlights();

            const draft = getDraft();

            renderFlights();

            if (draft.flight) {
                const previousFlight = flights.find(
                    flight => flight.name === draft.flight.name
                );

                if (previousFlight) {
                    selectFlight(previousFlight);
                } else {
                    selectedFlight = null;
                    continueBtn.hidden = true;
                    updatePreview();
                }
            } else {
                selectedFlight = null;
                continueBtn.hidden = true;
                updatePreview();
            }
        } catch (error) {
            flightList.textContent = error.message;
            continueBtn.hidden = true;
        }
    }

    // Move from passenger details to flight selection.
    toFlightsBtn?.addEventListener("click", async () => {
        try {
            const passengers = getPassengers();
            const draft = getDraft();

            draft.from = fromEl.value;
            draft.to = toEl.value;
            draft.date = dateEl.value;
            draft.passengerCount = Number(pcountEl.value);
            draft.passengers = passengers;
            draft.currentStep = 3;

            saveDraft(draft);

            selectedFlight = null;
            continueBtn.hidden = true;

            showStep(3);

            await loadFlights();

            flightList.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        } catch (error) {
            alert(error.message);
        }
    });

    // Handle flight selection.
    flightList?.addEventListener("click", event => {
        const button = event.target.closest(".choose-btn");

        if (!button) return;

        const index = Number(button.dataset.flightIndex);
        const flight = flights[index];

        if (!flight) return;

        selectFlight(flight);
    });

    // Navigate to confirmation.
    continueBtn.addEventListener("click", () => {
        if (!selectedFlight || !bookingState.pendingBooking) {
            alert("Please select a flight first.");
            return;
        }

        const draft = getDraft();

        draft.flight = selectedFlight;
        draft.currentStep = 4;

        try {
            saveDraft(draft);
            window.location.href = "confirmation.html";
        } catch {
            alert("Unable to save booking details. Please try again.");
        }
    });

    // Return to passenger details.
    backToPassengers?.addEventListener("click", () => {
        const draft = getDraft();
        draft.currentStep = 2;

        saveDraft(draft);
        showStep(2);
    });

    // Restore booking draft and Step 3 when returning from confirmation.
    const draft = getDraft();
    bookingState.pendingBooking = draft;

    if (draft.currentStep === 3) {
        showStep(3);
        loadFlights();
    }
}
