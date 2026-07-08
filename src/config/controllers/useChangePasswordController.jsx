import { useCallback, useState } from "react";
import apiMethods from "./auth";
import changePasswordFormSource from "../models/form-source/change-password";

export const useChangePasswordController = () => {
	const [status, setStatus] = useState("IDLE");
	const [formValue, setFormValue] = useState({});
	const [popUp, setPopUp] = useState({ isOpen: false, type: "info", text: "" });

	const isSubmitting = status === "SUBMITTING";

	const triggerPopUp = useCallback((type, text) => setPopUp({ isOpen: true, type, text }), []);
	const closePopUp = useCallback(() => setPopUp((prev) => ({ ...prev, isOpen: false })), []);

	const handleSubmit = useCallback(async (formData) => {
		if (formData.newPassword !== formData.confirmNewPassword) {
			triggerPopUp("error", "The new password and its confirmation don't match.");
			return;
		}

		setStatus("SUBMITTING");
		try {
			await apiMethods.CHANGE_PASSWORD.method({
				currentPassword: formData.currentPassword,
				newPassword: formData.newPassword,
			});
			setFormValue({});
			triggerPopUp("success", "Password changed. Your other sessions were signed out.");
		} catch (error) {
			const statusCode = error.response?.data?.statusCode;
			const message =
				statusCode === 401
					? "Your current password is incorrect."
					: "Couldn't change the password. Check your connection and try again.";
			triggerPopUp("error", message);
		} finally {
			setStatus("IDLE");
		}
	}, [triggerPopUp]);

	return {
		fields: changePasswordFormSource,
		value: formValue,
		isSubmitting,
		popUp,
		actions: {
			handleSubmit,
			closePopUp,
			openPopUp: triggerPopUp,
			onChange: (key, val) => setFormValue((prev) => ({ ...prev, [key]: val })),
		},
	};
};

export default useChangePasswordController;
