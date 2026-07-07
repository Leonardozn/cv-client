import { useCallback, useState } from "react";
import apiMethods from "./auth";
import { preparePayload } from "./map-methods";
import registerFormConfig from "../models/form-source/register";

export const useRegisterController = () => {
	const [status, setStatus] = useState("IDLE");
	const [popUp, setPopUp] = useState({ isOpen: false, type: "info", text: "" });
	const [registered, setRegistered] = useState(false);
	const [formValue, setFormValue] = useState({});

	const isSubmitting = status === "SUBMITTING";

	const triggerPopUp = useCallback((type, text) => {
		setPopUp({ isOpen: true, type, text });
	}, []);

	const closePopUp = useCallback(() => setPopUp((prev) => ({ ...prev, isOpen: false })), []);

	const handleSubmit = useCallback(async (formData) => {
		setStatus("SUBMITTING");
		try {
			const payload = preparePayload(formData, registerFormConfig);
			await apiMethods.REGISTER_USER.method(payload);
			setRegistered(true);
		} catch (error) {
			const statusCode = error.response?.data?.statusCode;
			const message =
				statusCode === 400
					? "This email is already registered. Try signing in instead."
					: "Couldn't create the account. Check your connection and try again.";
			triggerPopUp("error", message);
		} finally {
			setStatus("IDLE");
		}
	}, [triggerPopUp]);

	return {
		fields: registerFormConfig,
		value: formValue,
		registered,
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

export default useRegisterController;
