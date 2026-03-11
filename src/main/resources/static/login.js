document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("form");

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

            switch (data.role) {
                case "ADMIN":
                    window.location.href = "/temp/admin/admin.html";
                    break;
                case "DOCTOR":
                    window.location.href = "/temp/doctor/doctor.html";
                    break;
                case "RECEPTIONIST":
                    window.location.href = "/temp/receptionist/receptionist.html";
                    break;

                default:
                    window.location.href = "/index.html";
            }
         })
        .catch((error) => {
            alert(error.message);
        })
    })
})