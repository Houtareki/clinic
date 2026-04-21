1. API Đăng nhập hệ thống
   **Mô tả:** Xác thực người dùng và trả về thông tin phân quyền.
   **URL:** `/api/auth/login`
   **Method:** `POST`
   **Role yêu cầu:** `Public`
   **Request Body (JSON):**

```json
{
  "login": "admin",
  "password": "123456"
}
```

**Response thành công (200 OK):**

```json
{
  "accountId": 1,
  "username": "admin",
  "fullName": "Nguyễn Văn A",
  "email": "admin@clinic.com",
  "role": "ADMIN"
}
```

**Các mã lỗi:**

- `400/401`: Sai thông tin đăng nhập.
- `403`: Tài khoản bị khóa (`Locked User`).

1. API Lấy danh sách nhân viên
   **Mô tả:** Lấy danh sách nhân viên có phân trang, lọc theo vai trò và tìm kiếm theo từ khóa.
   **URL:** `/api/admin/employees`
   **Method:** `GET`
   **Role yêu cầu:** `ADMIN`
   **Query Parameters:**

- `role` (optional): `ADMIN` hoặc `RECEPTIONIST`
- `page` (optional, mặc định `0`)
- `size` (optional, mặc định `10`)
- `keyword` (optional)
  **Response thành công (200 OK):**

```json
{
  "content": [
    {
      "id": 2,
      "username": "reception1",
      "fullName": "Lễ tân A",
      "email": "reception1@clinic.com",
      "phone": "0900000001",
      "role": "RECEPTIONIST",
      "avatarUrl": "https://example.com/avatar.jpg",
      "createdAt": "2026-04-16T08:00:00",
      "active": true
    }
  ]
}
```

**Các mã lỗi:**

- `400`: Giá trị `role`, `page` hoặc `size` không hợp lệ.

1. API Tạo nhân viên
   **Mô tả:** Tạo mới một tài khoản nhân viên không phải bác sĩ.
   **URL:** `/api/admin/employees`
   **Method:** `POST`
   **Role yêu cầu:** `ADMIN`
   **Request Body (JSON):**

```json
{
  "username": "reception2",
  "password": "123456",
  "fullName": "Lễ tân B",
  "email": "reception2@clinic.com",
  "phone": "0900000002",
  "avatarUrl": "https://example.com/avatar.jpg",
  "role": "RECEPTIONIST"
}
```

**Response thành công (201 Created):**

```json
{
  "id": 5,
  "username": "reception2",
  "fullName": "Lễ tân B",
  "email": "reception2@clinic.com",
  "phone": "0900000002",
  "role": "RECEPTIONIST",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2026-04-16T08:30:00",
  "active": true
}
```

**Các mã lỗi:**

- `400`: Username đã tồn tại.

1. API Cập nhật nhân viên
   **Mô tả:** Cập nhật thông tin nhân viên theo `id`.
   **URL:** `/api/admin/employees/{id}`
   **Method:** `PUT`
   **Role yêu cầu:** `ADMIN`
   **Path Parameters:**

- `id`: ID tài khoản nhân viên
  **Request Body (JSON):**

```json
{
  "fullName": "Lễ tân B cập nhật",
  "email": "reception2.new@clinic.com",
  "phone": "0900000999",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "password": "newpassword",
  "active": true
}
```

**Response thành công (200 OK):**

```json
{
  "id": 5,
  "username": "reception2",
  "fullName": "Lễ tân B cập nhật",
  "email": "reception2.new@clinic.com",
  "phone": "0900000999",
  "role": "RECEPTIONIST",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "createdAt": "2026-04-16T08:30:00",
  "active": true
}
```

**Các mã lỗi:**

- `400`: Không thể cập nhật bác sĩ bằng API này.
- `404`: Không tìm thấy tài khoản.

