const API_BASE = "/api/v1/stores";

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

export const listStores = () => apiFetch("");

export const createStore = (data) =>
  apiFetch("", { method: "POST", body: JSON.stringify(data) });

export const updateStore = (id, data) =>
  apiFetch(`/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteStore = (id) =>
  apiFetch(`/${id}`, { method: "DELETE" });
