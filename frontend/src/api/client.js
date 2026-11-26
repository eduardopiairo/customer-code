const TOKEN_KEY = "auth_token";
export const UNAUTHORIZED_EVENT = "auth:unauthorized";

export const getToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable: user will simply need to log in again */
  }
};

/** fetch + JSON handling shared by all API modules. */
export async function request(url, options = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const json = await res.json().catch(() => null);
  if (json === null) {
    throw new Error(
      `API unavailable or returned invalid data (HTTP ${res.status})`
    );
  }
  if (res.status === 401 && token && !url.endsWith("/auth/login")) {
    // token expired or revoked: send the user back to the login screen
    setToken(null);
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}