1. API Khóa mềm nhân viên
   **Mô tả:** Đánh dấu nhân viên là không hoạt động.
   **URL:** `/api/admin/employees/{id}`
   **Method:** `DELETE`
   **Role yêu cầu:** `ADMIN`
   **Path Parameters:**

- `id`: ID tài khoản nhân viên
  **Response thành công (200 OK):**

```json
"Xóa thành công"
```

**Các mã lỗi:**

- `404`: Không tìm thấy nhân viên.

1. API Mở khóa nhân viên
   **Mô tả:** Kích hoạt lại tài khoản nhân viên đã bị khóa mềm.
   **URL:** `/api/admin/employees/{id}/unlock`
   **Method:** `PUT`
   **Role yêu cầu:** `ADMIN`
   **Path Parameters:**

- `id`: ID tài khoản nhân viên
  **Response thành công (200 OK):**

```json
"Mở khóa thành công"
```

**Các mã lỗi:**

- `404`: Không tìm thấy nhân viên.

1. API Lấy danh sách bác sĩ cho admin
   **Mô tả:** Lấy danh sách bác sĩ có phân trang và tìm kiếm.
   **URL:** `/api/admin/doctors`
   **Method:** `GET`
   **Role yêu cầu:** `ADMIN`
   **Query Parameters:**

- `page` (optional, mặc định `0`)
- `size` (optional, mặc định `10`)
- `keyword` (optional)
  **Response thành công (200 OK):**

```json
{
  "content": [
    {
      "id": 7,
      "username": "doctor1",
      "fullName": "Bác sĩ A",
      "email": "doctor1@clinic.com",
      "phone": "0901111111",
      "role": "DOCTOR",
      "avatarUrl": "https://example.com/doctor.jpg",
      "createdAt": "2026-04-16T09:00:00",
      "active": true,
      "accountId": 7,
      "doctorId": 7,
      "specialty": "Nội tổng quát",
      "degree": "BSCKI",
      "bio": "Kinh nghiệm 5 năm"
    }
  ]
}
```

1. API Lấy chi tiết bác sĩ cho admin
   **Mô tả:** Lấy thông tin chi tiết một bác sĩ theo `id`.
   **URL:** `/api/admin/doctors/{id}`
   **Method:** `GET`
   **Role yêu cầu:** `ADMIN`
   **Path Parameters:**

- `id`: ID tài khoản bác sĩ
  **Response thành công (200 OK):**

```json
{
  "id": 7,
  "username": "doctor1",
  "fullName": "Bác sĩ A",
  "email": "doctor1@clinic.com",
  "phone": "0901111111",
  "role": "DOCTOR",
  "avatarUrl": "https://example.com/doctor.jpg",
  "createdAt": "2026-04-16T09:00:00",
  "active": true,
  "accountId": 7,
  "doctorId": 7,
  "specialty": "Nội tổng quát",
  "degree": "BSCKI",
  "bio": "Kinh nghiệm 5 năm"
}
```

**Các mã lỗi:**

- `404`: Không tìm thấy bác sĩ.

1. API Tạo bác sĩ
   **Mô tả:** Tạo mới tài khoản bác sĩ cùng hồ sơ chuyên môn.
   **URL:** `/api/admin/doctors`
   **Method:** `POST`
   **Role yêu cầu:** `ADMIN`
   **Request Body (JSON):**

```json
{
  "username": "doctor2",
  "password": "123456",
  "fullName": "Bác sĩ B",
  "phone": "0902222222",
  "email": "doctor2@clinic.com",
  "avatarUrl": "https://example.com/doctor2.jpg",
  "specialty": "Da liễu",
  "degree": "ThS.BS",
  "bio": "Kinh nghiệm 8 năm"
}
```

**Response thành công (201 Created):**

