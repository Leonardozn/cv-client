import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import Select from "../Select/Select";
import SelectMultiple from "../SelectMultiple/SelectMultiple";
import Input from "../../modulars/Input/Input";
import ActionButton from "../../modulars/ActionButton/ActionButton";
import Modal from "../Modal/Modal";
import Form from "../Form/Form";
import Button from "../../modulars/Button/Button";
import InputDate from "../InputDate/InputDate";
import InputTime from "../InputTime/InputTime";
import InputDatetime from "../InputDatetime/InputDatetime";
import Switch from "../../modulars/Switch/Switch";
import "./SubList.css";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Build a blank row object from a structure definition */
const buildEmptyRow = (structure) => {
	const row = {};
	structure.forEach((col) => {
		if (
			col.input === "sublist" ||
			col.input === "files" ||
			col.input === "multiselect" ||
			Array.isArray(col.value)
		) {
			row[col.id] = [];
		} else if (col.input === "object" && col.structure) {
			row[col.id] = buildEmptyRow(col.structure);
		} else if (col.input === "boolean" || col.input === "checkbox" || col.input === "switch") {
			row[col.id] = false;
		} else {
			row[col.id] = col.value ?? "";
		}
	});
	return row;
};

/** Recursively normalize dates in rows based on structure */
const normalizeDatesRecursive = (rows, structure) => {
	if (!Array.isArray(rows)) return [];
	return rows.map((row) => {
		if (!row || typeof row !== "object" || row instanceof File || Array.isArray(row)) {
			return row;
		}

		const normalized = { ...row };
		structure.forEach((col) => {
			const val = normalized[col.id];
			if (val === undefined || val === null) return;

			if (col.input === "date") {
				normalized[col.id] = String(val).slice(0, 10);
			} else if (col.input === "sublist" && col.structure && Array.isArray(val)) {
				normalized[col.id] = normalizeDatesRecursive(val, col.structure);
			} else if (col.input === "object" && col.structure && typeof val === "object") {
				const [normalizedObj] = normalizeDatesRecursive([val], col.structure);
				normalized[col.id] = normalizedObj;
			}
		});
		return normalized;
	});
};

/** Build a Form-compatible fields array from a structure definition + an existing row */
const buildFormFields = (structure, row = {}) =>
	structure.map((col) => {
		const isBoolean = col.input === "boolean" || col.input === "checkbox" || col.input === "switch";
		const existing = row[col.id];
	const isArray = col.input === "sublist" || col.input === "multiselect" || Array.isArray(col.value);

		return {
			...col,
			...(isBoolean
				? { checked: typeof existing === "boolean" ? existing : false }
				: { value: existing ?? (isArray ? [] : "") }),
		};
	});

// ── Nested sublist cell ────────────────────────────────────────────────────────
// Compact cell: shows a single count badge + "+ Add" button.
// Clicking the count opens a "manage" modal listing all sub-items.
// Manages its own modal state so it doesn't pollute the parent SubList.

