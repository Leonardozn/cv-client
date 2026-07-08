import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import apiMethods from "./auth";
import resetPasswordFormSource from "../models/form-source/reset-password";

export const useResetPasswordController = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const [status, setStatus] = useState("IDLE");
	const [submitted, setSubmitted] = useState(false);
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
			await apiMethods.RESET_PASSWORD.method({ token, newPassword: formData.newPassword });
			setSubmitted(true);
		} catch (error) {
			const statusCode = error.response?.data?.statusCode;
			const message = statusCode === 400
				? "This reset link is invalid or has expired. Request a new one."
				: "Couldn't reset the password. Check your connection and try again.";
			triggerPopUp("error", message);
		} finally {
			setStatus("IDLE");
		}
	}, [token, triggerPopUp]);

	return {
		hasToken: Boolean(token),
		fields: resetPasswordFormSource,
		value: formValue,
		submitted,
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

export default useResetPasswordController;
