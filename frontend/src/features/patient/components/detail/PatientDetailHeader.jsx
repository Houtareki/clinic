import { getPatientDetailAvatar } from "../../patientDetailUtils";

function PatientDetailHeader({
  patient,
  patientId,
  isReceptionist,
  onEditPatient,
  onAddRecord,
}) {
  const fallbackAvatar = getPatientDetailAvatar(patient);

  return (
    <div className="detail-card p-4 d-flex align-items-center justify-content-between position-relative">
      <div className="d-flex align-items-center">
        <img src={fallbackAvatar} alt="Avatar" className="profile-avatar me-4" />
        <div className="d-flex flex-column align-items-start text-start">
          <div className="text-primary fw-bold mb-1 text-start w-100" style={{ fontSize: "0.85rem" }}>
            #PT-{String(patient.patientId || patientId).padStart(4, "0")}
          </div>

          <h3 className="fw-bold text-dark mb-2 text-start w-100">
            {patient.fullName || "Chưa cập nhật"}
          </h3>

          <div className="d-flex gap-4 text-muted text-start w-100" style={{ fontSize: "0.85rem" }}>
            <span>
              <i className="fa-regular fa-calendar me-1"></i>
              {patient.dateOfBirth || "Chưa cập nhật"}
            </span>
            <span>
              <i className="fa-solid fa-venus-mars me-1"></i>
              {patient.gender || "Chưa cập nhật"}
            </span>
          </div>
        </div>
      </div>

      {isReceptionist && (
        <div className="d-flex gap-2">
          <button
            className="btn btn-light rounded-circle border shadow-sm"
            style={{ width: "45px", height: "45px" }}
            title="Chỉnh sửa hồ sơ"
            type="button"
            onClick={onEditPatient}
          >
            <i className="fa-solid fa-pen text-muted"></i>
          </button>

          <button
            className="btn btn-primary-custom px-4 shadow-sm"
            style={{ borderRadius: "8px" }}
            type="button"
            onClick={onAddRecord}
          >
            <i className="fa-regular fa-calendar-plus me-2"></i>
            Đặt lịch khám
          </button>
        </div>
      )}
    </div>
  );
}

export default PatientDetailHeader;