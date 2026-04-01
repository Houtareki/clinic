const BASE = "/api";

export async function getAllEmployees() {
  const response = await fetch(`${BASE}/admin/employees`);

  if (!response.ok) throw new Error("Không tải được danh sách!");

  return response.json();
}

export async function getDoctors() {
  const response = await fetch(`${BASE}/admin/doctors`);

  if (!response.ok) throw new Error("Không tải được danh sách!");

  return response.json();
}

export async function deleteEmployee(id) {
  const response = await fetch(`${BASE}/admin/employees/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Xóa thất bại!");

  return response.json();
}