const NestedSublistCell = ({ col, cellValue, rowIndex, onChangeCell, disabled }) => {
	const items = Array.isArray(cellValue) ? cellValue : [];

	// mode: null | "manage" | "add" | "edit"
	const [modal, setModal] = useState({ mode: null, editIndex: null });
	const [rowData, setRowData] = useState({});

	const openManage = (e) => {
		e.preventDefault();
		setModal({ mode: "manage", editIndex: null });
	};

	const openAdd = (e) => {
		e.preventDefault();
		setRowData(buildEmptyRow(col.structure));
		setModal({ mode: "add", editIndex: null });
	};

	const openEdit = (e, idx) => {
		e.preventDefault();
		setRowData(items[idx] || {});
		setModal({ mode: "edit", editIndex: idx });
	};

	const closeModal = () => {
		setModal({ mode: null, editIndex: null });
		setRowData({});
	};

	const backToManage = () => {
		setModal({ mode: "manage", editIndex: null });
		setRowData({});
	};

	const handleSubmit = (formData) => {
		const updated =
			modal.mode === "edit"
				? items.map((item, i) => (i === modal.editIndex ? formData : item))
				: [...items, formData];
		onChangeCell(rowIndex, col.id, updated);
		// After adding → close everything; after editing → back to manage list
		modal.mode === "edit" ? backToManage() : closeModal();
	};

	const handleRemove = (e, idx) => {
		e.preventDefault();
		e.stopPropagation();
		const updated = items.filter((_, i) => i !== idx);
		onChangeCell(rowIndex, col.id, updated);
	};

	const isFormMode = modal.mode === "add" || modal.mode === "edit";
	const editingRow = rowData;
	const modalFields = buildFormFields(col.structure, editingRow);
	const formTitle = modal.mode === "edit" ? `Edit ${col.label} #${modal.editIndex + 1}` : `Add ${col.label}`;

	return (
		<div className="sublist__nested-cell">
			{/* Count badge — static, no click */}
			{items.length === 0 ? (
				<span className="sublist__nested-empty">No items</span>
			) : (
				<span className="sublist__nested-badge">
					{items.length} {items.length === 1 ? "item" : "items"}
				</span>
			)}

			{/* Buttons: Add + Edit (manage) */}
			{!disabled && (
				<>
					<button
						type="button"
						className="sublist__nested-add-btn"
						onClick={openAdd}
						title="Add item"
					>
						<FiPlus size={12} />
					</button>
					{items.length > 0 && (
						<button
							type="button"
							className="sublist__nested-edit-btn"
							onClick={openManage}
							title="Manage items"
						>
							<FiEdit2 size={12} />
						</button>
					)}
				</>
			)}

			{/* Manage modal — lists all sub-items */}
			<Modal
				isOpen={modal.mode === "manage"}
				onClose={closeModal}
				title={`${col.label} (${items.length})`}
			>
				<div className="sublist__nested-manage">
					{items.map((item, idx) => (
						<div key={idx} className="sublist__nested-manage-row">
							<span className="sublist__nested-manage-label">
								{col.label} #{idx + 1}
							</span>
							<div className="sublist__nested-manage-actions">
								<button
									type="button"
									className="sublist__nested-manage-btn sublist__nested-manage-btn--edit"
									onClick={(e) => openEdit(e, idx)}
									title="Edit"
								>
									<FiEdit2 size={13} />
								</button>
								<button
									type="button"
									className="sublist__nested-manage-btn sublist__nested-manage-btn--remove"
									onClick={(e) => handleRemove(e, idx)}
									title="Remove"
								>
									<FiTrash2 size={13} />
								</button>
							</div>
						</div>
					))}
					{!disabled && (
						<button
							type="button"
							className="sublist__add-btn"
							style={{ marginTop: "0.75rem" }}
							onClick={openAdd}
						>
							<FiPlus />
							Add {col.label}
						</button>
					)}
				</div>
			</Modal>

			{/* Add / Edit form modal */}
			<Modal
				isOpen={isFormMode}
				onClose={modal.mode === "edit" ? backToManage : closeModal}
				title={formTitle}
			>
				<Form
					key={isFormMode ? `nested-${modal.mode}-${modal.editIndex}` : "closed"}
					fields={modalFields}
					value={rowData}
					onChange={(key, val) => setRowData(prev => ({ ...prev, [key]: val }))}
					onSubmit={handleSubmit}
					onCancel={modal.mode === "edit" ? backToManage : closeModal}
					submitText={modal.mode === "edit" ? "Save changes" : "Add"}
				/>
			</Modal>
		</div>
	);
};

// ── Nested object cell ────────────────────────────────────────────────────────
// Compact cell for single objects. Shows "Data configured" or "No data".
// Opens a form modal to edit the object fields.

