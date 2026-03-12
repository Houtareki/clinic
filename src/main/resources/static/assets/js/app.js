document.addEventListener("DOMContentLoaded", async () => {
    const userRole = localStorage.getItem("userRole");

    if (!userRole) {
        window.location.href = "../../login.html";
        return;
    }

    try {
        const [headerRes, sidebarRes] = await Promise.all([
            fetch("/header.html"),
            fetch("/sidebar.html")
        ]);

        document.getElementById("header-container").innerHTML = await headerRes.text();
        document.getElementById("sidebar-container").innerHTML = await sidebarRes.text();
    } catch (err) {
        console.error("Lỗi khi tải component:", err);
    }

    const fullName = localStorage.getItem("fullName") || "User";
    document.getElementById("userName").innerText = fullName;
    document.getElementById("userRole").innerText = userRole;

    const firstName = fullName.split(" ").pop();
    document.getElementById("userAvatar").src = `https://ui-avatars.com/api/?name=${firstName}&background=0d6efd&color=fff`;

    const menuConfig = {
        ADMIN: [
            {
                id: "dashboard",
                name: "Dashboard",
                icon: "fa-house",
                targetView: "view-dashboard",
                action: loadDashboardData
            },
            {id: "staff", name: "Quản lý Nhân sự", icon: "fa-users", targetView: "view-staff", action: loadStaffData},
            {
                id: "patients",
                name: "Danh sách bệnh nhân",
                icon: "fa-user",
                targetView: "view-patients",
                action: loadPatientsData
            }
        ],
        DOCTOR: [
            {
                id: "dashboard",
                name: "Dashboard",
                icon: "fa-house",
                targetView: "view-dashboard",
                action: loadDashboardData
            },
            {
                id: "patients",
                name: "Danh sách bệnh nhân",
                icon: "fa-users",
                targetView: "view-patients",
                action: loadPatientsData
            },
            {
                id: "shifts",
                name: "Lịch trực",
                icon: "fa-calendar-days",
                targetView: "view-shifts",
                action: loadShiftsData
            }
        ],
        RECEPTIONIST: [
            {
                id: "dashboard",
                name: "Dashboard",
                icon: "fa-house",
                targetView: "view-dashboard",
                action: loadDashboardData
            },
            {
                id: "patients",
                name: "Quản lý Bệnh nhân",
                icon: "fa-users",
                targetView: "view-patients",
                action: loadPatientsData
            },
            {
                id: "shifts",
                name: "Quản lý Lịch trực",
                icon: "fa-calendar-days",
                targetView: "view-shifts",
                action: loadShiftsData
            },
            {
                id: "doctors",
                name: "Danh sách Bác sĩ",
                icon: "fa-user-doctor",
                targetView: "view-doctors",
                action: loadDoctorsData
            }
        ]
    };

    const allowedMenus = menuConfig[userRole] || [];
    let menuHtml = "";

    allowedMenus.forEach((item, index) => {
        const isActive = index === 0 ? "active bg-primary text-white" : "text-dark";
        menuHtml += `
            <li class="nav-item mb-2">
                <a class="nav-link p-3 sidebar-btn ${isActive}" href="#" 
                   data-id="${item.id}" 
                   data-view="${item.targetView}">
                    <i class="fa-solid ${item.icon} me-2"></i> ${item.name}
                </a>
            </li>
        `;
    });

    document.getElementById("sidebarMenu").innerHTML = menuHtml;

    const sidebarBtn = document.querySelectorAll(".sidebar-btn");
    const allViews = document.querySelectorAll(".page_view");

    sidebarBtn.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();

            sidebarBtn.forEach(btn => btn.classList.remove("active", "bg-primary", "text-white"));
            sidebarBtn.forEach(btn => btn.classList.add("text-dark"));
            this.classList.remove("text-dark");
            this.classList.add("active", "bg-primary", "text-white");

            // ẩn toàn bộ chức năng
            allViews.forEach(view => view.classList.add("d-none"));

            // b. Lấy ID của màn hình cần hiện từ data-view và cho nó hiện lên
            const targetViewId = this.getAttribute("data-view");
            document.getElementById(targetViewId).classList.remove("d-none");

            // c. Tìm hàm action tương ứng trong config và chạy hàm đó để gọi API
            const menuId = this.getAttribute("data-id");
            const menuItem = allowedMenus.find(item => item.id === menuId);
            if (menuItem && typeof menuItem.action === "function") {
                menuItem.action();
            }
        });
    });

    if (allowedMenus.length > 0) {
        document.getElementById(allowedMenus[0].targetView).classList.remove("d-none");
        if (typeof allowedMenus[0].action === "function") {
            allowedMenus[0].action();
        }
    }
});

function loadDashboardData() {
    document.getElementById("total-doctors-stat").innerText = "24";
    document.getElementById("today-patients-stat").innerText = "150";
    document.getElementById("today-shifts-stat").innerText = "8";
    document.getElementById("satisfaction-stat").innerText = "99%";
}

function loadStaffData() { console.log("Gọi API lấy nhân sự..."); }
function loadPatientsData() { console.log("Gọi API lấy bệnh nhân..."); }
function loadShiftsData() { console.log("Gọi API lấy lịch trực..."); }
function loadDoctorsData() { console.log("Gọi API lấy bác sĩ..."); }


















