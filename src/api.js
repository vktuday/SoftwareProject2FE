const API_BASE_URL = "http://localhost:5000";

// Get JWT token from localStorage
export function getToken() {
  return localStorage.getItem("token");
}

// Save JWT token to localStorage
export function setToken(token) {
  localStorage.setItem("token", token);
  window.dispatchEvent(new Event("authchange")); // notify app
}

// Remove JWT token (logout)
export function clearToken() {
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("authchange")); // notify app
}

// Helper to call backend API endpoints
export async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Attach token if available (for protected endpoints)
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Send request to backend
  const res = await fetch(url, { ...options, headers });

  let data = null;

  // Safely parse response
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  // Throw readable error message when request fails
  if (!res.ok) {
    const message = data?.error || data?.message || "Request failed";
    throw new Error(message);
  }

  return data;
}