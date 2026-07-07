import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiMethods from "./auth";
import { preparePayload } from "./map-methods";
import loginFormConfig from "../models/form-source/login";
import { HOME_PATH } from "../router/paths";

export const useLoginController = () => {
	const navigate = useNavigate();
	const [status, setStatus] = useState("IDLE");
	const [popUp, setPopUp] = useState({ isOpen: false, type: "info", text: "" });
	const [formValue, setFormValue] = useState({});

	const isSubmitting = status === "SUBMITTING";

	const triggerPopUp = useCallback((type, text) => {
		setPopUp({ isOpen: true, type, text });
	}, []);

	const closePopUp = useCallback(() => setPopUp((prev) => ({ ...prev, isOpen: false })), []);

	const handleSubmit = useCallback(async (formData) => {
		setStatus("SUBMITTING");
		try {
			const payload = preparePayload(formData, loginFormConfig);
			await apiMethods.LOGIN_USER.method(payload);
			navigate(HOME_PATH);
		} catch (error) {
			const statusCode = error.response?.data?.statusCode;
			const message =
				statusCode === 401
					? "Invalid email or password."
					: "Couldn't sign in. Check your connection and try again.";
			triggerPopUp("error", message);
			setStatus("IDLE");
		}
	}, [navigate, triggerPopUp]);

	return {
		fields: loginFormConfig,
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

export default useLoginController;
