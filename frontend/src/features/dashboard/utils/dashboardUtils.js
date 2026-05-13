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
    title: "Trạng thái tiếp đón hôm nay",
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
      to: "/dashboard/staff?quickAction=add-staff",
      icon: "fa-user-plus",
      title: "Thêm nhân sự",
      description: "Mở nhanh biểu mẫu tạo tài khoản nhân viên hoặc bác sĩ mới.",
      tone: "emerald",
    },
    {
      to: "/dashboard/rooms/admin?quickAction=add-room",
      icon: "fa-door-open",
      title: "Thêm phòng",
      description: "Mở nhanh biểu mẫu tạo phòng mới.",
      tone: "slate",
    },
  ],
  RECEPTIONIST: [
    {
      to: "/dashboard/patients?quickAction=add-patient",
      icon: "fa-hospital-user",
      title: "Thêm bệnh nhân",
      description: "Mở nhanh biểu mẫu tiếp nhận bệnh nhân mới.",
      tone: "blue",
    },
    {
      to: "/dashboard/shift?quickAction=add-shift",
      icon: "fa-calendar-plus",
      title: "Thêm lịch trực",
      description: "Mở nhanh form tạo ca trực và phân công bác sĩ theo phòng.",
      tone: "amber",
    },
  ],
  DOCTOR: [],
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
