function ProfileLockModal({ active, locking, onClose, onConfirm }) {
  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
          <div className="modal-body p-4 text-center">
            <div className="text-danger mb-3">
              <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "4rem" }}></i>
            </div>

            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
              {active
                ? "Bạn có chắc chắn muốn khóa tài khoản này khỏi hệ thống?"
                : "Bạn có chắc chắn muốn mở khóa tài khoản này không?"}
            </p>

            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-light border px-4"
                onClick={onClose}
                disabled={locking}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 shadow-sm"
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

export default ProfileLockModal;