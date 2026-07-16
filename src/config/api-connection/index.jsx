import axios from "axios";
import { AUTH_STATES } from "../environment";

export const clearSession = () => {
	localStorage.removeItem("accessToken");
	localStorage.removeItem("refreshToken");
	localStorage.removeItem("isAdmin");
	localStorage.removeItem("user");
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
	// In-flight refresh, shared across every request that fails concurrently while it's running.
	// Each of them awaits this SAME promise and retries with the new token once it settles, instead
	// of only the first failure refreshing while the rest reject outright — the previous boolean
	// flag caused exactly that: concurrent requests (e.g. the Curriculum page loading Education/
	// Experience/Certificate together) would show a session error even though the token had just
	// been refreshed successfully a moment later.
	let refreshPromise = null;

	const instance = axios.create({ baseURL, headers });

	instance.interceptors.request.use(
		(config) => {
			if (refreshPromise) return Promise.reject("cancelled");
			const resolved = typeof headers === "function" ? headers() : headers;
			Object.assign(config.headers, resolved);
			return config;
		},
		(error) => Promise.reject(error),
	);

	instance.interceptors.response.use(
		(res) => res,
		async (err) => {
			const authStates = AUTH_STATES.split(",").map((s) => Number(s));
			const isAuthError = authStates.includes(err.response?.status);

			if (!isAuthError) return Promise.reject(err);

			if (!onRefresh) {
				console.error(err.response);
				// No recovery flow configured: reject and let each future request try
				// again on its own merits. A connection with no onExpired either (e.g.
				// register/login, or the refresh POST itself) legitimately gets repeat
				// 401s — a wrong password retried correctly must still reach the server,
				// not be short-circuited by a lock nothing will ever clear.
				if (!onExpired) return Promise.reject(err);
				clearSession();
				return (window.location.href = onExpired);
			}

			try {
				// Start the refresh once; any other request that fails while it's still
				// pending awaits this same promise instead of calling onRefresh() again.
				if (!refreshPromise) {
					refreshPromise = onRefresh().finally(() => {
						refreshPromise = null;
					});
				}
				const res = await refreshPromise;

				if (res.status >= 400) throw res;

				const { method, data, headers } = err.config;
				return await instance.request({
					url: err.config.url,
					method,
					data,
					headers,
				});
			} catch (error) {
				const isExpiredAuth = authStates.includes(error?.response?.status);
				if (!isExpiredAuth) return Promise.reject(error);

				console.error(error.response);
				// Same reasoning as above: only redirect when the refresh itself actually
				// failed — a request that merely retried into another transient 401 without
				// the refresh having failed would already have thrown before reaching here.
				if (!onExpired) return Promise.reject(error);
				clearSession();
				return (window.location.href = onExpired);
			}
		},
	);

	return instance;
}
