import { createApiConnection } from "../api-connection";
import { APP_URL, CV_API_HOST, CV_API_PATH } from "../environment";

const apiPath = CV_API_PATH;

// ── Refresh connection ─────────────────────────────────────────────────────
// Plain connection with no auth interceptor — avoids refresh loop
const refreshConnection = createApiConnection({
	baseURL: CV_API_HOST,
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
	baseURL: CV_API_HOST,
	headers: () => ({
		Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
	}),
	onRefresh: handleRefresh,
	onExpired: APP_URL,
});

export const GET_CURRICULUM_LIST = {
	name: "GET_CURRICULUM_LIST",
	method: async (params = {}, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/curriculum`, { params });
		return response.data;
	},
	response: {
		data: "content.records",
		count: "content.count",
	},
};

export const ADD_CURRICULUM = {
	name: "ADD_CURRICULUM",
	method: async (data, config = basePathConfig) => {
		const response = await config.post(`${apiPath}/curriculum`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const FIND_ONE_CURRICULUM = {
	name: "FIND_ONE_CURRICULUM",
	method: async (id, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/curriculum/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const UPDATE_CURRICULUM = {
	name: "UPDATE_CURRICULUM",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.patch(`${apiPath}/curriculum/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REPLACE_CURRICULUM = {
	name: "REPLACE_CURRICULUM",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.put(`${apiPath}/curriculum/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REMOVE_CURRICULUM = {
	name: "REMOVE_CURRICULUM",
	method: async (id, config = basePathConfig) => {
		const response = await config.delete(`${apiPath}/curriculum/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const GET_EDUCATION_LIST = {
	name: "GET_EDUCATION_LIST",
	method: async (params = {}, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/education`, { params });
		return response.data;
	},
	response: {
		data: "content.records",
		count: "content.count",
	},
};

export const ADD_EDUCATION = {
	name: "ADD_EDUCATION",
	method: async (data, config = basePathConfig) => {
		const response = await config.post(`${apiPath}/education`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const FIND_ONE_EDUCATION = {
	name: "FIND_ONE_EDUCATION",
	method: async (id, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/education/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const UPDATE_EDUCATION = {
	name: "UPDATE_EDUCATION",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.patch(`${apiPath}/education/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REPLACE_EDUCATION = {
	name: "REPLACE_EDUCATION",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.put(`${apiPath}/education/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REMOVE_EDUCATION = {
	name: "REMOVE_EDUCATION",
	method: async (id, config = basePathConfig) => {
		const response = await config.delete(`${apiPath}/education/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const GET_EXPERIENCE_LIST = {
	name: "GET_EXPERIENCE_LIST",
	method: async (params = {}, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/experience`, { params });
		return response.data;
	},
	response: {
		data: "content.records",
		count: "content.count",
	},
};

export const ADD_EXPERIENCE = {
	name: "ADD_EXPERIENCE",
	method: async (data, config = basePathConfig) => {
		const response = await config.post(`${apiPath}/experience`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const FIND_ONE_EXPERIENCE = {
	name: "FIND_ONE_EXPERIENCE",
	method: async (id, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/experience/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const UPDATE_EXPERIENCE = {
	name: "UPDATE_EXPERIENCE",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.patch(`${apiPath}/experience/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REPLACE_EXPERIENCE = {
	name: "REPLACE_EXPERIENCE",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.put(`${apiPath}/experience/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REMOVE_EXPERIENCE = {
	name: "REMOVE_EXPERIENCE",
	method: async (id, config = basePathConfig) => {
		const response = await config.delete(`${apiPath}/experience/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const GET_CERTIFICATE_LIST = {
	name: "GET_CERTIFICATE_LIST",
	method: async (params = {}, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/certificate`, { params });
		return response.data;
	},
	response: {
		data: "content.records",
		count: "content.count",
	},
};

export const ADD_CERTIFICATE = {
	name: "ADD_CERTIFICATE",
	method: async (data, config = basePathConfig) => {
		const response = await config.post(`${apiPath}/certificate`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const FIND_ONE_CERTIFICATE = {
	name: "FIND_ONE_CERTIFICATE",
	method: async (id, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/certificate/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const UPDATE_CERTIFICATE = {
	name: "UPDATE_CERTIFICATE",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.patch(`${apiPath}/certificate/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REPLACE_CERTIFICATE = {
	name: "REPLACE_CERTIFICATE",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.put(`${apiPath}/certificate/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REMOVE_CERTIFICATE = {
	name: "REMOVE_CERTIFICATE",
	method: async (id, config = basePathConfig) => {
		const response = await config.delete(`${apiPath}/certificate/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const GET_SKILL_LIST = {
	name: "GET_SKILL_LIST",
	method: async (params = {}, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/skill`, { params });
		return response.data;
	},
	response: {
		data: "content.records",
		count: "content.count",
	},
};

export const ADD_SKILL = {
	name: "ADD_SKILL",
	method: async (data, config = basePathConfig) => {
		const response = await config.post(`${apiPath}/skill`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const FIND_ONE_SKILL = {
	name: "FIND_ONE_SKILL",
	method: async (id, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/skill/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const UPDATE_SKILL = {
	name: "UPDATE_SKILL",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.patch(`${apiPath}/skill/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REPLACE_SKILL = {
	name: "REPLACE_SKILL",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.put(`${apiPath}/skill/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REMOVE_SKILL = {
	name: "REMOVE_SKILL",
	method: async (id, config = basePathConfig) => {
		const response = await config.delete(`${apiPath}/skill/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const GET_TEMPLATE_LIST = {
	name: "GET_TEMPLATE_LIST",
	method: async (params = {}, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/template`, { params });
		return response.data;
	},
	response: {
		data: "content.records",
		count: "content.count",
	},
};

export const ADD_TEMPLATE = {
	name: "ADD_TEMPLATE",
	method: async (data, config = basePathConfig) => {
		const response = await config.post(`${apiPath}/template`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const FIND_ONE_TEMPLATE = {
	name: "FIND_ONE_TEMPLATE",
	method: async (id, config = basePathConfig) => {
		const response = await config.get(`${apiPath}/template/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const UPDATE_TEMPLATE = {
	name: "UPDATE_TEMPLATE",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.patch(`${apiPath}/template/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REPLACE_TEMPLATE = {
	name: "REPLACE_TEMPLATE",
	method: async (id, data, config = basePathConfig) => {
		const response = await config.put(`${apiPath}/template/${id}`, data);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export const REMOVE_TEMPLATE = {
	name: "REMOVE_TEMPLATE",
	method: async (id, config = basePathConfig) => {
		const response = await config.delete(`${apiPath}/template/${id}`);
		return response.data;
	},
	response: {
		data: "content",
	},
};

export default {
	GET_TEMPLATE_LIST,
	ADD_TEMPLATE,
	FIND_ONE_TEMPLATE,
	UPDATE_TEMPLATE,
	REPLACE_TEMPLATE,
	REMOVE_TEMPLATE,
	GET_SKILL_LIST,
	ADD_SKILL,
	FIND_ONE_SKILL,
	UPDATE_SKILL,
	REPLACE_SKILL,
	REMOVE_SKILL,
	GET_CERTIFICATE_LIST,
	ADD_CERTIFICATE,
	FIND_ONE_CERTIFICATE,
	UPDATE_CERTIFICATE,
	REPLACE_CERTIFICATE,
	REMOVE_CERTIFICATE,
	GET_EXPERIENCE_LIST,
	ADD_EXPERIENCE,
	FIND_ONE_EXPERIENCE,
	UPDATE_EXPERIENCE,
	REPLACE_EXPERIENCE,
	REMOVE_EXPERIENCE,
	GET_EDUCATION_LIST,
	ADD_EDUCATION,
	FIND_ONE_EDUCATION,
	UPDATE_EDUCATION,
	REPLACE_EDUCATION,
	REMOVE_EDUCATION,
	GET_CURRICULUM_LIST,
	ADD_CURRICULUM,
	FIND_ONE_CURRICULUM,
	UPDATE_CURRICULUM,
	REPLACE_CURRICULUM,
	REMOVE_CURRICULUM,
};