```json
{
  "id": 8,
  "username": "doctor2",
  "fullName": "Bác sĩ B",
  "email": "doctor2@clinic.com",
  "phone": "0902222222",
  "role": "DOCTOR",
  "avatarUrl": "https://example.com/doctor2.jpg",
  "createdAt": "2026-04-16T09:30:00",
  "active": true,
  "accountId": 8,
  "doctorId": 8,
  "specialty": "Da liễu",
  "degree": "ThS.BS",
  "bio": "Kinh nghiệm 8 năm"
}
```

**Các mã lỗi:**

- `400`: Username đã tồn tại.

1.  API Cập nhật bác sĩ
    **Mô tả:** Cập nhật thông tin tài khoản và hồ sơ chuyên môn của bác sĩ.
    **URL:** `/api/admin/doctors/{id}`
    **Method:** `PUT`
    **Role yêu cầu:** `ADMIN`
    **Path Parameters:**

- `id`: ID tài khoản bác sĩ
  **Request Body (JSON):**

```json
{
  "fullName": "Bác sĩ B cập nhật",
  "phone": "0902222999",
  "email": "doctor2.new@clinic.com",
  "avatarUrl": "https://example.com/doctor2-new.jpg",
  "password": "newpassword",
  "specialty": "Tim mạch",
  "degree": "BSCKII",
  "bio": "Chuyên điều trị tim mạch"
}
```

**Response thành công (200 OK):**

```json
{
  "id": 8,
  "username": "doctor2",
  "fullName": "Bác sĩ B cập nhật",
  "email": "doctor2.new@clinic.com",
  "phone": "0902222999",
  "role": "DOCTOR",
  "avatarUrl": "https://example.com/doctor2-new.jpg",
  "createdAt": "2026-04-16T09:30:00",
  "active": true,
  "accountId": 8,
  "doctorId": 8,
  "specialty": "Tim mạch",
  "degree": "BSCKII",
  "bio": "Chuyên điều trị tim mạch"
}
```

**Các mã lỗi:**

- `404`: Không tìm thấy bác sĩ.

1.  API Thống kê dashboard
    **Mô tả:** Trả về dữ liệu thống kê dashboard theo vai trò người dùng.
    **URL:** `/api/dashboard/stats`
    **Method:** `GET`
    **Role yêu cầu:** `ADMIN`, `RECEPTIONIST`, `DOCTOR`
    **Headers:**

- `X-User-Role`: `ADMIN` hoặc `RECEPTIONIST` hoặc `DOCTOR`
- `X-User-Id`: bắt buộc với `DOCTOR`, tùy chọn với vai trò khác
  **Response thành công (200 OK) cho ADMIN/RECEPTIONIST:**

```json
{
  "patientsToday": 0,
  "shiftsToday": 0,
  "totalDoctors": 12,
  "newPatientsToday": 5,
  "totalShiftsToday": 6,
  "totalAppointmentsToday": 14,
  "myShiftsToday": 0,
  "myAppointmentsToday": 0,
  "myPendingAppointments": 0,
  "myCompletedAppointments": 0
}
```

**Response thành công (200 OK) cho DOCTOR:**

```json
{
  "patientsToday": 0,
  "shiftsToday": 0,
  "totalDoctors": 0,
  "newPatientsToday": 0,
  "totalShiftsToday": 0,
  "totalAppointmentsToday": 0,
  "myShiftsToday": 2,
  "myAppointmentsToday": 8,
  "myPendingAppointments": 3,
  "myCompletedAppointments": 5
}
```

**Các mã lỗi:**

- `400`: `X-User-Role` không hợp lệ.

1.  API Lấy hồ sơ khám theo bệnh nhân
    **Mô tả:** Lấy danh sách hồ sơ khám của một bệnh nhân.
    **URL:** `/api/records/patient/{patientId}`
    **Method:** `GET`
    **Role yêu cầu:** `RECEPTIONIST`, `DOCTOR`
    **Path Parameters:**

- `patientId`: ID bệnh nhân
  **Response thành công (200 OK):**