const NestedObjectCell = ({ col, cellValue, rowIndex, onChangeCell, disabled }) => {
	const obj = (typeof cellValue === "object" && cellValue !== null) ? cellValue : {};
	const isEmpty = Object.keys(obj).length === 0;

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [rowData, setRowData] = useState({});

	const openModal = (e) => {
		e.preventDefault();
		setRowData(isEmpty ? buildEmptyRow(col.structure) : obj);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setRowData({});
	};

	const handleSubmit = (formData) => {
		onChangeCell(rowIndex, col.id, formData);
		closeModal();
	};

	const handleClear = (e) => {
		e.preventDefault();
		setIsConfirmOpen(true);
	};

	const confirmClear = () => {
		onChangeCell(rowIndex, col.id, {});
		setIsConfirmOpen(false);
	};

	const modalFields = buildFormFields(col.structure, rowData);

	return (
		<div className="sublist__nested-cell">
			{isEmpty ? (
				<span className="sublist__nested-empty">No data</span>
			) : (
				<span className="sublist__nested-badge">Data configured</span>
			)}

			{!disabled && (
				<div style={{ display: "flex", gap: "0.25rem" }}>
					<button
						type="button"
						className="sublist__nested-edit-btn"
						onClick={openModal}
						title={isEmpty ? "Add data" : "Edit data"}
					>
						{isEmpty ? <FiPlus size={12} /> : <FiEdit2 size={12} />}
					</button>

					{!isEmpty && (
						<button
							type="button"
							className="sublist__nested-manage-btn sublist__nested-manage-btn--remove"
							style={{ width: "1.6rem", height: "1.6rem", border: "1.5px solid var(--color-error, #ef4444)", borderRadius: "0.35rem" }}
							onClick={handleClear}
							title="Clear data"
						>
							<FiTrash2 size={12} />
						</button>
					)}
				</div>
			)}

			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				title={isEmpty ? `Add ${col.label}` : `Edit ${col.label}`}
			>
				<Form
					key={isModalOpen ? `object-${rowIndex}-${col.id}` : "closed"}
					fields={modalFields}
					value={rowData}
					onChange={(key, val) => setRowData(prev => ({ ...prev, [key]: val }))}
					onSubmit={handleSubmit}
					onCancel={closeModal}
					submitText={isEmpty ? "Add" : "Save changes"}
				/>
			</Modal>

			<Modal
				isOpen={isConfirmOpen}
				onClose={() => setIsConfirmOpen(false)}
				title="Clear Data"
				size="sm"
			>
				<div style={{ padding: "0.25rem 0", textAlign: "center" }}>
					<p style={{ marginBottom: "1.5rem", fontSize: "0.95rem", color: "var(--color-foreground, #111)" }}>
						Are you sure you want to clear the data for <strong>{col.label}</strong>? This action cannot be undone.
					</p>
					<div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
						<Button
							text="Cancel"
							type="neutral"
							outline
							onClick={() => setIsConfirmOpen(false)}
						/>
						<Button
							text="Clear"
							type="primary"
							onClick={confirmClear}
						/>
					</div>
				</div>
			</Modal>
		</div>
	);
};

// ── SubList ────────────────────────────────────────────────────────────────────
// Custom component — renders an editable list of structured sub-objects.
//
// Props:
//   label     {string}   — Optional section label shown above the table.
//   value     {Array}    — Controlled array of row objects.
//   onChange  {function} — Called with the updated array on any change.
//   structure {Array}    — Column definitions. Each item supports:
//                            id, label, input, select, options, placeholder
//   disabled  {boolean}  — When true, the list is read-only.

