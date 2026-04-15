function InfoRow({ iconClass, iconColor, label, value, breakWord = false, alignStart = false }) {
  return (
    <div className={`d-flex ${alignStart ? "align-items-start" : "align-items-center"} mb-4`}>
      <div
        className={`me-3 bg-light ${iconColor} rounded-circle d-flex justify-content-center align-items-center`}
        style={{ width: "45px", height: "45px", fontSize: "1.1rem" }}
      >
        <i className={iconClass}></i>
      </div>
      <div className="text-start">
        <div
          className="text-muted"
          style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}
        >
          {label}
        </div>
        <span
          className="fw-bold text-dark d-block"
          style={breakWord ? { wordBreak: "break-word" } : undefined}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function PatientInfoCard({ patient, isReceptionist, deletingPatient, onDeletePatient }) {
  return (
    <div className="detail-card p-4 h-100 text-start">
      <h6
        className="fw-bold text-muted mb-4 text-start"
        style={{ fontSize: "0.85rem", textTransform: "uppercase" }}
      >
        Thông tin cơ bản
      </h6>

      <InfoRow
        iconClass="fa-solid fa-phone"
        iconColor="text-primary"
        label="Điện thoại"
        value={patient.phone || "Chưa cập nhật"}
      />
      <InfoRow
        iconClass="fa-solid fa-location-dot"
        iconColor="text-danger"
        label="Địa chỉ"
        value={patient.address || "Chưa cập nhật"}
        breakWord
      />
      <InfoRow
        iconClass="fa-solid fa-clock-rotate-left"
        iconColor="text-success"
        label="Ngày đăng ký hệ thống"
        value={patient.registeredAt || "Chưa cập nhật"}
      />
      <InfoRow
        iconClass="fa-solid fa-notes-medical"
        iconColor="text-warning"
        label="Tiền sử bệnh lý"
        value={patient.medicalHistory || "Chưa cập nhật"}
        breakWord
        alignStart
      />

      {isReceptionist && (
        <>
          <hr className="text-muted opacity-25 my-4" />

          <button
            className="btn btn-outline-danger w-100 fw-bold rounded-pill"
            type="button"
            onClick={onDeletePatient}
            disabled={deletingPatient || !patient.active}
          >
            <i className="fa-solid fa-trash-can me-2"></i>
            {patient.active ? "Xóa bệnh nhân" : "Bệnh nhân đã bị khóa"}
          </button>
        </>
      )}
    </div>
  );
}

export default PatientInfoCard;