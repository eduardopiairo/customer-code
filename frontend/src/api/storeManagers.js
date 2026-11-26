import { request } from "./client";

const API_BASE = "/api/v1/store-managers";

function validateId(id) {
  if (!/^[a-zA-Z0-9_-]+$/.test(String(id))) {
    throw new Error("Invalid store manager ID");
  }
}

async function apiFetch(id = null, options = {}) {
  if (id !== null) validateId(id);
  const url = id !== null ? `${API_BASE}/${encodeURIComponent(id)}` : API_BASE;
  return request(url, options);
}

export const listStoreManagers = () => apiFetch();

export const createStoreManager = (data) =>
  apiFetch(null, { method: "POST", body: JSON.stringify(data) });

export const updateStoreManager = (id, data) =>
  apiFetch(id, { method: "PUT", body: JSON.stringify(data) });

export const deleteStoreManager = (id) =>
  apiFetch(id, { method: "DELETE" });
