
import { getCurrentUser } from "../api/authApi.js";

const DRAFT_KEY = "pendingBooking";

export function initBooking() {
    const toPassengerBtn = document.getElementById("toPassengerBtn");
    const backToStep1 = document.getElementById("backToStep1");

    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const passengerForms = document.getElementById("passengerForms");

    const fromEl = document.getElementById("from");
    const toEl = document.getElementById("to");
    const dateEl = document.getElementById("date");
    const pcountEl = document.getElementById("pcount");

    function getDraft() {
        try {
            return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || {};
        } catch {
            return {};
        }
    }

    function saveDraft(draft) {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }

    function showStep(stepToShow) {
        step1.classList.toggle("hidden", stepToShow !== 1);
        step2.classList.toggle("hidden", stepToShow !== 2);
    }

    function getPassengerDetails() {
        const passengers = [];
        const count = passengerForms.querySelectorAll(".passenger-card").length;

        for (let i = 1; i <= count; i++) {
            passengers.push({
                name: document.getElementById(`pname${i}`)?.value.trim() || "",
                age: document.getElementById(`page${i}`)?.value || "",
                idProof: document.getElementById(`pid${i}`)?.value.trim() || ""
            });
        }

        return passengers;
    }

    function saveCurrentDraft() {
        const draft = getDraft();

        draft.from = fromEl.value;
        draft.to = toEl.value;
        draft.date = dateEl.value;

        const passengerCount = Number(pcountEl.value);
        draft.passengerCount = passengerCount;

        if (passengerForms.children.length > 0) {
            draft.passengers = getPassengerDetails();
        }

        saveDraft(draft);
    }

    function generatePassengerForms(count, savedPassengers = []) {
        passengerForms.replaceChildren();

        for (let i = 1; i <= count; i++) {
            const passenger = savedPassengers[i - 1] || {};

            const card = document.createElement("div");
            card.className = "passenger-card";

            const heading = document.createElement("h4");
            heading.textContent = `Passenger ${i}`;

            const nameInput = document.createElement("input");
            nameInput.type = "text";
            nameInput.id = `pname${i}`;
            nameInput.className = "book-input";
            nameInput.placeholder = "Full Name";
            nameInput.required = true;
            nameInput.value = passenger.name || "";

            const ageInput = document.createElement("input");
            ageInput.type = "number";
            ageInput.id = `page${i}`;
            ageInput.className = "book-input";
            ageInput.placeholder = "Age";
            ageInput.min = "1";
            ageInput.required = true;
            ageInput.value = passenger.age || "";

            const idInput = document.createElement("input");
            idInput.type = "text";
            idInput.id = `pid${i}`;
            idInput.className = "book-input";
            idInput.placeholder = "ID Proof (Aadhaar/PAN)";
            idInput.required = true;
            idInput.value = passenger.idProof || "";

            card.append(heading, nameInput, ageInput, idInput);
            passengerForms.appendChild(card);
        }
    }

    function restoreDraft() {
        const draft = getDraft();

        fromEl.value = draft.from || "";
        toEl.value = draft.to || "";
        dateEl.value = draft.date || "";

        if (draft.passengerCount) {
            pcountEl.value = String(draft.passengerCount);
        }

        if (Array.isArray(draft.passengers) && draft.passengers.length > 0) {
            generatePassengerForms(
                draft.passengers.length,
                draft.passengers
            );
        }
    }

    // Restore previously entered details on page load.
    restoreDraft();

    // Save search details as the user enters them.
    [fromEl, toEl, dateEl, pcountEl].forEach(element => {
        element.addEventListener("input", saveCurrentDraft);
        element.addEventListener("change", saveCurrentDraft);
    });

    // Save passenger details whenever they are edited.
    passengerForms.addEventListener("input", saveCurrentDraft);

    toPassengerBtn?.addEventListener("click", async () => {
        toPassengerBtn.disabled = true;

        try {
            const user = await getCurrentUser();

            if (!user) {
                alert("Please log in before booking a flight.");
                document.getElementById("nav-login")?.click();
                return;
            }

            const from = fromEl.value;
            const to = toEl.value;
            const date = dateEl.value;
            const passengerCount = Number(pcountEl.value);

            if (!from || !to || !date || !passengerCount) {
                alert("Please fill in all booking details.");
                return;
            }

            if (from === to) {
                alert("Source and destination cannot be the same.");
                return;
            }

            if (
                !Number.isInteger(passengerCount) ||
                passengerCount < 1 ||
                passengerCount > 9
            ) {
                alert("Please enter a valid passenger count (1–9).");
                return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const selectedDate = new Date(`${date}T00:00:00`);

            if (
                Number.isNaN(selectedDate.getTime()) ||
                selectedDate < today
            ) {
                alert("Please select a valid future date.");
                return;
            }

            const draft = getDraft();
            const savedPassengers = Array.isArray(draft.passengers)
                ? draft.passengers
                : [];

            // Regenerate only when the passenger count changes.
            if (passengerForms.children.length !== passengerCount) {
                generatePassengerForms(
                    passengerCount,
                    savedPassengers
                );
            }

            saveCurrentDraft();
            showStep(2);

            document.getElementById("bookBox")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {
            alert("Unable to verify your login. Please try again.");
            console.error("Authentication check failed:", error);

        } finally {
            toPassengerBtn.disabled = false;
        }
    });

    backToStep1?.addEventListener("click", () => {
        saveCurrentDraft();
        showStep(1);
    });
}
