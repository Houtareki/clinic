import { formatDoctorDate } from "../../doctorDetailUtils";

function InfoRow({ iconClass, iconColor, label, value, breakWord = false }) {
  return (
    <div className="d-flex align-items-center mb-4">
      <div
        className={`me-3 bg-light ${iconColor} rounded-circle d-flex justify-content-center align-items-center`}
        style={{ width: "45px", height: "45px", fontSize: "1.1rem" }}
      >
        <i className={iconClass}></i>
      </div>
      <div>
        <div
          className="text-muted"
          style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}
        >
          {label}
        </div>
        <span className="fw-bold text-dark" style={breakWord ? { wordBreak: "break-all" } : undefined}>
          {value}
        </span>
      </div>
    </div>
  );
}

function DoctorContactCard({ doctor, canManageDoctor, locking, onToggleStatus }) {
  return (
    <div className="detail-card p-4 h-100 text-start">
      <h6 className="fw-bold text-muted mb-4" style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>
        Thông tin liên hệ
      </h6>

      <InfoRow
        iconClass="fa-solid fa-phone"
        iconColor="text-primary"
        label="Điện thoại"
        value={doctor.phone || "Chua cap nhat"}
      />
      <InfoRow
        iconClass="fa-regular fa-envelope"
        iconColor="text-danger"
        label="Email"
        value={doctor.email || "Chua cap nhat"}
        breakWord
      />
      <InfoRow
        iconClass="fa-regular fa-calendar-check"
        iconColor="text-success"
        label="Ngày gia nhập"
        value={formatDoctorDate(doctor.createdAt)}
      />

      {canManageDoctor && (
        <>
          <hr className="text-muted opacity-25 my-4" />

          <button
            className={`btn w-100 fw-bold rounded-pill ${
              doctor?.active ? "btn-outline-danger" : "btn-outline-success"
            }`}
            type="button"
            onClick={onToggleStatus}
            disabled={locking}
          >
            <i
              className={`fa-solid me-2 ${doctor?.active ? "fa-lock" : "fa-lock-open"}`}
            ></i>
            {doctor?.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
          </button>
        </>
      )}
    </div>
  );
}

export default DoctorContactCard;