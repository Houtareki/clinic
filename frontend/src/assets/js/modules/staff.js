let allStaffData = [];

async function loadStaffData() {
    const container = document.getElementById("staff-card-container");
    if (!container) return;

    const userRole = localStorage.getItem("userRole");

    const pageTitle = document.getElementById("staff-page-title");
    const addBtn = document.getElementById("add-staff-btn");
    const filterContainer = document.getElementById("staff-filter-container");

    if (userRole === "RECEPTIONIST") {
        if (pageTitle) pageTitle.innerText = "Danh sách Bác sĩ";
        if (addBtn) addBtn.classList.add("d-none");
        if (filterContainer) filterContainer.classList.add("d-none");
    } else {
        if (pageTitle) pageTitle.innerText = "Quản lý Nhân sự";
        if (addBtn) addBtn.classList.remove("d-none");
        if (filterContainer) filterContainer.classList.remove("d-none");
    }

    container.innerHTML = `<div class="col-12 text-center text-muted"><div class="spinner-border text-primary" role="status"></div><p>Đang tải dữ liệu...</p></div>`;

    try {
        let apiUrl = "";
        if (userRole === "ADMIN") {
            apiUrl = "/api/admin/employees";
        } else if (userRole === "RECEPTIONIST") {
            apiUrl = "/api/receptionist/doctors";
        }

        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Lỗi tải dữ liệu từ server");

        allStaffData = await res.json();

        renderStaffCards(allStaffData, userRole);
    } catch (error) {
        container.innerHTML = `<div class="col-12 text-center text-danger"><i class="fa-solid fa-circle-exclamation fs-1 mb-2"></i><br/>${error.message}</div>`;
    }
}

function renderStaffCards(dataList, userRole) {
    const container = document.getElementById("staff-card-container");
    let html = "";

    if (dataList.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted">Không tìm thấy nhân sự nào!</div>`;
        return;
    }

    dataList.forEach(staff => {
        let roleText = "";
        let badgeClass = "";
        let specText = "";

        if (staff.role === "ADMIN") {
            roleText = "Quản trị viên";
            badgeClass = "bg-danger text-danger border-danger";
            specText = "System Administrator";
        } else if (staff.role === "DOCTOR") {
            roleText = "Bác sĩ";
            badgeClass = "bg-primary text-primary border-primary";
            specText = "Khoa Khám bệnh";
        } else if (staff.role === "RECEPTIONIST") {
            roleText = "Lễ tân";
            badgeClass = "bg-success text-success border-success";
            specText = "Quầy tiếp đón";
        }

        const avatar = staff.avatarUrl || `https://ui-avatars.com/api/?name=${staff.fullName}&background=random&color=fff&size=120`;

        // admin only
        let actionMenuHtml = "";
        if (userRole === "ADMIN") {
            actionMenuHtml = `
                <div class="dropdown position-absolute top-0 end-0 mt-3 me-3" style="z-index: 2">
                    <button class="btn btn-sm btn-light dropdown-toggle dropdown-toggle-no-caret border-0 shadow-sm" type="button" data-bs-toggle="dropdown">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                        <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#editStaffModal"><i class="fa-regular fa-pen-to-square me-2 text-primary"></i> Sửa</a></li>
                        <li><a class="dropdown-item text-danger" href="#" data-bs-toggle="modal" data-bs-target="#deleteStaffModal"><i class="fa-regular fa-trash-can me-2"></i> Xóa</a></li>
                    </ul>
                </div>
            `;
        }

        html += `
            <div class="col">
                <div class="doctor-card position-relative h-100 bg-white p-3 rounded shadow-sm border">
                    ${actionMenuHtml}
                    <a href="#" class="d-flex gap-3 text-decoration-none text-dark stretched-link">
                        <img src="${avatar}" class="rounded-circle shadow-sm" width="80" height="80" style="object-fit: cover;" alt="${staff.fullName}" />
                        <div class="doctor-info flex-grow-1">
                            <span class="badge bg-opacity-10 mb-2 border border-opacity-25 ${badgeClass}">${roleText}</span>
                            <h5 class="fw-bold fs-6 mb-1">${staff.fullName}</h5>
                            <div class="text-muted" style="font-size: 0.85rem;">${specText}</div>
                            <div class="mt-2 text-muted" style="font-size: 0.85rem;">
                                <i class="fa-solid fa-envelope me-1"></i> ${staff.email}
                            </div>
                            <div class="text-muted" style="font-size: 0.85rem;">
                                <i class="fa-solid fa-phone me-1"></i> ${staff.phone}
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function filterStaff(roleFilter) {
    const userRole = localStorage.getItem("userRole");

    const btns = document.querySelectorAll(".filter-btn");
    btns.forEach(btn => {
        btn.classList.remove("btn-success");
        btn.classList.add("btn-outline-secondary");
    });

    const activeBtn = document.getElementById("btn-filter-" + roleFilter);
    if (activeBtn) {
        activeBtn.classList.remove("btn-outline-secondary");
        activeBtn.classList.add("btn-success");
    }

    if (roleFilter === 'ALL') {
        renderStaffCards(allStaffData, userRole);
    } else {
        const filteredData = allStaffData.filter(staff => staff.role === roleFilter);
        renderStaffCards(filteredData, userRole);
    }
}