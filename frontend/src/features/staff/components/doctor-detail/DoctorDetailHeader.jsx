import { getDoctorAvatar } from "../../doctorDetailUtils";

function DoctorDetailHeader({ doctor, doctorId, canManageDoctor, onEdit }) {
  const avatarSrc = getDoctorAvatar(doctor);
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    doctor?.fullName || "Doctor",
  )}&background=eaf7ed&color=264b33&size=120`;

  return (
    <div className="detail-card p-4 d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center">
        <img
          src={avatarSrc}
          alt="Avatar"
          className="profile-avatar me-4"
          style={{ width: "100px", height: "100px", borderWidth: "3px" }}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackAvatar;
          }}
        />
        <div className="d-flex flex-column align-items-start">
          <div className="text-primary fw-bold mb-1 text-start" style={{ fontSize: "0.85rem" }}>
            #DT-{String(doctor.id || doctorId).padStart(4, "0")}
          </div>
          <h3 className="fw-bold text-dark mb-2 text-start">
            {doctor.fullName || "Chưa cập nhật"}
          </h3>
          <div
            className="badge bg-light text-success border border-success-subtle px-3 py-2 rounded-pill text-start"
            style={{ fontSize: "0.85rem" }}
          >
            <i className="fa-solid fa-stethoscope me-1"></i>
            {(doctor.degree || "Bác sĩ") + " - " + (doctor.specialty || "Chưa cập nhật")}
          </div>
        </div>
      </div>

      {canManageDoctor && (
        <button
          className="btn btn-light rounded-circle border shadow-sm"
          style={{ width: "45px", height: "45px" }}
          title="Chỉnh sửa hồ sơ"
          type="button"
          onClick={onEdit}
        >
          <i className="fa-solid fa-pen text-muted"></i>
        </button>
      )}
    </div>
  );
}

export default DoctorDetailHeader;