import { createApiConnection } from "../api-connection";
import { AUTH_API_HOST, AUTH_API_PATH } from "../environment";
import { LOGIN_PATH } from "../router/paths";

const apiPath = AUTH_API_PATH;

// ── Public connection ──────────────────────────────────────────────────────
// Plain connection with no auth interceptor — used for endpoints that don't
// require a session (register, login, refresh) and avoids the refresh loop.
const publicConnection = createApiConnection({
	baseURL: AUTH_API_HOST,
});

const handleRefresh = async () => {
	const refreshToken = localStorage.getItem("refreshToken");
	const response = await publicConnection.post(`${apiPath}/auth/refresh`, { refreshToken });
	// auth-service's refresh contract returns the access token as "token", not "accessToken"
	const { token, refreshToken: newRefreshToken } = response.data?.content || {};
	if (token) localStorage.setItem("accessToken", token);
	if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
	return response;
};

// ── Main connection ────────────────────────────────────────────────────────
export const basePathConfig = createApiConnection({
	baseURL: AUTH_API_HOST,
	headers: () => ({
		Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
	}),
	onRefresh: handleRefresh,
	onExpired: LOGIN_PATH,
});

export const REGISTER_USER = {
	name: "REGISTER_USER",
	method: async (data, config = publicConnection) => {
		const response = await config.post(`${apiPath}/auth/register`, data);
		return response.data;
	},
	response: {
		data: "content.user",
	},
};

export const LOGIN_USER = {
	name: "LOGIN_USER",
	method: async (data, config = publicConnection) => {
		const response = await config.post(`${apiPath}/auth/login`, data);
		const { token, refreshToken } = response.data?.content || {};
		if (token) localStorage.setItem("accessToken", token);
		if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
		return response.data;
	},
	response: {
		data: "content.user",
	},
};

export const FORGOT_PASSWORD = {
	name: "FORGOT_PASSWORD",
	method: async (data, config = publicConnection) => {
		const response = await config.post(`${apiPath}/auth/forgot-password`, data);
		return response.data;
	},
};

export const LOGOUT_USER = {
	name: "LOGOUT_USER",
	method: async (config = basePathConfig) => {
		const response = await config.post(`${apiPath}/auth/logout`);
		return response.data;
	},
};

// change-password overloads 401 as a *business* response ("current password
// doesn't match"), not a session-expiry signal — using basePathConfig here
// would make the shared interceptor treat a wrong password as an expired
// token, silently refresh, retry with the same wrong password, and loop.
// This connection carries the same Authorization header but skips the
// refresh/redirect-to-login behavior so a 401 just reaches the caller.
const changePasswordConnection = createApiConnection({
	baseURL: AUTH_API_HOST,
	headers: () => ({
		Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
	}),
});

export const CHANGE_PASSWORD = {
	name: "CHANGE_PASSWORD",
	method: async (data, config = changePasswordConnection) => {
		const response = await config.post(`${apiPath}/auth/change-password`, data);
		return response.data;
	},
};

// Step 2: confirms the 6-digit code emailed in step 1 and actually applies the
// new password. A wrong code is also a 401 here (counts as a failed attempt),
// so this reuses changePasswordConnection for the same reason as step 1.
export const CHANGE_PASSWORD_VERIFY = {
	name: "CHANGE_PASSWORD_VERIFY",
	method: async (data, config = changePasswordConnection) => {
		const response = await config.post(`${apiPath}/auth/change-password/verify`, data);
		return response.data;
	},
};

export const GET_USER_LIST = {
	name: "GET_USER_LIST",
	method: async (params = {}, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/user`, { params });
		return response.data;
	},
	response: {
		data: "content.records",
		count: "content.count",
	},
};

export const ADD_USER = {
	name: "ADD_USER",
	method: async (data, config = basePathConfig) => {
		const response = await config.post(`${apiPath}/user`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const FIND_ONE_USER = {
	name: "FIND_ONE_USER",
	method: async (id, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/user/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const UPDATE_USER = {
	name: "UPDATE_USER",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.patch(`${apiPath}/user/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REPLACE_USER = {
	name: "REPLACE_USER",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.put(`${apiPath}/user/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REMOVE_USER = {
	name: "REMOVE_USER",
	method: async (id, config = basePathConfig) => {
		const response = await config.delete(`${apiPath}/user/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export default {
	REGISTER_USER,
	LOGIN_USER,
	FORGOT_PASSWORD,
	LOGOUT_USER,
	CHANGE_PASSWORD,
	CHANGE_PASSWORD_VERIFY,
	GET_USER_LIST,
	ADD_USER,
	FIND_ONE_USER,
	UPDATE_USER,
	REPLACE_USER,
	REMOVE_USER,
};
