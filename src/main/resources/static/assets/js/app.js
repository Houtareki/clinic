document.addEventListener("DOMContentLoaded", async () => {
    const userRole = localStorage.getItem("userRole");

    if (!userRole) {
        window.location.href = "/login.html";
        return;
    }

    try {
        const [headerRes, sidebarRes] = await Promise.all([
            fetch("/components/header.html"),
            fetch("/components/sidebar.html")
        ]);

        if (!headerRes.ok || !sidebarRes.ok) throw new Error("Không tìm thấy file component!");

        document.getElementById("header-container").innerHTML = await headerRes.text();
        document.getElementById("sidebar-container").innerHTML = await sidebarRes.text();
    } catch (err) {
        console.error("Lỗi khi tải component:", err);
        return;
    }

    // 3. Render thông tin cá nhân lên Header
    const fullName = localStorage.getItem("fullName") || "User";
    document.getElementById("userName").innerText = fullName;
    document.getElementById("userRole").innerText = userRole;

    const firstName = fullName.split(" ").pop();
    document.getElementById("userAvatar").src = `https://ui-avatars.com/api/?name=${firstName}&background=0d6efd&color=fff`;

    // 4. Khởi tạo Menu Config
    const menuConfig = {
        ADMIN: [
            { id: "dashboard", name: "Dashboard", icon: "fa-house", targetView: "view-dashboard", action: loadDashboardData },
            { id: "staff", name: "Quản lý Nhân sự", icon: "fa-users", targetView: "view-staff", action: loadStaffData },
            { id: "patients", name: "Danh sách bệnh nhân", icon: "fa-user", targetView: "view-patients", action: loadPatientsData }
        ],
        DOCTOR: [
            { id: "dashboard", name: "Dashboard", icon: "fa-house", targetView: "view-dashboard", action: loadDashboardData },
            { id: "patients", name: "Danh sách bệnh nhân", icon: "fa-users", targetView: "view-patients", action: loadPatientsData },
            { id: "shifts", name: "Lịch trực", icon: "fa-calendar-days", targetView: "view-shifts", action: loadShiftsData }
        ],
        RECEPTIONIST: [
            { id: "dashboard", name: "Dashboard", icon: "fa-house", targetView: "view-dashboard", action: loadDashboardData },
            { id: "patients", name: "Quản lý Bệnh nhân", icon: "fa-users", targetView: "view-patients", action: loadPatientsData },
            { id: "shifts", name: "Quản lý Lịch trực", icon: "fa-calendar-days", targetView: "view-shifts", action: loadShiftsData },
            { id: "doctors", name: "Danh sách Bác sĩ", icon: "fa-user-doctor", targetView: "view-doctors", action: loadDoctorsData }
        ]
    };

    // 5. Vẽ Sidebar
    const allowedMenus = menuConfig[userRole] || [];

    let menuHtml = `<li class="menu-title">Tổng quan</li>`;

    allowedMenus.forEach((item, index) => {
        const isActive = index === 0 ? "active" : "";
        menuHtml += `
            <li class="${isActive}">
                <a href="#" class="sidebar-btn" data-id="${item.id}" data-view="${item.targetView}">
                    <i class="fa-solid ${item.icon}"></i> ${item.name}
                </a>
            </li>
        `;
    });

    document.getElementById("sidebarMenu").innerHTML = menuHtml;

    const sidebarBtns = document.querySelectorAll(".sidebar-btn");
    const allViews = document.querySelectorAll(".page-view");

    sidebarBtns.forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();

            document.querySelectorAll("#sidebarMenu li").forEach(li => li.classList.remove("active"));

            this.parentElement.classList.add("active");

            // Ẩn toàn bộ chức năng
            allViews.forEach(view => view.classList.add("d-none"));

            // Hiện chức năng tương ứng
            const targetViewId = this.getAttribute("data-view");
            document.getElementById(targetViewId).classList.remove("d-none");

            // Gọi API đổ dữ liệu
            const menuId = this.getAttribute("data-id");
            const menuItem = allowedMenus.find(item => item.id === menuId);
            if (menuItem && typeof menuItem.action === "function") {
                menuItem.action();
            }
        });
    });
    // Mặc định chạy Load Data của nút đầu tiên khi vào web
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