```json
[
  {
    "recordId": 10,
    "patientId": 3,
    "patientName": "Nguyễn Văn B",
    "doctorId": 7,
    "doctorName": "Bác sĩ A",
    "shiftId": 4,
    "symptoms": "Đau đầu, sốt nhẹ",
    "diagnosis": "Cảm cúm",
    "note": "Uống thuốc và tái khám nếu cần",
    "status": "Hoàn thành",
    "examinedAt": "2026-04-16T10:30:00",
    "createdAt": "2026-04-16T09:50:00"
  }
]
```

1.  API Tạo hồ sơ khám
    **Mô tả:** Tạo mới hồ sơ khám cho bệnh nhân và tự gán ca trực đầu tiên hợp lệ của bác sĩ trong ngày hiện tại.
    **URL:** `/api/records/patient/{patientId}`
    **Method:** `POST`
    **Role yêu cầu:** `RECEPTIONIST`
    **Path Parameters:**

- `patientId`: ID bệnh nhân
  **Request Body (JSON):**

```json
{
  "doctor": {
    "id": 7
  },
  "symptoms": "Đau họng, sốt",
  "note": "Bệnh nhân khám lần đầu"
}
```

**Response thành công (201 Created):**

```json
{
  "recordId": 11,
  "patientId": 3,
  "patientName": "Nguyễn Văn B",
  "doctorId": 7,
  "doctorName": "Bác sĩ A",
  "shiftId": 4,
  "symptoms": "Đau họng, sốt",
  "diagnosis": null,
  "note": "Bệnh nhân khám lần đầu",
  "status": "Đang chờ",
  "examinedAt": null,
  "createdAt": "2026-04-16T10:00:00"
}
```

**Các mã lỗi:**

- `400`: Chưa chọn bác sĩ.
- `400`: Tài khoản được chọn không phải bác sĩ.
- `400`: Bác sĩ không có ca trực phù hợp trong ngày.
- `400`: Thông tin gửi lên không hợp lệ.

1.  API Cập nhật hồ sơ khám
    **Mô tả:** Cập nhật bác sĩ, triệu chứng, chẩn đoán, ghi chú hoặc trạng thái hồ sơ khám.
    **URL:** `/api/records/{id}`
    **Method:** `PUT`
    **Role yêu cầu:** `DOCTOR`, `RECEPTIONIST`
    **Path Parameters:**

- `id`: ID hồ sơ khám
  **Request Body (JSON):**

```json
{
  "doctor": {
    "id": 8
  },
  "symptoms": "Đau họng nhiều hơn",
  "diagnosis": "Viêm họng",
  "note": "Kê thuốc 5 ngày",
  "status": "Hoàn thành"
}
```

**Response thành công (200 OK):**

```json
{
  "recordId": 11,
  "patientId": 3,
  "patientName": "Nguyễn Văn B",
  "doctorId": 8,
  "doctorName": "Bác sĩ B",
  "shiftId": 6,
  "symptoms": "Đau họng nhiều hơn",
  "diagnosis": "Viêm họng",
  "note": "Kê thuốc 5 ngày",
  "status": "Hoàn thành",
  "examinedAt": "2026-04-16T10:45:00",
  "createdAt": "2026-04-16T10:00:00"
}
```

**Các mã lỗi:**

- `400`: Tài khoản được chọn không phải bác sĩ.
- `400`: Bác sĩ không có ca trực cho lịch khám đã chọn.
- `400`: Trạng thái ca khám không hợp lệ.
- `404`: Không tìm thấy ca khám.

1.  API Hủy hồ sơ khám
    **Mô tả:** Hủy hồ sơ khám bằng cách chuyển trạng thái sang `Hủy`.
    **URL:** `/api/records/{id}`
    **Method:** `DELETE`
    **Role yêu cầu:** `RECEPTIONIST`
    **Path Parameters:**

- `id`: ID hồ sơ khám
  **Response thành công (200 OK):**

```json
"Hủy thành công!"
```

**Các mã lỗi:**

- `404`: Không tìm thấy ca khám.

