import { createApiConnection } from "../api-connection";
import { APP_URL, AUTH_API_HOST, AUTH_API_PATH } from "../environment";

const apiPath = AUTH_API_PATH;

// ── Refresh connection ─────────────────────────────────────────────────────
// Plain connection with no auth interceptor — avoids refresh loop
const refreshConnection = createApiConnection({
	baseURL: AUTH_API_HOST,
});

const handleRefresh = async () => {
	const refreshToken = localStorage.getItem("refreshToken");
	const response = await refreshConnection.post(`${apiPath}/auth/refresh`, { refreshToken });
	const { accessToken, refreshToken: newRefreshToken } = response.data?.content || {};
	if (accessToken) localStorage.setItem("accessToken", accessToken);
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
	onExpired: APP_URL,
});

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
	GET_USER_LIST,
	ADD_USER,
	FIND_ONE_USER,
	UPDATE_USER,
	REPLACE_USER,
	REMOVE_USER,
};
