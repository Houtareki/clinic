import { formatProfileDate, getProfileAvatar } from "../profileUtils";

function ProfileSidebarCard({
  profile,
  roleLabel,
  isDoctor,
  uploadingAvatar,
  canLockAccount,
  locking,
  fileInputRef,
  onAvatarUpload,
  onOpenFilePicker,
  onToggleLock,
}) {
  const avatarSrc = getProfileAvatar(profile);
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile.fullName || profile.username || "User",
  )}&background=0d6efd&color=fff&size=200`;

  return (
    <div className="detail-card p-4 text-center h-100 d-flex flex-column">
      <div className="mb-4 position-relative d-inline-block">
        <img
          src={avatarSrc}
          alt="Profile"
          className="profile-avatar-large"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackAvatar;
          }}
        />
      </div>

      <h4 className="fw-bold text-dark mb-1">{profile.fullName || "Chưa cập nhật"}</h4>
      <p className="text-muted mb-2">{roleLabel}</p>

      {isDoctor ? (
        <p className="text-muted small mb-4">
          Ngày gia nhập: {formatProfileDate(profile.createdAt)}
        </p>
      ) : (
        <p className="text-muted small mb-4">
          Trạng thái: {profile.active ? "Đang hoạt động" : "Đã khóa"}
        </p>
      )}

      <div className="mt-auto pt-4">
        <div className="upload-btn-wrapper w-100 mb-3">
          <button
            className="btn btn-light border fw-medium w-100"
            type="button"
            onClick={onOpenFilePicker}
            disabled={uploadingAvatar}
          >
            <i className="fa-solid fa-camera me-2"></i>
            {uploadingAvatar ? "Đang tải ảnh..." : "Đổi ảnh đại diện"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onAvatarUpload}
          />
        </div>

        {canLockAccount && (
          <button
            className={`btn w-100 fw-bold rounded-pill mb-3 ${
              profile.active ? "btn-outline-danger" : "btn-outline-success"
            }`}
            type="button"
            onClick={onToggleLock}
            disabled={locking}
          >
            <i
              className={`fa-solid me-2 ${profile.active ? "fa-lock" : "fa-lock-open"}`}
            ></i>
            {profile.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
          </button>
        )}

        <p className="text-muted fs-7 mb-0">
          Cho phép định dạng JPG, GIF hoặc PNG. Kích thước tối đa 2MB.
        </p>
      </div>
    </div>
  );
}

export default ProfileSidebarCard;