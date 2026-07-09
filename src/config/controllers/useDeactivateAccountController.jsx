import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiMethods from "./auth";
import { clearSession } from "../api-connection";
import { LOGIN_PATH } from "../router/paths";

export const useDeactivateAccountController = () => {
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [popUp, setPopUp] = useState({ isOpen: false, type: "info", text: "" });

	const openConfirm = useCallback(() => setIsConfirmOpen(true), []);
	const closeConfirm = useCallback(() => setIsConfirmOpen(false), []);
	const closePopUp = useCallback(() => setPopUp((prev) => ({ ...prev, isOpen: false })), []);

	const confirmDeactivate = useCallback(async () => {
		setIsSubmitting(true);
		try {
			await apiMethods.DEACTIVATE_ACCOUNT.method();
			clearSession();
			navigate(LOGIN_PATH);
		} catch (error) {
			setPopUp({
				isOpen: true,
				type: "error",
				text: "Couldn't deactivate your account. Check your connection and try again.",
			});
			setIsSubmitting(false);
			setIsConfirmOpen(false);
		}
	}, [navigate]);

	return {
		isSubmitting,
		isConfirmOpen,
		popUp,
		actions: { openConfirm, closeConfirm, confirmDeactivate, closePopUp },
	};
};

export default useDeactivateAccountController;
