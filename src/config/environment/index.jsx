export const BASE_PATH = import.meta.env.VITE_BASE_PATH || "/admin";
export const AUTH_STATES = import.meta.env.VITE_AUTH_STATES || "401,498";
export const APP_URL = import.meta.env.VITE_APP_URL || `http://localhost:5173${BASE_PATH}`;
export const AUTH_API_HOST = import.meta.env.VITE_AUTH_API_HOST || "http://localhost:3000";
export const AUTH_API_PATH = import.meta.env.VITE_AUTH_API_PATH || "/api";
export const AUTH_STATIC_IMAGES_HOST = import.meta.env.VITE_AUTH_STATIC_IMAGES_HOST;
export const AUTH_IMAGES_API_PATH = import.meta.env.VITE_AUTH_IMAGES_API_PATH || "/api/files";
