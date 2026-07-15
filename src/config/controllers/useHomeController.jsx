import { useCallback, useEffect, useMemo, useState } from "react";
import apiMethods from "./cv";
import { CV_API_HOST, CV_IMAGES_API_PATH, CV_STATIC_IMAGES_HOST } from "../environment";

// Template preview images aren't a modeled field — they're static files named
// after Template.key (e.g. "two-column-classic.png"), dropped by whoever owns
// the catalog into the same static folder cv-service already serves
// Curriculum.photo from. New templates get a preview automatically as long as
// the filename matches; no cv-client change needed when a template is added.
const TEMPLATE_IMAGES_HOST = CV_STATIC_IMAGES_HOST || `${CV_API_HOST}${CV_IMAGES_API_PATH}`;
const getTemplatePreviewUrl = (template) => `${TEMPLATE_IMAGES_HOST}/${template.key}.png`;

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
	const [brokenImageIds, setBrokenImageIds] = useState(() => new Set());
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

	const handleImageError = useCallback((templateId) => {
		setBrokenImageIds((prev) => (prev.has(templateId) ? prev : new Set(prev).add(templateId)));
	}, []);

	const templatesWithPreview = useMemo(
		() =>
			templates.map((template) => {
				const templateId = template._id || template.id;
				return {
					...template,
					previewUrl: brokenImageIds.has(templateId) ? null : getTemplatePreviewUrl(template),
				};
			}),
		[templates, brokenImageIds],
	);

	return {
		status,
		curriculumId,
		templates: templatesWithPreview,
		generatingId,
		popUp,
		actions: { handleGeneratePdf, handleImageError, closePopUp },
	};
};

export default useHomeController;
