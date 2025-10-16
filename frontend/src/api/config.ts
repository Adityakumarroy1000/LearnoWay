// src/api/config.ts
import api from "./axios";
export const BACKEND_BASE = (api.defaults.baseURL || "http://127.0.0.1:8000").replace(/\/api\/?$/, "");
