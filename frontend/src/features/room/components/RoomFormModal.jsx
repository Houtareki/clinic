function RoomFormModal({ mode, formData, onChange, onClose, onSubmit }) {
  const isAddMode = mode === "ADD";

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px" }}
        >
          <div
            className="modal-header bg-light"
            style={{ borderRadius: "16px 16px 0 0" }}
          >
            <h5 className="modal-title fw-bold text-success">
              {isAddMode ? (
                <>
                  <i className="fa-solid fa-user-plus me-2"></i>
                  Thêm phòng
                </>
              ) : (
                <>
                  <i className="fa-regular fa-pen-to-square me-2"></i>
                  Cập nhật phòng
                </>
              )}
            </h5>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4">
            <form onSubmit={onSubmit}>
              <h6 className="fw-bold mb-3 text-muted">1. Thông tin phòng</h6>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Tên phòng <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Loại phòng <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="roomType"
                    value={formData.roomType}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Khoa <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="department"
                    value={formData.department}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Sức chứa <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="capacity"
                    value={formData.capacity}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-light border px-4"
                  onClick={onClose}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-success px-4 shadow-sm"
                >
                  <i className="fa-regular fa-floppy-disk me-2"></i>
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomFormModal;
