function PatientConfirmModal({
  title,
  message,
  confirmLabel = "Xác nhận",
  confirmClassName = "btn btn-danger px-4 shadow-sm",
  processing,
  processingLabel = "Đang xử lý...",
  onClose,
  onConfirm,
}) {
  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
          <div className="modal-body p-4 text-center">
            <div className="text-danger mb-3">
              <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "4rem" }}></i>
            </div>

            <h5 className="fw-bold mb-2 text-dark">{title}</h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
              {message}
            </p>

            <div className="d-flex justify-content-center gap-2">
              <button type="button" className="btn btn-light border px-4" onClick={onClose}>
                Hủy
              </button>
              <button type="button" className={confirmClassName} onClick={onConfirm} disabled={processing}>
                {processing ? processingLabel : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientConfirmModal;