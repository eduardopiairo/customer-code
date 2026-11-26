import { request, setToken } from "./client";

export async function login(email, password) {
  const { access_token } = await request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(access_token);
}

export const logout = () => setToken(null);

export const getMe = () => request("/api/v1/auth/me");

export const createUser = (email, password) =>
  request("/api/v1/users", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
