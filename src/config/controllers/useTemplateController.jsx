import { useState, useEffect, useCallback, useMemo } from "react";
import apiMethods from "./cv";
import { 
	mapDynamicOptions, 
	fetchAndResolveTableData, 
	buildTableSearchQuery,
	mapTableRenderCells,
	preparePayload
} from "./map-methods";
import { useExternalSync, handleExternalNotify } from "./sync-helpers";
import templateFormConfig from "../models/form-source/template";
import templateTableConfig from "../models/table-source/template";

export const useTemplateController = () => {
	// ── State ──────────────────────────────────────────────────────────────────
	const [status, setStatus] = useState("INITIALIZING");
	const [tableData, setTableData] = useState([]);
	const [pagination, setPagination] = useState({ currentPage: 1, rowsPerPage: 10, totalPages: 1 });
	const [search, setSearch] = useState("");
	
	const [modal, setModal] = useState({ isOpen: false, mode: null });
	const [formValue, setFormValue] = useState({});
	const [formFields, setFormFields] = useState(templateFormConfig);
	const [defaultFields, setDefaultFields] = useState(templateFormConfig);
	const [tableColumns, setTableColumns] = useState(templateTableConfig);

	const [confirm, setConfirm] = useState({ isOpen: false, title: "", text: "", onConfirm: null });
	const [popUp, setPopUp] = useState({ isOpen: false, type: "info", text: "" });
	const [isInitialized, setIsInitialized] = useState(false);

	useExternalSync(isInitialized, formFields, apiMethods, setFormFields, setFormValue);

	const isLoading = status === "LOADING" || status === "INITIALIZING";
	const isSubmitting = status === "SUBMITTING" || status === "DELETING";
	const isViewMode = modal.mode === "VIEW";

	const computedFields = useMemo(() => {
		if (!isViewMode) return formFields;
		return formFields.map(field => ({ ...field, disabled: true }));
	}, [formFields, isViewMode]);

	// ── Helpers ────────────────────────────────────────────────────────────────

	const triggerPopUp = useCallback((type, text) => {
		setPopUp({ isOpen: true, type, text });
	}, []);

	const closePopUp = useCallback(() => setPopUp((prev) => ({ ...prev, isOpen: false })), []);

	const loadTableData = useCallback(async (page, size, searchVal) => {
		setStatus("LOADING");
		try {
			const params = { sort: { field: 'updatedAt', type: '-1' }, page, size };
			if (searchVal) {
				const query = buildTableSearchQuery(searchVal, templateTableConfig);
				if (Object.keys(query).length > 0) params.query = query;
			}

			const { records, count } = await fetchAndResolveTableData(
				apiMethods.GET_TEMPLATE_LIST,
				params
			);

			setTableData(records);
			setPagination((prev) => ({
				...prev,
				currentPage: page,
				rowsPerPage: size,
				totalPages: Math.ceil(count / size) || 1
			}));
			setStatus("IDLE");
		} catch (error) {
			console.error("Error loading templates:", error);
			triggerPopUp("error", "Error loading templates.");
			setStatus("FAILURE");
		}
	}, [formFields, triggerPopUp]);

	// ── CRUD Actions ───────────────────────────────────────────────────────────

	const handleNew = useCallback(() => {
		const initialValue = {};
		formFields.forEach(f => {
			const k = f.name || f.id;
			if (f.input === "boolean" || f.input === "checkbox") initialValue[k] = false;
			else if (f.input === "sublist" || f.multiple || Array.isArray(f.value)) initialValue[k] = [];
			else initialValue[k] = "";
		});
		setFormValue(initialValue);
		setModal({ isOpen: true, mode: "CREATE" });
	}, [formFields]);

	const handleEdit = useCallback(async (item, isView = false) => {
		setStatus("LOADING");
		try {
			const res = await apiMethods.FIND_ONE_TEMPLATE.method(item._id || item.id);
			if (res?.content) {
				setFormValue(res.content);
				setModal({ isOpen: true, mode: isView ? "VIEW" : "EDIT" });
			}
		} catch (error) {
			console.error("Error fetching template details:", error);
			triggerPopUp("error", "Error fetching template details.");
		} finally {
			setStatus("IDLE");
		}
	}, [triggerPopUp]);

	const handleViewDetail = useCallback((item, customFields = null) => {
		setFormValue(item);
		if (customFields) setFormFields(customFields);
		setModal({ isOpen: true, mode: "VIEW" });
	}, []);

	const handleDelete = useCallback((item) => {
		setConfirm({
			isOpen: true,
			title: "Delete Template",
			text: `Are you sure you want to delete template "${item.name}"? This action cannot be undone.`,
			onConfirm: async () => {
				setStatus("DELETING");
				try {
					const res = await apiMethods.REMOVE_TEMPLATE.method(item._id || item.id);
					triggerPopUp("success", res?.message || "Template deleted successfully.");
					loadTableData(pagination.currentPage, pagination.rowsPerPage, search);
				} catch (error) {
					triggerPopUp("error", error.message || "Error deleting template.");
				} finally {
					setConfirm((prev) => ({ ...prev, isOpen: false }));
					setStatus("IDLE");
				}
			}
		});
	}, [loadTableData, triggerPopUp, pagination.currentPage, pagination.rowsPerPage, search]);

	const handleSubmit = useCallback(async (formData) => {
		const isEditing = modal.mode === "EDIT";
		const id = formValue._id || formValue.id;
		
		const saveAction = async () => {
			setStatus("SUBMITTING");
			try {
				const payload = preparePayload(formData, formFields);

				if (isEditing) {
					await apiMethods.REPLACE_TEMPLATE.method(id, payload);
					triggerPopUp("success", "Template updated successfully.");
					handleExternalNotify(true);
				} else {
					const res = await apiMethods.ADD_TEMPLATE.method(payload);
					triggerPopUp("success", "Template created successfully.");
					handleExternalNotify(false, res);
				}

				setModal({ isOpen: false, mode: null });
				loadTableData(pagination.currentPage, pagination.rowsPerPage, search);
			} catch (error) {
				console.error("Error saving template:", error);
				triggerPopUp("error", error.response?.data?.message || error.message || "Error saving template.");
			} finally {
				setConfirm((prev) => ({ ...prev, isOpen: false }));
				setStatus("IDLE");
			}
		};

		if (isEditing) {
			setConfirm({
				isOpen: true,
				title: "Save Changes",
				text: "Are you sure you want to save these changes?",
				onConfirm: saveAction
			});
		} else {
			await saveAction();
		}
	}, [modal.mode, loadTableData, triggerPopUp, pagination.currentPage, pagination.rowsPerPage, search, formFields, formValue]);

	// ── Initialization ─────────────────────────────────────────────────────────

	useEffect(() => {
		const init = async () => {
			setStatus("INITIALIZING");
			const configWithOptions = await mapDynamicOptions(templateFormConfig, apiMethods);
			setFormFields(configWithOptions);
			setDefaultFields(configWithOptions);

			const resolvedTableCols = await mapTableRenderCells(templateTableConfig, apiMethods);
			setTableColumns(resolvedTableCols);

			setIsInitialized(true);
			setStatus("IDLE");
		};
		init();
	}, []);

	// Search and Pagination effect
	useEffect(() => {
		if (isInitialized) {
			const handler = setTimeout(() => {
				loadTableData(1, pagination.rowsPerPage, search);
			}, 400);
			return () => clearTimeout(handler);
		}
	}, [isInitialized, search, pagination.rowsPerPage, loadTableData]);

	// ── URL action handler (linkTo navigation) ─────────────────────────────────
	useEffect(() => {
		if (!isInitialized) return;

		const params = new URLSearchParams(window.location.search);
		const action = params.get("action");
		const id = params.get("id");

		if (action === "new") {
			handleNew();
		} else if (action === "edit" && id) {
			handleEdit({ _id: id });
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isInitialized]); // run once after init — intentionally excludes handleNew/handleEdit

	return {
		data: tableData,
		columns: tableColumns,
		fields: computedFields,
		value: formValue,
		pagination,
		search: { value: search },
		modal,
		confirm,
		popUp,
		isLoading,
		isSubmitting,
		isViewMode,
		actions: {
			handleNew,
			handleEdit,
			handleViewDetail,
			handleDelete,
			handleSubmit,
			setSearch: (val) => setSearch(val),
			setPage: (page) => {
				let next = pagination.currentPage;
				if (page === "Prev") next = Math.max(next - 1, 1);
				else if (page === "Next") next = Math.min(next + 1, pagination.totalPages);
				else next = Number(page);
				loadTableData(next, pagination.rowsPerPage, search);
			},
			setRowsPerPage: (size) => loadTableData(1, size, search),
			closeModal: () => {
				setModal({ isOpen: false, mode: null });
				setFormFields(defaultFields);
			},
			closeConfirm: () => setConfirm((prev) => ({ ...prev, isOpen: false })),
			closePopUp,
			openPopUp: triggerPopUp,
			onChange: (key, val) => setFormValue(prev => ({ ...prev, [key]: val })),
		}
	};
};