1.  API Lấy hồ sơ cá nhân
    **Mô tả:** Lấy thông tin hồ sơ của người dùng hiện tại.
    **URL:** `/api/profile/me`
    **Method:** `GET`
    **Role yêu cầu:** `ADMIN`, `RECEPTIONIST`, `DOCTOR`
    **Headers:**

- `X-User-Id`: ID người dùng hiện tại
  **Response thành công (200 OK) với tài khoản thường:**

```json
{
  "id": 2,
  "username": "reception1",
  "fullName": "Lễ tân A",
  "email": "reception1@clinic.com",
  "phone": "0900000001",
  "role": "RECEPTIONIST",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2026-04-16T08:00:00",
  "active": true
}
```

**Response thành công (200 OK) với bác sĩ:**

```json
{
  "id": 7,
  "username": "doctor1",
  "fullName": "Bác sĩ A",
  "email": "doctor1@clinic.com",
  "phone": "0901111111",
  "role": "DOCTOR",
  "avatarUrl": "https://example.com/doctor.jpg",
  "createdAt": "2026-04-16T09:00:00",
  "active": true,
  "accountId": 7,
  "doctorId": 7,
  "specialty": "Nội tổng quát",
  "degree": "BSCKI",
  "bio": "Kinh nghiệm 5 năm"
}
```

**Các mã lỗi:**

- `404`: Không tìm thấy người dùng.

1.  API Cập nhật hồ sơ cá nhân
    **Mô tả:** Cập nhật hồ sơ người dùng hiện tại; với bác sĩ có thể cập nhật thêm chuyên khoa, học vị và giới thiệu.
    **URL:** `/api/profile/profile`
    **Method:** `PUT`
    **Role yêu cầu:** `ADMIN`, `RECEPTIONIST`, `DOCTOR`
    **Headers:**

- `X-User-Id`: ID người dùng hiện tại
  **Request Body (JSON):**

```json
{
  "fullName": "Nguyễn Văn A cập nhật",
  "phone": "0908888888",
  "email": "updated@clinic.com",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "specialty": "Nhi khoa",
  "degree": "BSCKI",
  "bio": "Giới thiệu ngắn"
}
```

**Response thành công (200 OK):** Trả về đối tượng hồ sơ đã cập nhật, cùng cấu trúc với API `/api/profile/me`.
**Các mã lỗi:**

- `404`: Không tìm thấy người dùng.

1.  API Đổi mật khẩu
    **Mô tả:** Đổi mật khẩu cho người dùng hiện tại.
    **URL:** `/api/profile/change-password`
    **Method:** `PUT`
    **Role yêu cầu:** `ADMIN`, `RECEPTIONIST`, `DOCTOR`
    **Headers:**

- `X-User-Id`: ID người dùng hiện tại
  **Request Body (JSON):**

```json
{
  "currentPassword": "123456",
  "newPassword": "654321"
}
```

**Response thành công (200 OK):**

```json
"Đổi mật khẩu thành công!"
```

**Các mã lỗi:**

- `400`: Mật khẩu hiện tại không chính xác.
- `404`: Không tìm thấy người dùng.

1.  API Upload ảnh đại diện
    **Mô tả:** Upload ảnh đại diện dưới dạng `multipart/form-data`; hiện tại backend trả về URL giả lập.
    **URL:** `/api/profile/upload-avatar`
    **Method:** `POST`
    **Role yêu cầu:** `ADMIN`, `RECEPTIONIST`, `DOCTOR`
    **Headers:**

- `X-User-Id`: ID người dùng hiện tại
  **Request Body (form-data):**
- `file`: file ảnh
  **Response thành công (200 OK):**

```json
"https://ui-avatars.com/api/?name=Avatar&background=random"
```

**Các mã lỗi:**

- `400`: Chưa chọn file ảnh.

