import { useCallback, useEffect, useState } from "react";
import apiMethods, { getStoredUser, persistUser } from "./auth";
import { preparePayload } from "./map-methods";
import editProfileFormSource from "../models/form-source/edit-profile";

export const useEditProfileController = () => {
	const cachedUser = getStoredUser();
	const [status, setStatus] = useState("IDLE");
	const [formValue, setFormValue] = useState({
		name: cachedUser?.name || "",
		email: cachedUser?.email || "",
	});
	const [popUp, setPopUp] = useState({ isOpen: false, type: "info", text: "" });

	const isSubmitting = status === "SUBMITTING";

	const triggerPopUp = useCallback((type, text) => setPopUp({ isOpen: true, type, text }), []);
	const closePopUp = useCallback(() => setPopUp((prev) => ({ ...prev, isOpen: false })), []);

	// Refresh from the server on mount so a profile edited elsewhere (another
	// tab/session) isn't silently overridden by a stale localStorage copy.
	useEffect(() => {
		const userId = cachedUser?.id || cachedUser?._id;
		if (!userId) return;
		(async () => {
			try {
				const res = await apiMethods.FIND_ONE_USER.method(userId);
				if (res?.content) {
					setFormValue({ name: res.content.name, email: res.content.email });
					persistUser(res.content);
				}
			} catch (error) {
				console.error("Error loading profile:", error);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSubmit = useCallback(async (formData) => {
		const userId = getStoredUser()?.id || getStoredUser()?._id;
		if (!userId) {
			triggerPopUp("error", "Couldn't identify your account. Please sign in again.");
			return;
		}

		setStatus("SUBMITTING");
		try {
			const payload = preparePayload(formData, editProfileFormSource);
			const res = await apiMethods.UPDATE_USER.method(userId, payload);
			if (res?.content) persistUser(res.content);
			triggerPopUp("success", "Profile updated.");
		} catch (error) {
			const statusCode = error.response?.data?.statusCode;
			const message =
				statusCode === 400
					? "That email is already used by another account."
					: "Couldn't update your profile. Check your connection and try again.";
			triggerPopUp("error", message);
		} finally {
			setStatus("IDLE");
		}
	}, [triggerPopUp]);

	return {
		fields: editProfileFormSource,
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

export default useEditProfileController;
