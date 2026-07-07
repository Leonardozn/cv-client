import { BASE_PATH } from "../environment";

// Normalize BASE_PATH so building compound paths never produces a double
// slash, whether BASE_PATH is the app root ("/") or a sub-path (e.g. "/admin").
const normalizedBase = BASE_PATH.replace(/\/+$/, "");

export const ROOT_PATH = normalizedBase || "/";
export const MAIN_PATH = normalizedBase.replace(/^\//, "");
export const REGISTER_PATH = `${normalizedBase}/register`;
export const LOGIN_PATH = `${normalizedBase}/login`;
export const HOME_PATH = `${normalizedBase}/home`;
