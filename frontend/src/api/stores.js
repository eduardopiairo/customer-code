import { request } from "./client";

const API_BASE = "/api/v1/stores";

const apiFetch = (path, options) => request(`${API_BASE}${path}`, options);

export const listStores = () => apiFetch("");

export const createStore = (data) =>
  apiFetch("", { method: "POST", body: JSON.stringify(data) });

export const updateStore = (id, data) =>
  apiFetch(`/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteStore = (id) =>
  apiFetch(`/${id}`, { method: "DELETE" });
