function ProfileBasicSection({ profile, onChange }) {
  return (
    <>
      <div className="form-section-title">
        <i className="fa-regular fa-address-card me-2"></i>
        Thông tin cơ bản
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <label className="form-label fw-medium text-muted">Họ và Tên</label>
          <input
            type="text"
            className="form-control bg-light"
            name="fullName"
            value={profile.fullName || ""}
            onChange={onChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium text-muted">Tên đăng nhập</label>
          <input
            type="text"
            className="form-control profile-readonly-field"
            value={profile.username || ""}
            readOnly
            aria-readonly="true"
            title="Không thể đổi tên đăng nhập"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium text-muted">Số điện thoại</label>
          <input
            type="text"
            className="form-control bg-light"
            name="phone"
            value={profile.phone || ""}
            onChange={onChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium text-muted">Email liên hệ</label>
          <input
            type="email"
            className="form-control bg-light"
            name="email"
            value={profile.email || ""}
            onChange={onChange}
          />
        </div>
      </div>
    </>
  );
}

export default ProfileBasicSection;