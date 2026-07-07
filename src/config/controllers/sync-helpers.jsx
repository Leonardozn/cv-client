import { useEffect } from "react";
import { mapDynamicOptions } from "./map-methods";

export const useExternalSync = (isInitialized, formFields, apiMethods, setFormFields, setFormValue) => {
	useEffect(() => {
		if (!isInitialized) return;
		const bc = new BroadcastChannel("jotam_api_sync");
		bc.onmessage = async (event) => {
			if (event.data.type === "EXTERNAL_SUBMIT") {
				const targetPage = event.data.targetPage;
				if (targetPage && targetPage !== window.location.pathname) return;
				const refreshed = await mapDynamicOptions(formFields, apiMethods);
				setFormFields(refreshed);
				
				const { fromField, fromSublist, fromRowIndex, newItemId } = event.data;
				if (newItemId && fromField) {
					if (fromSublist) {
						setFormValue((prev) => {
							const list = [...(prev[fromSublist] || [])];
							if (list[fromRowIndex] !== undefined && list[fromRowIndex] !== null) {
								const current = list[fromRowIndex];
								if (current !== null && typeof current === "object") {
									list[fromRowIndex] = { ...current, [fromField]: newItemId };
								} else {
									list[fromRowIndex] = newItemId;
								}
							}
							return { ...prev, [fromSublist]: list };
						});
					} else {
						setFormValue((prev) => ({ ...prev, [fromField]: newItemId }));
					}
				}
			}
		};
		return () => bc.close();
	}, [isInitialized, formFields, apiMethods, setFormFields, setFormValue]);
};

export const handleExternalNotify = (isEditing, res) => {
	const params = new URLSearchParams(window.location.search);
	if (params.get("external") === "true") {
		const bc = new BroadcastChannel("jotam_api_sync");
		bc.postMessage({
			type: "EXTERNAL_SUBMIT",
			targetPage: params.get("fromPage"),
			fromField: params.get("fromField"),
			fromSublist: params.get("fromSublist"),
			fromRowIndex: params.get("fromRowIndex") !== "null" && params.get("fromRowIndex") !== null ? Number(params.get("fromRowIndex")) : null,
			newItemId: isEditing ? null : (res?.content?._id || res?.content?.id || res?._id || res?.id)
		});
		setTimeout(() => window.close(), 1000);
	}
};
