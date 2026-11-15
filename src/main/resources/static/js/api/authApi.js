
const API_BASE_URL = "/api/auth";

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

        throw error;
    }

    return data;
}

// Register a new account
export async function registerUser(userData) {
    return apiRequest("/register", {
        method: "POST",
        body: JSON.stringify(userData)
    });
}

// Login with username and password
export async function loginUser(credentials) {
    return apiRequest("/login", {
        method: "POST",
        body: JSON.stringify(credentials)
    });
}

// Get the currently authenticated user
export async function getCurrentUser() {
    try {
        return await apiRequest("/me", {
            method: "GET"
        });
    } catch (error) {
        if (error.status === 401) {
            return null;
        }

        throw error;
    }
}

// Logout the current user
export async function logoutUser() {
    return apiRequest("/logout", {
        method: "POST"
    });
}
