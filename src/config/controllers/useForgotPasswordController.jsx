import { useCallback, useState } from "react";
import apiMethods from "./auth";
import { preparePayload } from "./map-methods";
import forgotPasswordFormSource from "../models/form-source/forgot-password";

export const useForgotPasswordController = () => {
	const [status, setStatus] = useState("IDLE");
	const [submitted, setSubmitted] = useState(false);
	const [formValue, setFormValue] = useState({});
	const [popUp, setPopUp] = useState({ isOpen: false, type: "info", text: "" });

	const isSubmitting = status === "SUBMITTING";

	const triggerPopUp = useCallback((type, text) => setPopUp({ isOpen: true, type, text }), []);
	const closePopUp = useCallback(() => setPopUp((prev) => ({ ...prev, isOpen: false })), []);

	const handleSubmit = useCallback(async (formData) => {
		setStatus("SUBMITTING");
		try {
			const payload = preparePayload(formData, forgotPasswordFormSource);
			await apiMethods.FORGOT_PASSWORD.method(payload);
			// auth-service always responds success here, whether or not the email
			// exists — never reveal which emails are registered.
			setSubmitted(true);
		} catch (error) {
			triggerPopUp("error", "Couldn't send the recovery email. Check your connection and try again.");
		} finally {
			setStatus("IDLE");
		}
	}, [triggerPopUp]);

	return {
		fields: forgotPasswordFormSource,
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

export default useForgotPasswordController;
