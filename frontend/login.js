document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        console.error("Không tìm thấy form! Hãy kiểm tra lại file HTML.");
        return;
    }

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const loginInput = document.getElementById("username").value;
        const passwordInput = document.getElementById("password").value;

        fetch("/api/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                login: loginInput,
                password: passwordInput
            })
        })
        .then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed.");
            }

            return data;
        })
        .then(data => {
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("username", data.username);
            localStorage.setItem("fullName", data.fullName);
            localStorage.setItem("accountId", data.accountId);

            window.location.href = "/pages/dashboard.html";
        })
        .catch((error) => {
            alert(error.message);
        })
    })
})