import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiMethods from "./auth";
import { clearSession } from "../api-connection";

export const useLogoutController = () => {
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleLogout = useCallback(async () => {
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
			navigate("/admin/login");
		}
	}, [navigate]);

	return { isSubmitting, actions: { handleLogout } };
};

export default useLogoutController;
