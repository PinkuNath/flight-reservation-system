
import {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser
} from "../api/authApi.js";

export function initAuth() {
    const navLogin = document.getElementById("nav-login");
    const navUser = document.getElementById("nav-user");
    const navLogout = document.getElementById("nav-logout");

    const authModal = document.getElementById("authModal");
    const authClose = document.getElementById("authClose");

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    const showSignup = document.getElementById("showSignup");
    const showLogin = document.getElementById("showLogin");

    const loginSubmit = document.getElementById("loginSubmit");
    const signupSubmit = document.getElementById("signupSubmit");

    const loginMsg = document.getElementById("authMsg");
    const signupMsg = document.getElementById("signupMsg");

    const loginUsernameInput = document.getElementById("loginUser");
    const loginPasswordInput = document.getElementById("loginPass");

    const usernameInput = document.getElementById("signupUsername");
    const fullNameInput = document.getElementById("signupFullName");
    const emailInput = document.getElementById("signupEmail");
    const phoneInput = document.getElementById("signupPhone");
    const passwordInput = document.getElementById("signupPass");

    let currentUser = null;

    function updateAuthUI(user) {
        currentUser = user;

        navLogin?.classList.toggle("hidden", Boolean(user));
        navUser?.classList.toggle("hidden", !user);
        navLogout?.classList.toggle("hidden", !user);

        if (user && navUser) {
            navUser.textContent = `Hi, ${user.username}`;
        }

        document.dispatchEvent(
            new CustomEvent("auth:changed", {
                detail: { user }
            })
        );
    }

    function openAuth(showLoginForm = true) {
        authModal.classList.remove("hidden");

        loginForm.classList.toggle("hidden", !showLoginForm);
        signupForm.classList.toggle("hidden", showLoginForm);

        loginMsg.textContent = "";
        signupMsg.textContent = "";
    }

    function closeAuth() {
        authModal.classList.add("hidden");
    }

    // Open login modal
    navLogin?.addEventListener("click", event => {
        event.preventDefault();
        openAuth(true);
    });

    authClose?.addEventListener("click", closeAuth);

    // Switch to signup
    showSignup?.addEventListener("click", event => {
        event.preventDefault();
        openAuth(false);
    });

    // Switch to login
    showLogin?.addEventListener("click", event => {
        event.preventDefault();
        openAuth(true);
    });

    // Registration
    signupSubmit?.addEventListener("click", async () => {
        const userData = {
            username: usernameInput.value.trim(),
            fullName: fullNameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
            phone: phoneInput.value.trim() || null
        };

        if (
            !userData.username ||
            !userData.fullName ||
            !userData.email ||
            !userData.password
        ) {
            signupMsg.textContent =
                "Please fill in all required fields.";
            return;
        }

        signupSubmit.disabled = true;
        signupMsg.textContent = "Creating your account...";

        try {
            await registerUser(userData);

            signupMsg.textContent =
                "Registration successful! You can now log in.";

            usernameInput.value = "";
            fullNameInput.value = "";
            emailInput.value = "";
            phoneInput.value = "";
            passwordInput.value = "";

        } catch (error) {
            signupMsg.textContent = error.message;

        } finally {
            signupSubmit.disabled = false;
        }
    });

    // Login
    loginSubmit?.addEventListener("click", async () => {
        const credentials = {
            username: loginUsernameInput.value.trim(),
            password: loginPasswordInput.value
        };

        if (!credentials.username || !credentials.password) {
            loginMsg.textContent =
                "Please enter your username and password.";
            return;
        }

        loginSubmit.disabled = true;
        loginMsg.textContent = "Logging in...";

        try {
            const user = await loginUser(credentials);

            updateAuthUI(user);
            closeAuth();

            loginUsernameInput.value = "";
            loginPasswordInput.value = "";

        } catch (error) {
            loginMsg.textContent = error.message;

        } finally {
            loginSubmit.disabled = false;
        }
    });

    // Logout
    navLogout?.addEventListener("click", async event => {
        event.preventDefault();

        navLogout.disabled = true;

        try {
            await logoutUser();

            updateAuthUI(null);
            closeAuth();

        } catch (error) {
            alert(error.message);

        } finally {
            navLogout.disabled = false;
        }
    });

    // Restore the session when the page loads
    async function restoreSession() {
        try {
            const user = await getCurrentUser();
            updateAuthUI(user);

        } catch (error) {
            console.error("Could not restore login session:", error);
            updateAuthUI(null);
        }
    }

    restoreSession();
}
