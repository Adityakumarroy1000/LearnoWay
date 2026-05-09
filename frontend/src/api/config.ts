const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://127.0.0.1:8000/api"
  : "/api";
const DEFAULT_FRIEND_SERVICE_URL = import.meta.env.DEV
  ? "http://127.0.0.1:4000"
  : "https://friend-service.example.com";

const extractSingleBaseUrl = (value: string) => {
  const candidates = value
    .split(",")
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);

  // Prefer absolute URLs first, otherwise keep first candidate (for relative `/api` style values).
  const preferred =
    candidates.find((item) => /^https?:\/\//i.test(item)) || candidates[0] || "";

  return preferred.replace(/\/+$/, "");
};

export const API_BASE_URL = extractSingleBaseUrl(
  (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).trim()
);

export const BACKEND_BASE = API_BASE_URL.replace(/\/api\/?$/, "");

export const FRIEND_SERVICE_URL = extractSingleBaseUrl(
  (import.meta.env.VITE_FRIEND_SERVICE_URL || DEFAULT_FRIEND_SERVICE_URL).trim()
);

if (
  !import.meta.env.DEV &&
  FRIEND_SERVICE_URL === "https://friend-service.example.com"
) {
  // Fail fast in production deployments when friend service URL is not configured.
  throw new Error(
    "Missing VITE_FRIEND_SERVICE_URL. Set it to your deployed serverless friend-service URL."
  );
}

export const buildApiUrl = (path: string) =>
  `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
