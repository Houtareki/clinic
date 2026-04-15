import React from "react";

function ShiftDrawer({
  show,
  title,
  confirmLabel,
  confirmDisabled,
  onConfirm,
  onClose,
  children,
  onDelete,
  deleteDisabled = false,
}) {
  if (!show) {
    return null;
  }

  return (
    <div
      className="offcanvas offcanvas-end show shadow-lg"
      style={{
        width: "400px",
        borderLeft: "none",
        visibility: "visible",
        backgroundColor: "#fff",
      }}
    >
      <div
        className="offcanvas-header"
        style={{ borderBottom: "1px solid #eaedf1", padding: "20px 24px" }}
      >
        <h5 className="offcanvas-title fw-bold" style={{ color: "#212529" }}>
          {title}
        </h5>

        {onDelete ? (
          <button
            type="button"
            className="btn btn-sm btn-dark rounded-pill px-3 ms-auto"
            onClick={onDelete}
            disabled={deleteDisabled}
          >
            <i className="fa-regular fa-trash-can"></i>
          </button>
        ) : null}

        <button
          type="button"
          className={`btn btn-sm btn-primary-custom rounded-pill px-3 ${
            onDelete ? "ms-2" : "ms-auto"
          }`}
          onClick={onConfirm}
          disabled={confirmDisabled}
        >
          {confirmLabel}
        </button>

        <button
          type="button"
          className="btn-close m-0 ms-2"
          onClick={onClose}
        ></button>
      </div>

      <div className="offcanvas-body p-4" style={{ backgroundColor: "#ffffff" }}>
        {children}
      </div>
    </div>
  );
}

export default ShiftDrawer;