1.  API Lấy danh sách bác sĩ cho lễ tân
    **Mô tả:** Lấy danh sách bác sĩ rút gọn để phục vụ tiếp nhận bệnh nhân.
    **URL:** `/api/receptionist/doctors`
    **Method:** `GET`
    **Role yêu cầu:** `RECEPTIONIST`
    **Query Parameters:**

- `page` (optional, mặc định `0`)
- `size` (optional, mặc định `10`)
- `keyword` (optional)
  **Response thành công (200 OK):**

```json
{
  "content": [
    {
      "id": 7,
      "accountId": 7,
      "doctorId": 7,
      "fullName": "Bác sĩ A",
      "phone": "0901111111",
      "email": "doctor1@clinic.com",
      "specialty": "Nội tổng quát",
      "degree": "BSCKI"
    }
  ]
}
```

**Các mã lỗi:**

- `400`: Query không hợp lệ.

1.  API Lấy chi tiết bác sĩ cho lễ tân
    **Mô tả:** Lấy thông tin rút gọn của một bác sĩ theo `id`.
    **URL:** `/api/receptionist/doctors/{id}`
    **Method:** `GET`
    **Role yêu cầu:** `RECEPTIONIST`
    **Path Parameters:**

- `id`: ID tài khoản bác sĩ
  **Response thành công (200 OK):**

```json
{
  "id": 7,
  "accountId": 7,
  "doctorId": 7,
  "fullName": "Bác sĩ A",
  "phone": "0901111111",
  "email": "doctor1@clinic.com",
  "specialty": "Nội tổng quát",
  "degree": "BSCKI"
}
```

**Các mã lỗi:**

- `404`: Không tìm thấy bác sĩ.

1.  API Lấy danh sách bệnh nhân
    **Mô tả:** Lấy danh sách bệnh nhân có phân trang và tìm kiếm.
    **URL:** `/api/receptionist/patients`
    **Method:** `GET`
    **Role yêu cầu:** `RECEPTIONIST`
    **Query Parameters:**

- `page` (optional, mặc định `0`)
- `size` (optional, mặc định `10`)
- `keyword` (optional)
  **Response thành công (200 OK):**

```json
{
  "content": [
    {
      "patientId": 3,
      "fullName": "Nguyễn Văn B",
      "dateOfBirth": "1998-05-20",
      "age": 27,
      "gender": "Nam",
      "phone": "0911222333",
      "address": "Hà Nội",
      "medicalHistory": "Không",
      "active": true,
      "registeredAt": "2026-04-16T09:15:00"
    }
  ]
}
```

1.  API Lấy chi tiết bệnh nhân
    **Mô tả:** Lấy thông tin chi tiết một bệnh nhân theo `id`.
    **URL:** `/api/receptionist/patients/{id}`
    **Method:** `GET`
    **Role yêu cầu:** `RECEPTIONIST`
    **Path Parameters:**

- `id`: ID bệnh nhân
  **Response thành công (200 OK):**

```json
{
  "patientId": 3,
  "fullName": "Nguyễn Văn B",
  "dateOfBirth": "1998-05-20",
  "age": 27,
  "gender": "Nam",
  "phone": "0911222333",
  "address": "Hà Nội",
  "medicalHistory": "Không",
  "active": true,
  "registeredAt": "2026-04-16T09:15:00"
}
```

**Các mã lỗi:**

- `404`: Không tìm thấy bệnh nhân.

1.  API Tạo bệnh nhân
    **Mô tả:** Thêm mới hồ sơ bệnh nhân.
    **URL:** `/api/receptionist/patients`
    **Method:** `POST`
    **Role yêu cầu:** `RECEPTIONIST`
    **Request Body (JSON):**

```json
{
  "fullName": "Trần Thị C",
  "dateOfBirth": "1995-10-10",
  "gender": "Nữ",
  "phone": "0911888777",
  "address": "TP.HCM",
  "medicalHistory": "Dị ứng hải sản"
}
```

**Response thành công (201 Created):**

