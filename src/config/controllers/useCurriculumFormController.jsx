import { useCallback, useEffect, useState } from "react";
import apiMethods from "./cv";
import { preparePayload, mapDynamicOptions } from "./map-methods";
import { personalDataFields, profileFields, skillsFields } from "../models/form-source/curriculum";
import educationFields from "../models/form-source/education";
import experienceFields from "../models/form-source/experience";
import certificateFields from "../models/form-source/certificate";
import { savePendingDraft, loadPendingDraft, clearPendingDraft } from "./curriculum-draft";

const emptySection = { value: {}, status: "IDLE", pendingSync: false };
const emptyListSection = { entries: [], status: "IDLE", pendingSync: false, pendingEntry: null };

// Most recent first, matching standard resume ordering.
const sortByDateDesc = (entries, field) =>
	[...entries].sort((a, b) => new Date(b[field]) - new Date(a[field]));

export const useCurriculumFormController = () => {
	const [status, setStatus] = useState("INITIALIZING");
	const [curriculumId, setCurriculumId] = useState(null);
	const [personalData, setPersonalData] = useState(emptySection);
	const [profile, setProfile] = useState(emptySection);
	const [skills, setSkills] = useState(emptySection);
	const [education, setEducation] = useState(emptyListSection);
	const [experience, setExperience] = useState(emptyListSection);
	const [certificate, setCertificate] = useState(emptyListSection);
	const [resolvedSkillsFields, setResolvedSkillsFields] = useState(skillsFields);
	const [popUp, setPopUp] = useState({ isOpen: false, type: "info", text: "" });

	const triggerPopUp = useCallback((type, text) => setPopUp({ isOpen: true, type, text }), []);
	const closePopUp = useCallback(() => setPopUp((prev) => ({ ...prev, isOpen: false })), []);

	// ── Shared save for the 3 sections that are just fields on Curriculum itself ──
	// `payloadData` may include fields from sibling sections: creating a Curriculum
	// (no `currentId` yet) needs every required field (fullName/headline/city/
	// profileSummary) at once, even though they're split across separate sections/Saves.
	const saveCurriculumSection = useCallback(async (fields, formData, sectionKey, setSectionState, currentId, payloadData = formData) => {
		setSectionState((prev) => ({ ...prev, status: "SAVING" }));
		savePendingDraft(sectionKey, formData);
		try {
			const payload = preparePayload(payloadData, fields);
			const response = currentId
				? await apiMethods.UPDATE_CURRICULUM.method(currentId, payload)
				: await apiMethods.ADD_CURRICULUM.method(payload);
			const savedId = response.content?._id || response.content?.id || currentId;
			setCurriculumId(savedId);
			clearPendingDraft(sectionKey);
			setSectionState({ value: formData, status: "SAVED", pendingSync: false });
			triggerPopUp("success", "Saved.");
			return savedId;
		} catch (error) {
			console.error(`Error saving ${sectionKey}:`, error);
			setSectionState((prev) => ({ ...prev, status: "ERROR", pendingSync: true }));
			triggerPopUp("error", "Couldn't save. Your changes are kept on this device — try saving again.");
			return currentId;
		}
	}, [triggerPopUp]);

	const handleSavePersonalData = useCallback((formData) => {
		const payloadData = curriculumId ? formData : { ...profile.value, ...skills.value, ...formData };
		return saveCurriculumSection(personalDataFields, formData, "personalData", setPersonalData, curriculumId, payloadData);
	}, [saveCurriculumSection, curriculumId, profile.value, skills.value]);
	const handleSaveProfile = useCallback((formData) => {
		const payloadData = curriculumId ? formData : { ...personalData.value, ...skills.value, ...formData };
		return saveCurriculumSection(profileFields, formData, "profile", setProfile, curriculumId, payloadData);
	}, [saveCurriculumSection, curriculumId, personalData.value, skills.value]);
	const handleSaveSkills = useCallback((formData) => {
		const payloadData = curriculumId ? formData : { ...personalData.value, ...profile.value, ...formData };
		return saveCurriculumSection(skillsFields, formData, "skills", setSkills, curriculumId, payloadData);
	}, [saveCurriculumSection, curriculumId, personalData.value, profile.value]);

	const handleChangePersonalData = useCallback(
		(key, val) => setPersonalData((prev) => ({ ...prev, value: { ...prev.value, [key]: val } })),
		[],
	);
	const handleChangeProfile = useCallback(
		(key, val) => setProfile((prev) => ({ ...prev, value: { ...prev.value, [key]: val } })),
		[],
	);
	const handleChangeSkills = useCallback(
		(key, val) => setSkills((prev) => ({ ...prev, value: { ...prev.value, [key]: val } })),
		[],
	);

	// ── Shared save/remove for the 3 sections that are their own cv-service entities ──
	const saveListEntry = useCallback(async ({ addMethod, updateMethod, fields, formData, editingId, sectionKey, setSectionState, currentId, dateField }) => {
		setSectionState((prev) => ({ ...prev, status: "SAVING" }));
		savePendingDraft(sectionKey, { data: formData, editingId });
		try {
			const payload = preparePayload({ ...formData, curriculum: currentId }, [...fields, { id: "curriculum" }]);
			const response = editingId
				? await updateMethod.method(editingId, payload)
				: await addMethod.method(payload);
			clearPendingDraft(sectionKey);
			setSectionState((prev) => {
				const saved = response.content;
				const entries = editingId
					? prev.entries.map((entry) => ((entry._id || entry.id) === editingId ? saved : entry))
					: [...prev.entries, saved];
				return { entries: sortByDateDesc(entries, dateField), status: "SAVED", pendingSync: false, pendingEntry: null };
			});
			triggerPopUp("success", "Saved.");
		} catch (error) {
			console.error(`Error saving ${sectionKey} entry:`, error);
			setSectionState((prev) => ({ ...prev, status: "ERROR", pendingSync: true }));
			triggerPopUp("error", "Couldn't save this entry. It's kept on this device so you can try again.");
		}
	}, [triggerPopUp]);

	const removeListEntry = useCallback(async ({ removeMethod, id, sectionKey, setSectionState }) => {
		setSectionState((prev) => ({ ...prev, status: "SAVING" }));
		try {
			await removeMethod.method(id);
			setSectionState((prev) => ({
				...prev,
				entries: prev.entries.filter((entry) => (entry._id || entry.id) !== id),
				status: "IDLE",
			}));
		} catch (error) {
			console.error(`Error removing ${sectionKey} entry:`, error);
			setSectionState((prev) => ({ ...prev, status: "ERROR" }));
			triggerPopUp("error", "Couldn't remove this entry. Check your connection and try again.");
		}
	}, [triggerPopUp]);

	const handleSaveEducation = useCallback((formData, editingId) => saveListEntry({
		addMethod: apiMethods.ADD_EDUCATION, updateMethod: apiMethods.UPDATE_EDUCATION,
		fields: educationFields, formData, editingId,
		sectionKey: "education", setSectionState: setEducation, currentId: curriculumId, dateField: "startDate",
	}), [saveListEntry, curriculumId]);
	const handleRemoveEducation = useCallback((id) => removeListEntry({
		removeMethod: apiMethods.REMOVE_EDUCATION, id, sectionKey: "education", setSectionState: setEducation,
	}), [removeListEntry]);

	const handleSaveExperience = useCallback((formData, editingId) => saveListEntry({
		addMethod: apiMethods.ADD_EXPERIENCE, updateMethod: apiMethods.UPDATE_EXPERIENCE,
		fields: experienceFields, formData, editingId,
		sectionKey: "experience", setSectionState: setExperience, currentId: curriculumId, dateField: "startDate",
	}), [saveListEntry, curriculumId]);
	const handleRemoveExperience = useCallback((id) => removeListEntry({
		removeMethod: apiMethods.REMOVE_EXPERIENCE, id, sectionKey: "experience", setSectionState: setExperience,
	}), [removeListEntry]);

	const handleSaveCertificate = useCallback((formData, editingId) => saveListEntry({
		addMethod: apiMethods.ADD_CERTIFICATE, updateMethod: apiMethods.UPDATE_CERTIFICATE,
		fields: certificateFields, formData, editingId,
		sectionKey: "certificate", setSectionState: setCertificate, currentId: curriculumId, dateField: "date",
	}), [saveListEntry, curriculumId]);
	const handleRemoveCertificate = useCallback((id) => removeListEntry({
		removeMethod: apiMethods.REMOVE_CERTIFICATE, id, sectionKey: "certificate", setSectionState: setCertificate,
	}), [removeListEntry]);

	// ── Initial load: fetch the user's curriculum (if any) + its entries, then
	// restore and retry any section left pending from a previous failed save ──
	useEffect(() => {
		const init = async () => {
			setStatus("INITIALIZING");
			let id = null;
			let baseValues = {
				personalData: {},
				profile: {},
				skills: {},
			};

			mapDynamicOptions(skillsFields, apiMethods)
				.then(setResolvedSkillsFields)
				.catch((error) => console.error("Error loading skill suggestions:", error));

			try {
				const res = await apiMethods.GET_CURRICULUM_LIST.method();
				const record = res.content?.records?.[0];
				if (record) {
					id = record._id || record.id;
					setCurriculumId(id);
					baseValues = {
						personalData: {
							fullName: record.fullName,
							headline: record.headline || [],
							city: record.city,
							state: record.state,
							country: record.country,
							phones: record.phones || [],
							photo: record.photo,
							contactLinks: record.contactLinks || [],
						},
						profile: { profileSummary: record.profileSummary },
						skills: { skills: record.skills || [] },
					};
					setPersonalData({ value: baseValues.personalData, status: "IDLE", pendingSync: false });
					setProfile({ value: baseValues.profile, status: "IDLE", pendingSync: false });
					setSkills({ value: baseValues.skills, status: "IDLE", pendingSync: false });

					const [eduRes, expRes, certRes] = await Promise.all([
						apiMethods.GET_EDUCATION_LIST.method({ query: { curriculum: id } }),
						apiMethods.GET_EXPERIENCE_LIST.method({ query: { curriculum: id } }),
						apiMethods.GET_CERTIFICATE_LIST.method({ query: { curriculum: id } }),
					]);
					setEducation({ entries: sortByDateDesc(eduRes.content?.records || [], "startDate"), status: "IDLE", pendingSync: false, pendingEntry: null });
					setExperience({ entries: sortByDateDesc(expRes.content?.records || [], "startDate"), status: "IDLE", pendingSync: false, pendingEntry: null });
					setCertificate({ entries: sortByDateDesc(certRes.content?.records || [], "date"), status: "IDLE", pendingSync: false, pendingEntry: null });
				}
			} catch (error) {
				console.error("Error loading curriculum:", error);
				triggerPopUp("error", "Couldn't load your curriculum. Some data may be missing.");
			}

			// Restore + auto-retry the 3 flat sections. When there's still no curriculum,
			// the retried payload must carry every section's known values at once (same
			// reason as handleSavePersonalData/Profile/Skills above), not just its own.
			const flatDraftValues = { ...baseValues };
			const flatDrafts = [
				["personalData", personalDataFields, setPersonalData],
				["profile", profileFields, setProfile],
				["skills", skillsFields, setSkills],
			];
			for (const [sectionKey, fields, setSectionState] of flatDrafts) {
				const draft = loadPendingDraft(sectionKey);
				if (!draft) continue;
				const merged = { ...flatDraftValues[sectionKey], ...draft };
				flatDraftValues[sectionKey] = merged;
				setSectionState((prev) => ({ ...prev, value: merged, pendingSync: true }));
				const payloadData = id
					? merged
					: { ...flatDraftValues.personalData, ...flatDraftValues.profile, ...flatDraftValues.skills };
				const savedId = await saveCurriculumSection(fields, merged, sectionKey, setSectionState, id, payloadData);
				if (savedId) id = savedId;
			}

			// Restore + auto-retry (when possible) the 3 list sections
			const listDrafts = [
				["education", apiMethods.ADD_EDUCATION, apiMethods.UPDATE_EDUCATION, educationFields, setEducation, "startDate"],
				["experience", apiMethods.ADD_EXPERIENCE, apiMethods.UPDATE_EXPERIENCE, experienceFields, setExperience, "startDate"],
				["certificate", apiMethods.ADD_CERTIFICATE, apiMethods.UPDATE_CERTIFICATE, certificateFields, setCertificate, "date"],
			];
			for (const [sectionKey, addMethod, updateMethod, fields, setSectionState, dateField] of listDrafts) {
				const draft = loadPendingDraft(sectionKey);
				if (!draft) continue;
				if (!id) {
					// No curriculum to attach this entry to yet — surface it for a manual retry once Personal Data is saved.
					setSectionState((prev) => ({ ...prev, pendingSync: true, pendingEntry: { data: draft.data, editingId: draft.editingId } }));
					continue;
				}
				setSectionState((prev) => ({ ...prev, pendingSync: true, pendingEntry: { data: draft.data, editingId: draft.editingId } }));
				await saveListEntry({ addMethod, updateMethod, fields, formData: draft.data, editingId: draft.editingId, sectionKey, setSectionState, currentId: id, dateField });
			}

			setStatus("IDLE");
		};
		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		status,
		curriculumId,
		personalData,
		profile,
		skills,
		skillsFields: resolvedSkillsFields,
		education,
		experience,
		certificate,
		popUp,
		actions: {
			handleSavePersonalData,
			handleSaveProfile,
			handleSaveSkills,
			handleChangePersonalData,
			handleChangeProfile,
			handleChangeSkills,
			handleSaveEducation,
			handleRemoveEducation,
			handleSaveExperience,
			handleRemoveExperience,
			handleSaveCertificate,
			handleRemoveCertificate,
			closePopUp,
			openPopUp: triggerPopUp,
		},
	};
};

export default useCurriculumFormController;
