import axios from "axios";
import { AUTH_STATES } from "../environment";

export const clearSession = () => {
	localStorage.removeItem("accessToken");
	localStorage.removeItem("refreshToken");
};

/**
 * Creates an Axios instance with optional authentication interceptors.
 *
 * @param {object}        options
 * @param {string}        options.baseURL              - Base URL of the API
 * @param {object}        [options.headers]            - Default headers sent with every request (default: {}).
 * @param {Function|null} [options.onRefresh]          - Async fn that renews the session.
 *                                                       If null, auth logic is disabled. (default: null)
 * @param {string}        [options.onExpired]          - URL to redirect to when session expires.
 *                                                       Defaults to baseURL.
 * @returns {import("axios").AxiosInstance}
 */
export function createApiConnection({
	baseURL,
	headers = {},
	onRefresh = null,
	onExpired = null,
}) {
	let errorRefresh = false;

	const instance = axios.create({ baseURL, headers });

	instance.interceptors.request.use(
		(config) => {
			if (errorRefresh) return Promise.reject("cancelled");
			const resolved = typeof headers === "function" ? headers() : headers;
			Object.assign(config.headers, resolved);
			return config;
		},
		(error) => Promise.reject(error),
	);

	instance.interceptors.response.use(
		(res) => {
			errorRefresh = false;
			return res;
		},
		async (err) => {
			const authStates = AUTH_STATES.split(",").map((s) => Number(s));
			const isAuthError = authStates.includes(err.response?.status);

			if (!isAuthError) return Promise.reject(err);
			if (errorRefresh) return Promise.reject(err);

			if (!onRefresh) {
				console.error(err.response);
				// No recovery flow configured: reject and let each future request try
				// again on its own merits. A connection with no onExpired either (e.g.
				// register/login, or the refresh POST itself) legitimately gets repeat
				// 401s — a wrong password retried correctly must still reach the server,
				// not be short-circuited by a lock nothing will ever clear.
				if (!onExpired) return Promise.reject(err);
				errorRefresh = true;
				clearSession();
				alert("Session has expired.");
				return (window.location.href = onExpired);
			}

			errorRefresh = true;
			try {
				const res = await onRefresh();

				if (res.status >= 400) throw res;

				errorRefresh = false;

				const { method, data, headers } = err.config;
				const response = await instance.request({
					url: err.config.url,
					method,
					data,
					headers,
				});

				return response;
			} catch (error) {
				const isExpiredAuth = authStates.includes(error?.response?.status);
				if (!isExpiredAuth) {
					errorRefresh = false;
					return Promise.reject(error);
				}

				console.error(error.response);
				// Same reasoning as above: only lock the connection when we're actually
				// about to navigate away. Without onExpired, leave it clear so the next
				// request (e.g. a corrected retry) isn't short-circuited forever.
				if (!onExpired) {
					errorRefresh = false;
					return Promise.reject(error);
				}
				errorRefresh = true;
				clearSession();
				alert("Session has expired.");
				return (window.location.href = onExpired);
			}
		},
	);

	return instance;
}
