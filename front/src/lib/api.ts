import axios from "axios";

// ✅ Single source of truth for the key
const TOKEN_KEY = "auth_token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
  },
});

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // ✅ SSR guard — localStorage only exists in the browser
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ SSR guard here too
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  // ✅ Match the exact key your Laravel JWT returns
  // tymon/jwt-auth returns { access_token: "..." } by default, not { token: "..." }
  const token = response.data.access_token ?? response.data.token;
  localStorage.setItem(TOKEN_KEY, token);
  return response.data;
};

export const logout = async () => {
  await api.post("/auth/logout").catch(() => {}); // silent fail if token already expired
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = "/login";
};

// ── Products ──────────────────────────────────────────────────────────────────
export const createProduct = async (data: FormData) => {
  const response = await api.post("/products", data);
  return response.data;
};

export const updateProduct = async (id: string, data: FormData) => {
  data.append("_method", "PUT");
  const response = await api.post(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const getProducts = async (params?: Record<string, string>) => {
  const response = await api.get("/products", { params });
  return response.data;
};

export default api;