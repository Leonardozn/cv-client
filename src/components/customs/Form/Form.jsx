import { useState } from "react";
import "./Form.css";
import Input from "../../modulars/Input/Input";
import Button from "../../modulars/Button/Button";
import Switch from "../../modulars/Switch/Switch";
import Select from "../Select/Select";
import SelectMultiple from "../SelectMultiple/SelectMultiple";
import InputDate from "../InputDate/InputDate";
import InputTime from "../InputTime/InputTime";
import InputDatetime from "../InputDatetime/InputDatetime";
import Spinner from "../../modulars/Spinner/Spinner";
import ActionButton from "../../modulars/ActionButton/ActionButton";
import SubList from "../SubList/SubList";
import { FiEdit2, FiPlus, FiTrash2, FiEye } from "react-icons/fi";
import Dropzone from "../../modulars/Dropzone/Dropzone";
import Modal from "../Modal/Modal";
import DropzoneMultiple from "../../modulars/DropzoneMultiple/DropzoneMultiple";

// Helper functions for global Form state
const isObjectPopulated = (obj) => {
	if (!obj || typeof obj !== "object") return false;
	return Object.values(obj).some((val) => {
		if (Array.isArray(val)) return val.length > 0;
		if (typeof val === "object" && val !== null) return isObjectPopulated(val);
		return val !== null && val !== undefined && val !== "";
	});
};

