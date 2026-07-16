import { useCallback, useState } from "react";
import apiMethods from "./auth";
import changePasswordFormSource from "../models/form-source/change-password";
import changePasswordVerifyFormSource from "../models/form-source/change-password-verify";
import { isPasswordCompliant, PASSWORD_POLICY_HINT } from "../models/password-policy";

const CODE_PATTERN = /^\d{6}$/;

export const useChangePasswordController = () => {
	const [step, setStep] = useState("REQUEST"); // REQUEST | VERIFY
	const [status, setStatus] = useState("IDLE");
	const [formValue, setFormValue] = useState({});
	const [codeValue, setCodeValue] = useState({});
	const [popUp, setPopUp] = useState({ isOpen: false, type: "info", text: "" });

	const isSubmitting = status === "SUBMITTING";

	const triggerPopUp = useCallback((type, text) => setPopUp({ isOpen: true, type, text }), []);
	const closePopUp = useCallback(() => setPopUp((prev) => ({ ...prev, isOpen: false })), []);

	const handleRequestChange = useCallback(async (data) => {
		if (data.newPassword !== data.confirmNewPassword) {
			triggerPopUp("error", "The new password and its confirmation don't match.");
			return;
		}

		if (!isPasswordCompliant(data.newPassword)) {
			triggerPopUp("error", PASSWORD_POLICY_HINT);
			return;
		}

		setStatus("SUBMITTING");
		try {
			await apiMethods.CHANGE_PASSWORD.method({
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			});
			setStep("VERIFY");
			triggerPopUp("info", "We sent a 6-digit verification code to your email. Enter it below to confirm the change.");
		} catch (error) {
			const statusCode = error.response?.data?.statusCode;
			const serverMessage = error.response?.data?.message;
			const message =
				statusCode === 401
					? "Your current password is incorrect."
					: statusCode === 400
						? serverMessage || "Couldn't start the password change. Check your connection and try again."
						: "Couldn't start the password change. Check your connection and try again.";
			triggerPopUp("error", message);
		} finally {
			setStatus("IDLE");
		}
	}, [triggerPopUp]);

	const handleVerifyCode = useCallback(async (data) => {
		if (!CODE_PATTERN.test(data.code || "")) {
			triggerPopUp("error", "Enter the 6-digit code exactly as it was emailed to you.");
			return;
		}

		setStatus("SUBMITTING");
		try {
			await apiMethods.CHANGE_PASSWORD_VERIFY.method({ code: data.code });
			setStep("REQUEST");
			setFormValue({});
			setCodeValue({});
			triggerPopUp("success", "Password changed. Your other sessions were signed out.");
		} catch (error) {
			const statusCode = error.response?.data?.statusCode;
			if (statusCode === 400) {
				// No pending change, or the code/its max attempts expired — back to step 1.
				setStep("REQUEST");
				setCodeValue({});
				triggerPopUp("error", "That code is no longer valid. Request a new one.");
				return;
			}
			const message = statusCode === 401
				? "That code is incorrect. Check your email and try again."
				: "Couldn't verify the code. Check your connection and try again.";
			triggerPopUp("error", message);
		} finally {
			setStatus("IDLE");
		}
	}, [triggerPopUp]);

	// Going back discards the pending code client-side only; the next
	// successful step-1 submit is what actually invalidates it server-side.
	const handleBackToRequest = useCallback(() => {
		setStep("REQUEST");
		setCodeValue({});
	}, []);

	return {
		step,
		requestFields: changePasswordFormSource,
		requestValue: formValue,
		verifyFields: changePasswordVerifyFormSource,
		verifyValue: codeValue,
		isSubmitting,
		popUp,
		actions: {
			handleRequestChange,
			handleVerifyCode,
			handleBackToRequest,
			closePopUp,
			openPopUp: triggerPopUp,
			onChangeRequest: (key, val) => setFormValue((prev) => ({ ...prev, [key]: val })),
			onChangeVerify: (key, val) => setCodeValue((prev) => ({ ...prev, [key]: val })),
		},
	};
};

export default useChangePasswordController;
