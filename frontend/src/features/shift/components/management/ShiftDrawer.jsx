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
      className="offcanvas offcanvas-end show shadow-lg shift-drawer"
      style={{ visibility: "visible" }}
    >
      <div className="offcanvas-header shift-drawer-header">
        <div className="shift-drawer-title-group">
          <h5 className="offcanvas-title fw-bold text-dark mb-0">{title}</h5>
        </div>

        <div className="shift-drawer-actions">
          {onDelete ? (
            <button
              type="button"
              className="btn btn-sm btn-dark rounded-pill px-3"
              onClick={onDelete}
              disabled={deleteDisabled}
            >
              <i className="fa-regular fa-trash-can me-1"></i>
              Xoa ca
            </button>
          ) : null}

          <button
            type="button"
            className="btn btn-sm btn-primary-custom rounded-pill px-3"
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </button>

          <button
            type="button"
            className="btn-close m-0"
            onClick={onClose}
          ></button>
        </div>
      </div>

      <div className="offcanvas-body shift-drawer-body">
        {children}
      </div>
    </div>
  );
}

export default ShiftDrawer;
