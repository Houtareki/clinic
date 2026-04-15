const BASE = "/api/dashboard";

const parseResponse = async (response) => {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return rawText;
  }
};

export async function getDashboardStats({ role, accountId }) {
  const response = await fetch(`${BASE}/stats`, {
    headers: {
      "X-User-Role": String(role || "").toUpperCase(),
      "X-User-Id": String(accountId ?? 0),
    },
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      typeof payload === "string" && payload.trim() !== ""
        ? payload
        : "Khong tai duoc so lieu dashboard.",
    );
  }

  return payload || {};
}
