
import { initAuth } from "./ui/auth.js";
import { initNavigation } from "./ui/navigation.js";
import { initBooking } from "./ui/booking.js";
import { initFlight } from "./ui/flight.js";
import { initBookings } from "./ui/bookings.js";

document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initAuth();
    initBooking();
    initFlight();
    initBookings();

    console.log("Java Airlines frontend initialized.");
});
