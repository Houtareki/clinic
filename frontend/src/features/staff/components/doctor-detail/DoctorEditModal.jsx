import { useMemo } from "react";
import { SPECIALTY_OPTIONS } from "../../doctorDetailUtils";

function DoctorEditModal({ formData, saving, onChange, onClose, onSubmit }) {
  const specialtySelectOptions = useMemo(() => {
    if (!formData.specialty || SPECIALTY_OPTIONS.includes(formData.specialty)) {
      return SPECIALTY_OPTIONS;
    }

    return [formData.specialty, ...SPECIALTY_OPTIONS];
  }, [formData.specialty]);

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      aria-labelledby="editDoctorModalLabel"
      aria-hidden="true"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
          <div
            className="modal-header"
            style={{ backgroundColor: "#f5f8fa", borderRadius: "16px 16px 0 0" }}
          >
            <h5 className="modal-title fw-bold text-success" id="editDoctorModalLabel">
              <i className="fa-solid fa-user-doctor me-2"></i> Cap nhat ho so
            </h5>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            <form onSubmit={onSubmit}>
              <h6 className="fw-bold mb-3 text-muted">1. Thông tin tài khoản</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Họ và tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    value={formData.fullName}
                    onChange={onChange}
                    placeholder="VD: Nguyen Van A"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Số điện thoại <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={onChange}
                    placeholder="VD: 09xx xxx xxx"
                    required
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label fw-medium">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    placeholder="VD: abc@xyz.com"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Tên đăng nhập</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    disabled
                    readOnly
                    placeholder="username"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    placeholder="........"
                  />
                </div>
              </div>

              <hr className="text-muted" />

              <h6 className="fw-bold mb-3 text-muted">2. Hồ sơ chuyên môn</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Chuyên khoa <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="specialty"
                    value={formData.specialty}
                    onChange={onChange}
                    required
                  >
                    <option value="">Chọn khoa ...</option>
                    {specialtySelectOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Bằng cấp <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="degree"
                    value={formData.degree}
                    onChange={onChange}
                    placeholder="VD: Tien si"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-medium">Ảnh đại diện</label>
                  <input
                    type="text"
                    className="form-control"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={onChange}
                    placeholder="Link URL"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-medium">Tiểu sử</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="bio"
                    value={formData.bio}
                    onChange={onChange}
                    placeholder="Nhap kinh nghiem lam viec, gioi thieu ban than..."
                  ></textarea>
                </div>
              </div>

              <div
                className="modal-footer mt-4"
                style={{ borderTop: "1px solid #eaedf1", paddingTop: "1rem" }}
              >
                <button type="button" className="btn btn-light border" onClick={onClose}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary-custom"
                  disabled={saving}
                >
                  {saving ? "Dang luu..." : "Luu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorEditModal;