const API_BASE_URL = "/api/flights";

export async function getFlights() {
    const response = await fetch(API_BASE_URL, {
        method: "GET",
        credentials: "same-origin"
    });

    const data = await response.json().catch(() => []);

    if (!response.ok) {
        throw new Error("Unable to load flights. Please try again.");
    }

    return data;
}