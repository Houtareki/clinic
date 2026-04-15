function ProfileDoctorSection({ visible, profile, onChange }) {
  if (!visible) return null;

  return (
    <>
      <div className="form-section-title d-flex justify-content-between align-items-center">
        <div>
          <i className="fa-solid fa-user-doctor me-2"></i>
          Hồ sơ Chuyên môn
        </div>
        <span className="badge bg-warning text-dark fs-7">Chỉ dành cho Bác sĩ</span>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <label className="form-label fw-medium text-muted">Chuyên khoa</label>
          <input
            type="text"
            className="form-control bg-light"
            name="specialty"
            value={profile.specialty || ""}
            onChange={onChange}
            placeholder="Nhập chuyên khoa"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium text-muted">Bằng cấp</label>
          <input
            type="text"
            className="form-control bg-light"
            name="degree"
            value={profile.degree || ""}
            onChange={onChange}
            placeholder="Nhập bằng cấp"
          />
        </div>

        <div className="col-12">
          <label className="form-label fw-medium text-muted">Giới thiệu bản thân (Bio)</label>
          <textarea
            className="form-control bg-light"
            rows="4"
            name="bio"
            value={profile.bio || ""}
            onChange={onChange}
            placeholder="Nhập phần giới thiệu bản thân"
          ></textarea>
        </div>
      </div>
    </>
  );
}

export default ProfileDoctorSection;