const API_BASE_URL = "/api/bookings";

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message =
            data.message ||
            data.error ||
            "Something went wrong. Please try again.";

        const error = new Error(message);
        error.status = response.status;
        error.details = data.errors || {};

        throw error;
    }

    return data;
}

export async function createBooking(bookingData) {
    return apiRequest("", {
        method: "POST",
        body: JSON.stringify(bookingData)
    });
}

export async function getUserBookings() {
    return apiRequest("", {
        method: "GET"
    });
}

export async function getBookingById(bookingId) {
    return apiRequest(`/${bookingId}`, {
        method: "GET"
    });
}