const SubList = ({
	label,
	value = [],
	onChange,
	structure = [],
	disabled = false,
	outputType = "string", // permitted: "string", "number", "boolean"
	rowErrors = [],
	responsiveSize = "sm", // permitted: "sm" | "md" | "lg" | "xl"
}) => {
	const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, index: null });
	const isPrimitiveMode = structure.length === 1;
	const fieldId = isPrimitiveMode ? structure[0]?.id : null;

	// Helper to normalize data: converts primitive arrays to object arrays and ensures dates are sliced
	const normalizeValue = (val) => {
		if (!Array.isArray(val)) return [];

		if (isPrimitiveMode) {
			return val.map((item) => {
				// A row is valid if it's an object that actually contains the fieldId.
				// We must exclude Files and nulls from being treated as row containers.
				const isAlreadyWrapped =
					typeof item === "object" &&
					item !== null &&
					!(item instanceof File) &&
					!Array.isArray(item) &&
					fieldId in item;

				const row = isAlreadyWrapped ? item : { [fieldId]: item };
				return normalizeDatesRecursive([row], structure)[0];
			});
		}
		return normalizeDatesRecursive(val, structure);
	};

	const [rows, setRows] = useState(() => normalizeValue(value));

	// Sync external value changes
	useEffect(() => {
		setRows(normalizeValue(value));
	}, [value, isPrimitiveMode, fieldId]);

	const transformOutput = (updatedRows) => {
		const normalizedRows = normalizeDatesRecursive(updatedRows, structure);

		if (isPrimitiveMode) {
			return normalizedRows.map((row) => {
				const rawVal = row[fieldId];
				if (outputType === "number") {
					const num = Number(rawVal);
					return isNaN(num) ? "" : num;
				}
				if (outputType === "boolean") {
					return Boolean(rawVal);
				}
				if (rawVal instanceof File) {
					return rawVal;
				}
				return String(rawVal);
			});
		}
		return normalizedRows;
	};

	const notify = (updated) => {
		setRows(updated);
		onChange?.(transformOutput(updated));
	};

	const handleAddRow = () => {
		const newRow = buildEmptyRow(structure);
		notify([...rows, newRow]);
	};

	const handleRemoveRow = (index) => {
		setDeleteConfirm({ isOpen: true, index });
	};

	const confirmRemoveRow = () => {
		if (deleteConfirm.index !== null) {
			const updated = rows.filter((_, i) => i !== deleteConfirm.index);
			notify(updated);
		}
		setDeleteConfirm({ isOpen: false, index: null });
	};

	const handleCellChange = (rowIndex, colId, val) => {
		const updated = rows.map((row, i) =>
			i === rowIndex ? { ...row, [colId]: val } : row,
		);
		notify(updated);
	};

	const renderCell = (row, rowIndex, col) => {
		const defaultValue = col.input === "object" ? {} : (Array.isArray(col.value) ? [] : "");
		const cellValue = row[col.id] ?? defaultValue;
		// Col-level disabled takes priority; falls back to the SubList-level disabled prop
		const isDisabled = col.disabled || disabled;
		const cellError = rowErrors?.[rowIndex]?.[col.id] || false;

		// ── Boolean/Switch ───────────────────────────────────────────────────
		if (col.input === "boolean" || col.input === "checkbox" || col.input === "switch") {
			return (
				<Switch
					checked={Boolean(cellValue)}
					onChange={(val) => handleCellChange(rowIndex, col.id, val)}
					disabled={isDisabled}
				/>
			);
		}

		if (col.input === "select" || col.input === "multiselect") {
			// ── Multiple select ────────────────────────────────────────────────
			if (col.input === "multiselect") {
				const multiValue = Array.isArray(cellValue) ? cellValue : [];
				const multiSelectElement = (
					<SelectMultiple
						options={col.options || []}
						value={multiValue}
						placeholder={col.placeholder || `Select ${col.label}`}
						onChange={(val) => handleCellChange(rowIndex, col.id, val)}
						disabled={isDisabled}
						error={cellError}
					/>
				);

				if (col.linkTo && !isDisabled) {
					return (
						<div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
							<div style={{ flex: 1, minWidth: 0 }}>{multiSelectElement}</div>
							<ActionButton
								icon={<FiPlus />}
								outline={true}
								style={{ width: "2rem", height: "2rem", flexShrink: 0, padding: 0 }}
								onClick={(e) => {
									e.preventDefault();
									window.open(`${col.linkTo}?action=new&external=true&fromField=${col.id}&fromSublist=${fieldId || "global"}&fromRowIndex=${rowIndex}`, "_blank");
								}}
								title="New"
							/>
							<ActionButton
								icon={<FiEdit2 />}
								type="secondary"
								outline={true}
								style={{ width: "2rem", height: "2rem", flexShrink: 0, padding: 0 }}
								onClick={(e) => {
									e.preventDefault();
									const firstId = multiValue[0];
									if (!firstId) {
										alert(`Please select a ${col.label.toLowerCase()} to edit.`);
										return;
									}
									window.open(`${col.linkTo}?action=edit&id=${firstId}&external=true&fromField=${col.id}&fromSublist=${fieldId || "global"}&fromRowIndex=${rowIndex}`, "_blank");
								}}
								title="Edit"
							/>
						</div>
					);
				}

				return multiSelectElement;
			}

			// ── Single select ──────────────────────────────────────────────────
			const selectElement = (
				<Select
					options={col.options || []}
					value={cellValue}
					placeholder={col.placeholder || `Select ${col.label}`}
					onChange={(val) => handleCellChange(rowIndex, col.id, val)}
					disabled={isDisabled}
					error={cellError}
				/>
			);

			if (col.linkTo && !isDisabled) {
				return (
					<div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
						<div style={{ flex: 1, minWidth: 0 }}>{selectElement}</div>
						<ActionButton
							icon={<FiPlus />}
							outline={true}
							style={{ width: "2rem", height: "2rem", flexShrink: 0, padding: 0 }}
							onClick={(e) => {
								e.preventDefault();
								window.open(`${col.linkTo}?action=new&external=true&fromField=${col.id}&fromSublist=${fieldId || "global"}&fromRowIndex=${rowIndex}`, "_blank");
							}}
							title="New"
						/>
						<ActionButton
							icon={<FiEdit2 />}
							type="secondary"
							outline={true}
							style={{ width: "2rem", height: "2rem", flexShrink: 0, padding: 0 }}
							onClick={(e) => {
								e.preventDefault();
								let id = cellValue;
								if (id && typeof id === "object") {
									id = id._id || id.id;
								}
								if (!id) {
									alert(`Please select a ${col.label.toLowerCase()} to edit.`);
									return;
								}
								window.open(`${col.linkTo}?action=edit&id=${id}&external=true&fromField=${col.id}&fromSublist=${fieldId || "global"}&fromRowIndex=${rowIndex}`, "_blank");
							}}
							title="Edit"
						/>
					</div>
				);
			}

			return selectElement;
		}

		// ── Nested sublist ─────────────────────────────────────────────────
		if (col.input === "sublist" && Array.isArray(col.structure)) {
			return (
				<NestedSublistCell
					key={`${rowIndex}-${col.id}`}
					col={col}
					cellValue={cellValue}
					rowIndex={rowIndex}
					onChangeCell={handleCellChange}
					disabled={isDisabled}
				/>
			);
		}

		// ── Primitive sublist (no structure → plain array chip input) ──────────
		// When a sublist column has no structure, it acts as a multi-value primitive
		// array. Infer the correct htmlType from enum values to avoid chipType
		// mismatches (e.g. numeric enum compared against string-parsed chips).
		if (col.input === "sublist" && !Array.isArray(col.structure)) {
			const primitiveType =
				col.enum?.length && col.enum.every((v) => typeof v === "number")
					? "number"
					: "text";
			return (
				<Input
					htmlType={primitiveType}
					value={Array.isArray(cellValue) ? cellValue : []}
					placeholder={col.placeholder || col.label}
					enum={col.enum}
					hideEnumHint={true}
					error={cellError}
					onChange={(val) => handleCellChange(rowIndex, col.id, val)}
					disabled={isDisabled}
				/>
			);
		}

		// ── Nested object ──────────────────────────────────────────────────
		if (col.input === "object" && Array.isArray(col.structure)) {
			return (
				<NestedObjectCell
					key={`${rowIndex}-${col.id}`}
					col={col}
					cellValue={cellValue}
					rowIndex={rowIndex}
					onChangeCell={handleCellChange}
					disabled={isDisabled}
				/>
			);
		}

		// ── Special Input Types ──────────────────────────────────────────
		if (col.input === "date") {
			return (
				<InputDate
					value={cellValue}
					onChange={(val) => handleCellChange(rowIndex, col.id, val)}
					disabled={isDisabled}
					error={cellError}
				/>
			);
		}

		if (col.input === "time") {
			return (
				<InputTime
					value={cellValue}
					onChange={(val) => handleCellChange(rowIndex, col.id, val)}
					disabled={isDisabled}
					error={cellError}
				/>
			);
		}

		if (col.input === "datetime") {
			return (
				<InputDatetime
					value={cellValue}
					onChange={(val) => handleCellChange(rowIndex, col.id, val)}
					disabled={isDisabled}
					error={cellError}
				/>
			);
		}

		if (col.input === "files") {
			return (
				<Input
					type="files"
					value={Array.isArray(cellValue) ? cellValue : []}
					placeholder={col.placeholder || col.label}
					onChange={(files) => handleCellChange(rowIndex, col.id, files)}
					disabled={isDisabled}
				/>
			);
		}

		return (
			<Input
				htmlType={col.input || "text"}
				value={cellValue}
				placeholder={col.placeholder || col.label}
				enum={col.enum}
				hideEnumHint={true}
				apiHost={col.apiHost}
				apiPath={col.apiPath}
				imageHost={col.imageHost}
				accept={col.accept}
				options={col.options}
				error={cellError}
				onChange={(e) => {
					const val = e.target
						? e.target.type === "file"
							? e.target.files[0]
							: e.target.value
						: e;
					handleCellChange(rowIndex, col.id, val);
				}}
				disabled={isDisabled}
			/>
		);
	};

	return (
		<div className={`sublist sublist--responsive-${responsiveSize}`}>
			{label && <span className="sublist__label">{label}</span>}

			<div className="sublist__table-wrapper">
				<table className="sublist__table">
					<thead className="sublist__thead">
						<tr>
							{structure.map((col) => (
								<th key={col.id} style={col.thStyles ? { ...col.thStyles } : {}}>
									{col.required ? `${col.label} *` : col.label}
									{col.enum?.length > 0 && (
										<span className="sublist__header-hint">
											{" "}
											({col.enum.join(", ")})
										</span>
									)}
								</th>
							))}
							<th aria-label="Actions" />
						</tr>
					</thead>
					<tbody className="sublist__tbody">
						{rows.length === 0 ? (
							<tr>
								<td colSpan={structure.length + 1} className="sublist__empty">
									No items added yet.
								</td>
							</tr>
						) : (
							rows.map((row, rowIndex) => (
								<tr key={rowIndex}>
									{structure.map((col) => (
										<td key={col.id} data-label={col.label || col.id}>{renderCell(row, rowIndex, col)}</td>
									))}
									<td>
										<button
											type="button"
											className="sublist__remove-btn"
											onClick={() => handleRemoveRow(rowIndex)}
											disabled={disabled}
											aria-label="Remove row"
										>
											<FiTrash2 />
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{!disabled && (
				<button
					type="button"
					className="sublist__add-btn"
					onClick={handleAddRow}
				>
					<FiPlus />
					Add {label || "Item"}
				</button>
			)}

			<Modal
				isOpen={deleteConfirm.isOpen}
				onClose={() => setDeleteConfirm({ isOpen: false, index: null })}
				title="Remove Item"
				size="sm"
			>
				<div style={{ padding: "0.25rem 0", textAlign: "center" }}>
					<p style={{ marginBottom: "1.5rem", fontSize: "0.95rem", color: "var(--color-foreground, #111)" }}>
						Are you sure you want to remove this item from <strong>{label || "the list"}</strong>?
					</p>
					<div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
						<Button
							text="Cancel"
							type="neutral"
							outline
							onClick={() => setDeleteConfirm({ isOpen: false, index: null })}
						/>
						<Button
							text="Remove"
							type="primary"
							onClick={confirmRemoveRow}
						/>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default SubList;