const Form = ({
	fields = [],
	value: formData = {}, // Use value as formData
	onChange,
	onSubmit,
	onCancel,
	submitText = "Submit",
	cancelText = "Cancel",
	submitType = "primary",
	cancelType = "neutral",
	className = "",
	style = {},
	onError, // Prop to handle top-level form errors
	triggerPopUp, // Function to trigger modal popups (warning, info, err)
	isLoading: externalIsSubmitting = false,
}) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formErrors, setFormErrors] = useState({});
	const [sublistErrors, setSublistErrors] = useState({});
	const [objectModal, setObjectModal] = useState({ isOpen: false, field: null, data: {}, mode: "EDIT" });
	const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, fieldId: null, label: "" });

	const activeIsSubmitting = externalIsSubmitting || isSubmitting;

	const handleFieldChange = (key, value) => {
		if (onChange) {
			onChange(key, value);
		}
		
		// Clean error if the user modifies the field
		if (formErrors[key]) {
			setFormErrors((prev) => ({
				...prev,
				[key]: false,
			}));
		}
		if (sublistErrors[key]) {
			setSublistErrors((prev) => ({
				...prev,
				[key]: undefined,
			}));
		}
	};

	const validateForm = () => {
		const errors = {};
		const newSublistErrors = {};
		let isValid = true;
		const missingLabels = [];

		const isEmptyValue = (val) =>
			val === undefined ||
			val === null ||
			(typeof val === "string" && val.trim() === "") ||
			(Array.isArray(val) && val.length === 0);

		fields.forEach((field) => {
			const key = field.name || field.id;
			if (!key) return;

			// Top-level required check
			if (field.required) {
				const val = formData[key];
				if (isEmptyValue(val)) {
					errors[key] = true;
					isValid = false;
					missingLabels.push(field.label || key);
				}
			}

			// Validate required columns inside sublist rows
			if (field.input === "sublist" && Array.isArray(field.structure)) {
				const rows = formData[key] || [];
				const requiredCols = field.structure.filter((col) => col.required);

				if (requiredCols.length > 0 && rows.length > 0) {
					const rowErrorsArr = rows.map((row) => {
						const rowErr = {};
						requiredCols.forEach((col) => {
							if (isEmptyValue(row[col.id])) {
								rowErr[col.id] = true;
							}
						});
						return rowErr;
					});

					if (rowErrorsArr.some((re) => Object.keys(re).length > 0)) {
						newSublistErrors[key] = rowErrorsArr;
						isValid = false;
						requiredCols.forEach((col) => {
							const missingInAnyRow = rows.some((row) => isEmptyValue(row[col.id]));
							if (missingInAnyRow) {
								missingLabels.push(`${field.label || key} → ${col.label || col.id}`);
							}
						});
					}
				}
			}
		});

		setFormErrors(errors);
		setSublistErrors(newSublistErrors);
		return { isValid, missingLabels };
	};

	const openObjectModal = (field, mode = "EDIT") => {
		setObjectModal({
			isOpen: true,
			field,
			data: formData[field.id] || {},
			mode,
		});
	};

	const closeObjectModal = () => {
		setObjectModal({ isOpen: false, field: null, data: {} });
	};

	const handleObjectFieldChange = (key, value) => {
		setObjectModal((prev) => ({
			...prev,
			data: { ...prev.data, [key]: value },
		}));
	};

	const handleObjectSubmit = (key, data) => {
		handleFieldChange(key, data);
		closeObjectModal();
	};

	const openDeleteConfirm = (fieldId, label) => {
		setDeleteConfirm({ isOpen: true, fieldId, label });
	};

	const confirmDelete = () => {
		if (deleteConfirm.fieldId) {
			handleFieldChange(deleteConfirm.fieldId, undefined);
		}
		setDeleteConfirm({ isOpen: false, fieldId: null, label: "" });
	};

	const renderActionButtons = (field, extraStyles = {}) => {
		const { linkTo, ...rest } = field;
		const key = field.name || field.id;

		return (
			<div
				style={{
					display: "flex",
					gap: "0.5rem",
					paddingBottom: formErrors[key] ? "1.5rem" : "0",
					...extraStyles,
				}}
			>
				<ActionButton
					icon={<FiPlus />}
					outline={true}
					disabled={rest.disabled}
					style={{ width: "2.8rem", height: "2.8rem", flexShrink: 0 }}
					onClick={(e) => {
						e.preventDefault();
						const currentUrl = window.location.pathname;
						window.open(`${linkTo}?action=new&external=true&fromField=${key}`, "_blank");
					}}
				/>
				<ActionButton
					icon={<FiEdit2 />}
					type="secondary"
					outline={true}
					disabled={rest.disabled}
					style={{ width: "2.8rem", height: "2.8rem", flexShrink: 0 }}
					onClick={(e) => {
						e.preventDefault();
						const currentVal = formData[key];
						if (
							!currentVal ||
							(Array.isArray(currentVal) && currentVal.length === 0)
						) {
							if (triggerPopUp) {
								triggerPopUp("warning", "Please select an item to edit.");
							} else {
								alert("Please select an item to edit.");
							}
							return;
						}
						let id = Array.isArray(currentVal) ? currentVal[0] : currentVal;

						// If it's an object (like in sublist), try to get the ID
						if (id && typeof id === "object") {
							id = id._id || id.id;
						}

						if (!id || typeof id === "object") {
							window.open(`${linkTo}?external=true&fromField=${key}`, "_blank");
						} else {
							window.open(`${linkTo}?action=edit&id=${id}&external=true&fromField=${key}`, "_blank");
						}
					}}
				/>
			</div>
		);
	};

	const renderField = (field, index) => {
		if (field.label && field.required) field = { ...field, label: `${field.label} *` }
		const key = field.name || field.id || index;
		const isBoolean = field.input === "boolean";
		const isSelect = field.input === "select";
		const isMultiple = field.input === "multiselect";
		const isButton = field.input === "button";
		const isObject = field.input === "object";
		const isSubList = field.input === "sublist";
		const isDate = field.input === "date";
		const isDatetime = field.input === "datetime";
		const isTime = field.input === "time";

		if (isButton) {
			const { input, label, text, buttonType, ...rest } = field;
			return (
				<Button
					key={key}
					text={text || label || "Button"}
					type={buttonType || "neutral"}
					{...rest}
				/>
			);
		}

		if (isBoolean) {
			const { label, input, checked, onChange: onFieldChange, ...rest } = field;
			return (
				<div className="form__switch-wrapper" key={key}>
					{label && <label className="form__switch-label">{label}</label>}
					<Switch
						{...rest}
						checked={Boolean(formData[key])}
						onChange={(val) => {
							handleFieldChange(key, val);
							if (onFieldChange) onFieldChange(val, { formData });
						}}
					/>
				</div>
			);
		}

		if (isSelect || isMultiple) {
			const { value, onChange: onFieldChange, linkTo, ...rest } = field;

			const renderSelectInput = () => {
				if (isMultiple) {
					return (
						<SelectMultiple
							{...rest}
							value={formData[key] || []}
							onChange={(val) => {
								handleFieldChange(key, val);
								if (onFieldChange) onFieldChange(val, { formData });
							}}
						/>
					);
				}
				return (
					<Select
						{...rest}
						value={formData[key]}
						error={formErrors[key] || field.error}
						onChange={(val) => {
							handleFieldChange(key, val);
							if (onFieldChange) onFieldChange(val, { formData });
						}}
					/>
				);
			};

			if (linkTo) {
				return (
					<div
						key={key}
						style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}
					>
						<div style={{ flex: 1, minWidth: 0 }}>{renderSelectInput()}</div>
						{renderActionButtons(field)}
					</div>
				);
			}

			return <div key={key}>{renderSelectInput()}</div>;
		}

		if (isDate) {
			const { value, onChange: onFieldChange, input, ...rest } = field;
			return (
				<InputDate
					key={key}
					{...rest}
					value={formData[key]}
					onChange={(val) => {
						handleFieldChange(key, val);
						if (onFieldChange) onFieldChange(val);
					}}
				/>
			);
		}

		if (isTime) {
			const { value, onChange: onFieldChange, input, ...rest } = field;
			return (
				<InputTime
					key={key}
					{...rest}
					value={formData[key]}
					onChange={(val) => {
						handleFieldChange(key, val);
						if (onFieldChange) onFieldChange(val);
					}}
				/>
			);
		}

		if (isDatetime) {
			const { value, onChange: onFieldChange, input, ...rest } = field;
			return (
				<InputDatetime
					key={key}
					{...rest}
					value={formData[key]}
					onChange={(val) => {
						handleFieldChange(key, val);
						if (onFieldChange) onFieldChange(val);
					}}
				/>
			);
		}

		if (isSubList) {
			const { value, onChange: onFieldChange, input, structure, linkTo, ...rest } = field;
			const sublistElement = (
				<SubList
					{...rest}
					structure={structure || []}
					value={formData[key] || []}
					rowErrors={sublistErrors[key]}
					onChange={(val) => {
						handleFieldChange(key, val);
						if (onFieldChange) onFieldChange(val);
					}}
				/>
			);

			if (linkTo) {
				return (
					<div
						key={key}
						style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}
					>
						<div style={{ flex: 1, minWidth: 0 }}>{sublistElement}</div>
						{renderActionButtons(field, { paddingTop: "2rem" })}
					</div>
				);
			}

			return <div key={key}>{sublistElement}</div>;
		}

		if (isObject) {
			const { label, structure, ...rest } = field;
			const currentObj = formData[key] || {};
			const isPopulated = isObjectPopulated(currentObj);

			return (
				<div className="form__object-field" key={key}>
					{label && <label className="form__field-label">{label}</label>}
					<div className="form__object-actions">
						<Button
							text={`Add ${label}`}
							onClick={(e) => {
								e.preventDefault();
								openObjectModal(field, "EDIT");
							}}
							type="primary"
							outline
							disabled={rest.disabled || isPopulated}
						/>
						{isPopulated && (
							<div className="form__object-populated-actions">
								<ActionButton
									icon={<FiEye />}
									type="neutral"
									onClick={(e) => {
										e.preventDefault();
										openObjectModal(field, "VIEW");
									}}
									title={`View ${label}`}
									style={{ width: "2.8rem", height: "2.8rem", fontSize: "1rem" }}
								/>
								{!rest.disabled && (
									<>
										<ActionButton
											icon={<FiEdit2 />}
											onClick={(e) => {
												e.preventDefault();
												openObjectModal(field, "EDIT");
											}}
											title={`Edit ${label}`}
											style={{ width: "2.8rem", height: "2.8rem", fontSize: "1rem" }}
										/>
										<ActionButton
											icon={<FiTrash2 />}
											type="error"
											onClick={(e) => {
												e.preventDefault();
												openDeleteConfirm(key, label);
											}}
											title={`Remove ${label}`}
											style={{ width: "2.8rem", height: "2.8rem", fontSize: "1rem" }}
										/>
									</>
								)}
							</div>
						)}
					</div>
				</div>
			);
		}

		const { value, onChange: onFieldChange, input, ...rest } = field;

		if (input === "files") {
			const isImageFiles = field.accept && field.accept.includes("image");
			if (isImageFiles) {
				return (
					<DropzoneMultiple
						key={key}
						{...rest}
						accept={field.accept}
						value={formData[key] || []}
						error={formErrors[key] || field.error}
						onChange={(files) => {
							handleFieldChange(key, files);
							if (onFieldChange) onFieldChange(files);
						}}
					/>
				);
			}

			return (
				<Input
					key={key}
					{...rest}
					type="files"
					value={formData[key] || []}
					error={formErrors[key] || field.error}
					onChange={(files) => {
						handleFieldChange(key, files);
						if (onFieldChange) onFieldChange(files);
					}}
				/>
			);
		}

		const isImageFile = input === "file" && field.accept && field.accept.includes("image");

		if (isImageFile) {
			return (
				<Dropzone
					key={key}
					{...rest}
					value={formData[key]}
					error={formErrors[key] || field.error}
					onChange={(val) => {
						handleFieldChange(key, val);
						if (onFieldChange) onFieldChange(val);
					}}
				/>
			);
		}

		const { labelFormatter, ...inputRest } = rest;
		const rawValue = formData[key] ?? "";
		const hasFormatter = typeof labelFormatter === "function";
		const displayValue =
			hasFormatter && rawValue !== "" && rawValue !== null && rawValue !== undefined
				? labelFormatter(rawValue)
				: rawValue;

		return (
			<Input
				key={key}
				{...inputRest}
				htmlType={
					hasFormatter
						? "text"
						: input === "textarea" || input === "select"
						? undefined
						: input
				}
				value={displayValue}
				error={formErrors[key] || field.error}
				onChange={(e) => {
					const val = e.target
						? e.target.type === "file"
							? e.target.files[0]
							: e.target.value
						: e;
					handleFieldChange(key, val);
					if (onFieldChange) onFieldChange(e);
				}}
			/>
		);

	};

	const hasNativeActions = onSubmit || onCancel;

	return (
		<form
			className={`form ${className}`}
			style={style}
			noValidate
			onSubmit={async (e) => {
				e.preventDefault();
				e.stopPropagation();

				const { isValid, missingLabels } = validateForm();
				if (!isValid) {
					if (triggerPopUp) {
						const fieldList = missingLabels.length > 0 ? `: ${missingLabels.join(", ")}` : "";
						triggerPopUp("warning", `Please fill in all required fields${fieldList}.`);
					}
					if (onError) onError();
					return;
				}

				if (onSubmit) {
					setIsSubmitting(true);
					try {
						await onSubmit(formData, e);
					} finally {
						setIsSubmitting(false);
					}
				}
			}}
		>
			<div className="form__fields">
				{fields.map((field, index) => renderField(field, index))}
			</div>

			{hasNativeActions && (
				<div className="form__actions">
					{onCancel && (
						<Button
							text={cancelText}
							type={cancelType}
							outline={true}
							disabled={activeIsSubmitting}
							onClick={(e) => {
								e.preventDefault();
								onCancel(e);
							}}
						/>
					)}
					{onSubmit && (
						<Button
							text={submitText}
							type={submitType}
							disabled={activeIsSubmitting}
							icon={
								activeIsSubmitting ? (
									<Spinner
										type={submitType === "primary" ? "#ffffff" : submitType}
									/>
								) : undefined
							}
							iconPosition="end"
						/>
					)}
				</div>
			)}

			<Modal
				isOpen={objectModal.isOpen}
				onClose={closeObjectModal}
				title={objectModal.field ? `Edit ${objectModal.field.label}` : "Object Data"}
				size="lg"
			>
				{objectModal.isOpen && (
					<Form
						fields={objectModal.field?.structure?.map((col) => {
							const key = col.id;
							const existing = objectModal.data[key];
							return {
								...col,
								value: existing ?? (col.input === "sublist" || col.multiple ? [] : ""),
								disabled: col.disabled || objectModal.mode === "VIEW",
							};
						})}
						value={objectModal.data}
						onChange={handleObjectFieldChange}
						onSubmit={objectModal.mode === "VIEW" ? undefined : () => handleObjectSubmit(objectModal.field.id, objectModal.data)}
						onCancel={closeObjectModal}
						submitText="Save"
					/>
				)}
			</Modal>

			<Modal
				isOpen={deleteConfirm.isOpen}
				onClose={() => setDeleteConfirm({ isOpen: false, fieldId: null })}
				title="Remove Data"
				size="sm"
			>
				<div style={{ padding: "0.25rem 0", textAlign: "center" }}>
					<p style={{ marginBottom: "1.5rem", fontSize: "0.95rem", color: "var(--color-foreground, #111)" }}>
						Are you sure you want to remove the data for <strong>{deleteConfirm.label}</strong>? This action cannot be undone.
					</p>
					<div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
						<Button
							text="Cancel"
							type="neutral"
							outline
							onClick={() => setDeleteConfirm({ isOpen: false, fieldId: null })}
						/>
						<Button
							text="Remove"
							type="primary"
							onClick={confirmDelete}
						/>
					</div>
				</div>
			</Modal>
		</form>
	);
};

export default Form;
