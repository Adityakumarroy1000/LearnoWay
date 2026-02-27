const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000/api";
const DEFAULT_FRIEND_SERVICE_URL = "http://127.0.0.1:4000";

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

export const API_BASE_URL = normalizeBaseUrl(
  (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).trim()
);

export const BACKEND_BASE = API_BASE_URL.replace(/\/api\/?$/, "");

export const FRIEND_SERVICE_URL = normalizeBaseUrl(
  (import.meta.env.VITE_FRIEND_SERVICE_URL || DEFAULT_FRIEND_SERVICE_URL).trim()
);

export const buildApiUrl = (path: string) =>
  `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
