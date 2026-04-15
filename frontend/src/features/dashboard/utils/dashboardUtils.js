const ROLE_LABELS = {
  ADMIN: "Quản trị viên",
  DOCTOR: "Bác sĩ",
  RECEPTIONIST: "Lễ tân",
};

const HERO_CONTENT = {
  ADMIN: {
    title: "Tổng quan phòng khám",
    subtitle:
      "Theo dõi nhân sự, hoạt động và hiệu suất của phòng khám trong ngày.",
  },
  RECEPTIONIST: {
    title: "Trạng thái tiêp đón hôm nay",
    subtitle: "Theo dõi số lượng bệnh nhân đến, lịch hẹn và ca trực.",
  },
  DOCTOR: {
    title: "Lịch làm việc và khám bệnh hôm nay",
    subtitle:
      "Xem lịch trực, số lượng bệnh nhân và tình trạng các ca khám trong ngày.",
  },
};

const QUICK_LINKS = {
  ADMIN: [
    {
      to: "/dashboard/staff",
      icon: "fa-users",
      title: "Quản lý nhân sự",
      description: "Xem và quản lý thông tin nhân sự.",
      tone: "emerald",
    },
    {
      to: "/dashboard/profile",
      icon: "fa-id-badge",
      title: "Hồ sơ cá nhân",
      description: "Kiểm tra thông tin tài khoản và cập nhật hồ sơ quản trị.",
      tone: "slate",
    },
  ],
  RECEPTIONIST: [
    {
      to: "/dashboard/staff",
      icon: "fa-user-doctor",
      title: "Danh sách bác sĩ",
      description:
        "Theo dõi đội ngũ bác sĩ đang hoạt động và xem nhanh chi tiết.",
      tone: "emerald",
    },
    {
      to: "/dashboard/patients",
      icon: "fa-hospital-user",
      title: "Danh sách bệnh nhân",
      description: "Tiếp nhận, cập nhật hồ sơ và tạo lịch khám cho bệnh nhân.",
      tone: "blue",
    },
    {
      to: "/dashboard/shift",
      icon: "fa-calendar-days",
      title: "Quản lý lịch trực",
      description: "Theo dõi và cập nhật phân công ca trực trong ngày.",
      tone: "amber",
    },
  ],
  DOCTOR: [
    {
      to: "/dashboard/patients",
      icon: "fa-notes-medical",
      title: "Hồ sơ khám bệnh",
      description: "Mở nhanh danh sách bệnh nhân và cập nhật kết quả khám.",
      tone: "blue",
    },
    {
      to: "/dashboard/shift",
      icon: "fa-clock",
      title: "Lịch trực của tôi",
      description: "Kiểm tra ca trực trong tuần và phân bổ lịch làm việc.",
      tone: "emerald",
    },
  ],
};

const createAdminCards = (stats) => [
  {
    key: "total-doctors",
    icon: "fa-user-doctor",
    tone: "emerald",
    title: "Tổng số bác sĩ đang hoạt động",
    value: stats.totalDoctors ?? 0,
    helperText: "",
  },
  {
    key: "new-patients",
    icon: "fa-user-plus",
    tone: "blue",
    title: "Bệnh nhân mới hôm nay",
    value: stats.newPatientsToday ?? 0,
    helperText: "",
  },
  {
    key: "shifts",
    icon: "fa-calendar-check",
    tone: "amber",
    title: "Tổng ca trực hôm nay",
    value: stats.totalShiftsToday ?? 0,
    helperText: "",
  },
  {
    key: "appointments",
    icon: "fa-file-medical",
    tone: "slate",
    title: "Lịch khám tạo hôm nay",
    value: stats.totalAppointmentsToday ?? 0,
    helperText: "",
  },
];

const createDoctorCards = (stats) => [
  {
    key: "my-shifts",
    icon: "fa-calendar-day",
    tone: "emerald",
    title: "Ca trực của tôi hôm nay",
    value: stats.myShiftsToday ?? 0,
    helperText: "",
  },
  {
    key: "my-appointments",
    icon: "fa-stethoscope",
    tone: "blue",
    title: "Lịch khám của tôi hôm nay",
    value: stats.myAppointmentsToday ?? 0,
    helperText: "",
  },
  {
    key: "pending-appointments",
    icon: "fa-hourglass-half",
    tone: "amber",
    title: "Ca khám đang chờ",
    value: stats.myPendingAppointments ?? 0,
    helperText: "",
  },
  {
    key: "completed-appointments",
    icon: "fa-circle-check",
    tone: "slate",
    title: "Ca khám đã hoàn thành",
    value: stats.myCompletedAppointments ?? 0,
    helperText: "",
  },
];

export const getRoleLabel = (role) => ROLE_LABELS[role] || "Người dùng";

export const getHeroContent = (role) =>
  HERO_CONTENT[role] || {
    title: "Tổng quan hệ thống",
    subtitle: "Theo dõi các chỉ số vận hành quan trọng trong ngày.",
  };

export const getHeroSummary = (role, stats) => {
  if (role === "DOCTOR") {
    return `Hôm nay bạn đang có ${stats.myShiftsToday ?? 0} ca trực, ${stats.myAppointmentsToday ?? 0} lịch khám và ${stats.myPendingAppointments ?? 0} ca đang chờ xử lý.`;
  }

  return `Hệ thống hiện có ${stats.totalDoctors ?? 0} bác sĩ đang hoạt động, ${stats.newPatientsToday ?? 0} bệnh nhân mới và ${stats.totalAppointmentsToday ?? 0} lịch khám được tạo trong hôm nay.`;
};

export const getDashboardStatCards = (role, stats = {}) =>
  role === "DOCTOR" ? createDoctorCards(stats) : createAdminCards(stats);

export const getDashboardQuickLinks = (role) => QUICK_LINKS[role] || [];

export const formatLastUpdated = (date) => {
  if (!date) {
    return "Chưa cập nhật";
  }

  return `Cập nhật lúc ${date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};
