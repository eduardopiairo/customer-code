const API_BASE = "/api/v1/store-managers";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

export const listStoreManagers = () => apiFetch("");

export const createStoreManager = (data) =>
  apiFetch("", { method: "POST", body: JSON.stringify(data) });

export const updateStoreManager = (id, data) =>
  apiFetch(`/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteStoreManager = (id) =>
  apiFetch(`/${id}`, { method: "DELETE" });
