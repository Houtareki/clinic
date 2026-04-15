import { getPatientAvatar, getPatientMeta } from "../../utils/patientUtils";

function PatientCard({
  patient,
  canManagePatients,
  isDropdownOpen,
  onToggleDropdown,
  onOpenDetail,
  onEdit,
  onDelete,
}) {
  const fallbackAvatar = getPatientAvatar(patient);

  return (
    <div className="col">
      <div
        className={`doctor-card staff-card position-relative h-100 ${
          isDropdownOpen ? "staff-card-dropdown-open" : ""
        }`}
        onClick={onOpenDetail}
        style={{ cursor: "pointer" }}
      >
        {canManagePatients && (
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
                <button type="button" className="dropdown-item" onClick={onEdit}>
                  <i className="fa-regular fa-pen-to-square me-2 text-primary"></i>
                  Sửa
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="dropdown-item text-danger"
                  onClick={onDelete}
                >
                  <i className="fa-regular fa-trash-can me-2"></i>
                  Xóa
                </button>
              </li>
            </ul>
          </div>
        )}

        <div className="d-flex gap-3 text-decoration-none text-dark align-items-start staff-card-body">
          <div className="staff-avatar-box shadow-sm">
            <img
              src={fallbackAvatar}
              className="staff-avatar"
              alt={patient.fullName}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = fallbackAvatar;
              }}
            />
          </div>

          <div className="doctor-info staff-card-info flex-grow-1">
            <span className="badge staff-role-badge bg-success bg-opacity-10 text-success mb-2 border border-success border-opacity-25">
              Bệnh nhân
            </span>

            <h5 className="staff-card-name">{patient.fullName}</h5>

            <div className="text-muted mb-1 staff-card-specialty">
              {getPatientMeta(patient)}
            </div>

            <div className="text-muted staff-card-contact">
              <i className="fa-solid fa-phone me-2"></i>
              {patient.phone || "Chưa cập nhật"}
            </div>

            <div className="text-muted staff-card-contact">
              <i className="fa-solid fa-location-dot me-2"></i>
              {patient.address || "Chưa cập nhật"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientCard;
