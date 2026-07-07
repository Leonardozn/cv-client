const draftKey = (section) => `cv-draft:${section}`;

// localStorage can't serialize a File, so it's stripped before persisting —
// only the section's non-file fields survive a reload; a photo has to be
// re-attached by hand before a retried save can go through.
const stripFiles = (data) => {
	if (!data || typeof data !== "object") return data;
	return Object.fromEntries(
		Object.entries(data).filter(([, value]) => !(value instanceof File)),
	);
};

export const savePendingDraft = (section, payload) => {
	localStorage.setItem(draftKey(section), JSON.stringify(stripFiles(payload)));
};

export const loadPendingDraft = (section) => {
	const raw = localStorage.getItem(draftKey(section));
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
};

export const clearPendingDraft = (section) => {
	localStorage.removeItem(draftKey(section));
};
