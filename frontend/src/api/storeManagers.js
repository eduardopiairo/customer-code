const API_BASE = "/api/v1/store-managers";

function validateId(id) {
  if (!/^[a-zA-Z0-9_-]+$/.test(String(id))) {
    throw new Error("Invalid store manager ID");
  }
}

async function apiFetch(id = null, options = {}) {
  if (id !== null) validateId(id);
  const url = id !== null ? `${API_BASE}/${encodeURIComponent(id)}` : API_BASE;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

export const listStoreManagers = () => apiFetch();

export const createStoreManager = (data) =>
  apiFetch(null, { method: "POST", body: JSON.stringify(data) });

export const updateStoreManager = (id, data) =>
  apiFetch(id, { method: "PUT", body: JSON.stringify(data) });

export const deleteStoreManager = (id) =>
  apiFetch(id, { method: "DELETE" });