```json
{
  "patientId": 4,
  "fullName": "Trần Thị C",
  "dateOfBirth": "1995-10-10",
  "age": 30,
  "gender": "Nữ",
  "phone": "0911888777",
  "address": "TP.HCM",
  "medicalHistory": "Dị ứng hải sản",
  "active": true,
  "registeredAt": "2026-04-16T10:20:00"
}
```

**Các mã lỗi:**

- `400`: Số điện thoại này đã được đăng ký.

1.  API Cập nhật bệnh nhân
    **Mô tả:** Cập nhật thông tin bệnh nhân theo `id`.
    **URL:** `/api/receptionist/patients/{id}`
    **Method:** `PUT`
    **Role yêu cầu:** `RECEPTIONIST`
    **Path Parameters:**

- `id`: ID bệnh nhân
  **Request Body (JSON):**

```json
{
  "fullName": "Trần Thị C cập nhật",
  "dateOfBirth": "1995-10-10",
  "gender": "Nữ",
  "phone": "0911888999",
  "address": "Đà Nẵng",
  "medicalHistory": "Dị ứng hải sản",
  "active": true
}
```

**Response thành công (200 OK):**

```json
{
  "patientId": 4,
  "fullName": "Trần Thị C cập nhật",
  "dateOfBirth": "1995-10-10",
  "age": 30,
  "gender": "Nữ",
  "phone": "0911888999",
  "address": "Đà Nẵng",
  "medicalHistory": "Dị ứng hải sản",
  "active": true,
  "registeredAt": "2026-04-16T10:20:00"
}
```

**Các mã lỗi:**

- `404`: Không tìm thấy bệnh nhân.

1.  API Khóa mềm bệnh nhân
    **Mô tả:** Đánh dấu bệnh nhân là không hoạt động.
    **URL:** `/api/receptionist/patients/{id}`
    **Method:** `DELETE`
    **Role yêu cầu:** `RECEPTIONIST`
    **Path Parameters:**

- `id`: ID bệnh nhân
  **Response thành công (200 OK):**

```json
"Xóa thành công"
```

**Các mã lỗi:**

- `404`: Không tìm thấy bệnh nhân.

1.  API Lấy danh sách phòng
    **Mô tả:** Lấy danh sách phòng khám dạng option.
    **URL:** `/api/rooms`
    **Method:** `GET`
    **Role yêu cầu:** `RECEPTIONIST`, `DOCTOR`
    **Response thành công (200 OK):**

```json
[
  {
    "roomId": 1,
    "roomName": "Phòng 101"
  },
  {
    "roomId": 2,
    "roomName": "Phòng 102"
  }
]
```

1.  API Lấy danh sách ca trực
    **Mô tả:** Lấy danh sách ca trực theo khoảng ngày. Lễ tân xem toàn bộ, bác sĩ chỉ xem ca của chính mình.
    **URL:** `/api/shifts`
    **Method:** `GET`
    **Role yêu cầu:** `RECEPTIONIST`, `DOCTOR`
    **Query Parameters:**

- `startDate`: ngày bắt đầu, định dạng `yyyy-MM-dd`
- `endDate`: ngày kết thúc, định dạng `yyyy-MM-dd`
  **Headers:**
- `X-User-Role`: `RECEPTIONIST` hoặc `DOCTOR`
- `X-User-Id`: ID người dùng hiện tại
  **Response thành công (200 OK):**

```json
[
  {
    "shiftId": 4,
    "shiftDate": "2026-04-16",
    "period": "MORNING",
    "note": "Ca sáng",
    "periodDisplay": "Ca sáng",
    "rooms": [
      {
        "roomId": 1,
        "roomName": "Phòng 101",
        "doctors": [
          {
            "doctorId": 7,
            "doctorName": "Bác sĩ A",
            "avatarUrl": "https://example.com/doctor.jpg"
          }
        ]
      }
    ]
  }
]
```

**Các mã lỗi:**

