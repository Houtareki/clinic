function DoctorBioCard({ doctor }) {
  return (
    <div className="detail-card p-4 text-start">
      <h6
        className="fw-bold text-muted mb-3 text-start"
        style={{ fontSize: "0.85rem", textTransform: "uppercase" }}
      >
        Giới thiệu
      </h6>
      <p className="text-muted mb-0 text-start" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
        {doctor.bio || "Hiện chưa có thông tin giới thiệu của bác sĩ này."}
      </p>
    </div>
  );
}

export default DoctorBioCard;
