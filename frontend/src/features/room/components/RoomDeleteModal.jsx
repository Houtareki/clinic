function RoomDeleteModal({ room, onClose, onConfirm }) {
  const isDeleteAction = room?.active;
  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px" }}
        >
          <div className="modal-body p-4 text-center">
            <div
              className={`mb-3 ${
                isDeleteAction ? "text-danger" : "text-success"
              }`}
            >
              <i
                className={`fa-solid ${isDeleteAction ? "fa-circle-exclamation" : "fa-unlock-keyhole"}`}
                style={{ fontSize: "4rem" }}
              ></i>
            </div>

            <h5 className="fw-bold mb-2 text-dark">
              {isDeleteAction ? "Xác nhận xóa?" : "Xác nhận khôi phục?"}
            </h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
              {isDeleteAction
                ? `Bạn có chắc chắn muốn xóa phòng ${room?.name} khỏi hệ thống?`
                : `Bạn có chắc chắn muốn khôi phục phòng ${room?.name} vào hệ thống?`}
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
                className={
                  isDeleteAction ? "btn btn-danger" : "btn btn-success"
                }
                onClick={onConfirm}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDeleteModal;
