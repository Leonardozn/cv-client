import { useCallback, useEffect, useState } from "react";
import apiMethods from "./cv";

// A 4xx/5xx response still comes back as a Blob when responseType is "blob"
// (axios doesn't sniff the body ahead of time); read it to recover the real
// backend message instead of showing a generic failure.
const parseBlobError = async (error) => {
	const data = error?.response?.data;
	const contentType = error?.response?.headers?.["content-type"] || "";
	if (!(data instanceof Blob) || !contentType.includes("json")) return null;
	try {
		const parsed = JSON.parse(await data.text());
		return parsed?.message || null;
	} catch {
		return null;
	}
};

export const useHomeController = () => {
	const [status, setStatus] = useState("INITIALIZING");
	const [curriculumId, setCurriculumId] = useState(null);
	const [templates, setTemplates] = useState([]);
	const [generatingId, setGeneratingId] = useState(null);
	const [popUp, setPopUp] = useState({ isOpen: false, type: "info", text: "" });

	const triggerPopUp = useCallback((type, text) => setPopUp({ isOpen: true, type, text }), []);
	const closePopUp = useCallback(() => setPopUp((prev) => ({ ...prev, isOpen: false })), []);

	useEffect(() => {
		const init = async () => {
			setStatus("INITIALIZING");
			try {
				const [curriculumRes, templateRes] = await Promise.all([
					apiMethods.GET_CURRICULUM_LIST.method(),
					apiMethods.GET_TEMPLATE_LIST.method(),
				]);
				const record = curriculumRes.content?.records?.[0];
				setCurriculumId(record?._id || record?.id || null);
				setTemplates((templateRes.content?.records || []).filter((template) => template.active));
			} catch (error) {
				console.error("Error loading home data:", error);
				triggerPopUp("error", "Couldn't load your templates. Check your connection and reload the page.");
			}
			setStatus("IDLE");
		};
		init();
	}, [triggerPopUp]);

	const handleGeneratePdf = useCallback(async (templateId) => {
		setGeneratingId(templateId);
		try {
			const blob = await apiMethods.GENERATE_PDF.method(curriculumId, { template: templateId });
			const url = URL.createObjectURL(blob);
			window.open(url, "_blank", "noopener");
			// Give the new tab time to load the object URL before releasing it.
			setTimeout(() => URL.revokeObjectURL(url), 60000);
		} catch (error) {
			console.error("Error generating PDF:", error);
			const message = await parseBlobError(error);
			triggerPopUp("error", message || "Couldn't generate the PDF. Check your connection and try again.");
		} finally {
			setGeneratingId(null);
		}
	}, [curriculumId, triggerPopUp]);

	return {
		status,
		curriculumId,
		templates,
		generatingId,
		popUp,
		actions: { handleGeneratePdf, closePopUp },
	};
};

export default useHomeController;
