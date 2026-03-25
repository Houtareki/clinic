const BASE = "/api";

export async function loginApi(username, password) {
  const response = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login: username, password: password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Đăng nhập thất bại!");
  }

  return data;
}
