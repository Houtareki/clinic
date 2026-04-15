function ProfilePasswordSection({
  canChangePassword,
  isViewingOwnProfile,
  isManagedEmployeeProfile,
  passwordForm,
  onChange,
}) {
  if (!canChangePassword) return null;

  return (
    <>
      <div className="form-section-title d-flex justify-content-between align-items-center">
        <div>
          <i className="fa-solid fa-shield-halved me-2"></i>
          Bảo mật tài khoản
        </div>
        {isManagedEmployeeProfile && (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
            Đặt mật khẩu mới
          </span>
        )}
      </div>

      <div className="row g-4 mb-4">
        {isViewingOwnProfile ? (
          <div className="col-12">
            <label className="form-label fw-medium text-muted">Mật khẩu hiện tại</label>
            <input
              type="password"
              className="form-control bg-light"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={onChange}
              placeholder="••••••••"
            />
          </div>
        ) : null}

        <div className="col-md-6">
          <label className="form-label fw-medium text-muted">Mật khẩu mới</label>
          <input
            type="password"
            className="form-control bg-light"
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={onChange}
            placeholder="Nhập mật khẩu mới"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium text-muted">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            className="form-control bg-light"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={onChange}
            placeholder="Nhập lại mật khẩu mới"
          />
        </div>
      </div>
    </>
  );
}

export default ProfilePasswordSection;