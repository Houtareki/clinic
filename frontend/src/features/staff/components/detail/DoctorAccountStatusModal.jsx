function DoctorAccountStatusModal({ doctor, locking, onClose, onConfirm }) {
  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      aria-hidden="true"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
          <div className="modal-body p-4 text-center">
            <div className="text-danger mb-3">
              <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "4rem" }}></i>
            </div>

            <h5 className="fw-bold mb-2 text-dark">
              {doctor?.active ? "Xác nhận khóa?" : "Xác nhận mở khóa?"}
            </h5>

            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
              {doctor?.active
                ? "Bạn có chắc chắn muốn khóa tài khoản này khỏi hệ thống?"
                : "Bạn có chắc chắn muốn mở khóa tài khoản này không?"}
            </p>

            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-light border px-4"
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                type="button"
                className={`btn px-4 shadow-sm ${doctor?.active ? "btn-danger" : "btn-success"}`}
                onClick={onConfirm}
                disabled={locking}
              >
                {locking ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorAccountStatusModal;