function RoomCard({
  room,
  canManageRoom,
  isDropdownOpen,
  onToggleDropdown,
  onEdit,
  onDelete,
  onUnlock,
}) {
  return (
    <div className="col">
      <div
        className={`doctor-card staff-card position-relative h-100 ${
          isDropdownOpen ? "staff-card-dropdown-open" : ""
        }`}
        style={{ cursor: "pointer" }}
      >
        {canManageRoom && (
          <div
            className="dropdown position-absolute top-0 end-0 mt-3 me-3"
            data-patient-dropdown-root
            style={{ zIndex: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="action-btn border-0 bg-transparent p-1 dropdown-toggle dropdown-toggle-no-caret"
              type="button"
              aria-expanded={isDropdownOpen}
              onClick={(event) => {
                event.stopPropagation();
                onToggleDropdown();
              }}
            >
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>

            <ul
              className={`dropdown-menu dropdown-menu-end shadow-sm border-0 staff-action-menu ${
                isDropdownOpen ? "show" : ""
              }`}
            >
              <li>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={onEdit}
                >
                  <i className="fa-regular fa-pen-to-square me-2 text-primary"></i>
                  Sửa
                </button>
              </li>
              <li>
                {room.active ? (
                  <button
                    type="button"
                    className="dropdown-item text-danger"
                    onClick={onDelete}
                  >
                    <i className="fa-regular fa-lock me-2"></i>
                    Khóa
                  </button>
                ) : (
                  <button
                    type="button"
                    className="dropdown-item text-success"
                    onClick={onUnlock}
                  >
                    <i className="fa-regular fa-lock-open me-2"></i>
                    Khôi phục
                  </button>
                )}
              </li>
            </ul>
          </div>
        )}

        <div className="d-flex gap-3 text-decoration-none text-dark align-items-start staff-card-body">
          <div
            className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center text-success"
            style={{ width: "50px", height: "50px" }}
          >
            <i className="fa-solid fa-door-open fs-4"></i>
          </div>

          <div className="doctor-info staff-card-info flex-grow-1">
            <div className="d-flex align-items-center gap-5">
              <h5 className="staff-card-name mb-2 text-dark fw-bold">
                {room.name}
              </h5>

              <span
                className={`badge ${room.active ? "bg-success" : "bg-danger"}`}
              >
                {room.active ? "Hoạt động" : "Đã khóa"}
              </span>
            </div>
            <div className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
              <i
                className="fa-solid fa-layer-group me-2"
                style={{ width: "16px" }}
              ></i>
              {room.roomType || "Chưa phân loại"}
            </div>

            <div className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
              <i
                className="fa-solid fa-stethoscope me-2"
                style={{ width: "16px" }}
              ></i>
              Khoa:{" "}
              <span className="fw-medium">
                {room.department || "Chưa cập nhật"}
              </span>
            </div>

            <div className="text-muted" style={{ fontSize: "0.85rem" }}>
              <i
                className="fa-solid fa-users me-2"
                style={{ width: "16px" }}
              ></i>
              Sức chứa: <span className="fw-medium">{room.capacity}</span> người
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomCard;
