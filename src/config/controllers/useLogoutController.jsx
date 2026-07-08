import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiMethods from "./auth";
import { clearSession } from "../api-connection";
import { LOGIN_PATH } from "../router/paths";

export const useLogoutController = () => {
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	const openConfirm = useCallback(() => setIsConfirmOpen(true), []);
	const closeConfirm = useCallback(() => setIsConfirmOpen(false), []);

	const confirmLogout = useCallback(async () => {
		setIsSubmitting(true);
		try {
			await apiMethods.LOGOUT_USER.method();
		} catch (error) {
			// Logout is idempotent server-side; a network/API error shouldn't
			// prevent closing the session locally.
			console.error("Error logging out:", error);
		} finally {
			clearSession();
			setIsSubmitting(false);
			setIsConfirmOpen(false);
			navigate(LOGIN_PATH);
		}
	}, [navigate]);

	return { isSubmitting, isConfirmOpen, actions: { openConfirm, closeConfirm, confirmLogout } };
};

export default useLogoutController;