- `400`: Header role không hợp lệ.
- `403`: Vai trò không có quyền xem danh sách ca trực.

1.  API Lấy chi tiết ca trực
    **Mô tả:** Lấy thông tin chi tiết của một ca trực.
    **URL:** `/api/shifts/{id}`
    **Method:** `GET`
    **Role yêu cầu:** `RECEPTIONIST`, `DOCTOR`
    **Path Parameters:**

- `id`: ID ca trực
  **Headers:**
- `X-User-Role`: `RECEPTIONIST` hoặc `DOCTOR`
- `X-User-Id`: ID người dùng hiện tại
  **Response thành công (200 OK):**

```json
{
  "shiftId": 4,
  "shiftDate": "2026-04-16",
  "period": "MORNING",
  "note": "Ca sáng",
  "periodDisplay": "Ca sáng",
  "rooms": [
    {
      "roomId": 1,
      "roomName": "Phòng 101",
      "doctors": [
        {
          "doctorId": 7,
          "doctorName": "Bác sĩ A",
          "avatarUrl": "https://example.com/doctor.jpg"
        }
      ]
    }
  ]
}
```

**Các mã lỗi:**

- `400`: Header role không hợp lệ.
- `403`: Bác sĩ không có quyền xem ca trực này.
- `404`: Không tìm thấy ca trực.

1.  API Tạo ca trực
    **Mô tả:** Tạo mới ca trực và gán bác sĩ theo từng phòng.
    **URL:** `/api/shifts`
    **Method:** `POST`
    **Role yêu cầu:** `RECEPTIONIST`
    **Headers:**

- `X-User-Role`: `RECEPTIONIST`
  **Request Body (JSON):**

```json
{
  "shiftDate": "2026-04-17",
  "period": "MORNING",
  "note": "Ca sáng ngày mai",
  "assignments": [
    {
      "roomId": 1,
      "doctorIds": [7, 8]
    },
    {
      "roomId": 2,
      "doctorIds": [9]
    }
  ]
}
```

**Response thành công (201 Created):**

```json
"Tạo ca trực thành công"
```

**Các mã lỗi:**

- `400`: Header role không hợp lệ.
- `403`: Chỉ lễ tân mới có quyền xếp lịch.
- `500`: Lỗi xử lý khi tạo ca trực.

1.  API Cập nhật ca trực
    **Mô tả:** Cập nhật ngày, buổi, ghi chú hoặc phân công bác sĩ cho ca trực.
    **URL:** `/api/shifts/{id}`
    **Method:** `PUT`
    **Role yêu cầu:** `RECEPTIONIST`
    **Path Parameters:**

- `id`: ID ca trực
  **Headers:**
- `X-User-Role`: `RECEPTIONIST`
  **Request Body (JSON):**

```json
{
  "shiftDate": "2026-04-18",
  "period": "AFTERNOON",
  "note": "Cập nhật ca chiều",
  "assignments": [
    {
      "roomId": 1,
      "doctorIds": [7]
    }
  ]
}
```

**Response thành công (200 OK):**

```json
"Cập nhật ca trực thành công"
```

**Các mã lỗi:**

- `400`: Header role không hợp lệ hoặc dữ liệu cập nhật không hợp lệ.
- `403`: Chỉ lễ tân mới có quyền sửa lịch.

1.  API Xóa ca trực
    **Mô tả:** Xóa một ca trực theo `id`.
    **URL:** `/api/shifts/{id}`
    **Method:** `DELETE`
    **Role yêu cầu:** `RECEPTIONIST`
    **Path Parameters:**

- `id`: ID ca trực
  **Headers:**
- `X-User-Role`: `RECEPTIONIST`
  **Response thành công (200 OK):**

```json
"Xóa ca trực thành công"
```

**Các mã lỗi:**

- `400`: Header role không hợp lệ hoặc không thể xóa ca trực.
- `403`: Chỉ lễ tân mới có quyền xóa.
