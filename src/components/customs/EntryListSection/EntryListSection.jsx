import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import Sheet from "../Sheet/Sheet";
import Form from "../Form/Form";
import SimpleList from "../SimpleList/SimpleList";
import Button from "../../modulars/Button/Button";
import "./EntryListSection.css";

const EntryListSection = ({
	title,
	fields,
	entries,
	emptyText,
	renderPrimary,
	renderSecondary,
	isSaving,
	pendingSync,
	pendingEntry,
	disabled,
	disabledHint,
	onSave,
	onRemove,
}) => {
	const [mode, setMode] = useState("closed");
	const [editingId, setEditingId] = useState(null);
	const [formValue, setFormValue] = useState({});

	// A failed save is restored from localStorage on mount — reopen the form
	// pre-filled once so the user can review it and retry with one click.
	useEffect(() => {
		if (pendingEntry) {
			setFormValue(pendingEntry.data);
			setEditingId(pendingEntry.editingId);
			setMode(pendingEntry.editingId ? "edit" : "add");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const openAdd = () => {
		setFormValue({});
		setEditingId(null);
		setMode("add");
	};

	const openEdit = (entry) => {
		setFormValue(entry);
		setEditingId(entry._id || entry.id);
		setMode("edit");
	};

	const close = () => {
		setMode("closed");
		setEditingId(null);
		setFormValue({});
	};

	const handleSubmit = async (data) => {
		await onSave(data, editingId);
		close();
	};

	return (
		<Sheet className="entry-list-section" elevation={1}>
			<div className="entry-list-section__header">
				<h2 className="entry-list-section__title">{title}</h2>
				{pendingSync && (
					<span className="entry-list-section__pending">Pending sync</span>
				)}
				{mode === "closed" && !disabled && (
					<Button text={`Add ${title}`} type="primary" outline icon={<FiPlus />} onClick={openAdd} />
				)}
			</div>

			{disabled && <p className="entry-list-section__empty">{disabledHint}</p>}

			{!disabled && entries.length === 0 && mode === "closed" && (
				<p className="entry-list-section__empty">{emptyText}</p>
			)}

			{!disabled && entries.length > 0 && (
				<SimpleList
					items={entries.map((entry) => ({
						id: entry._id || entry.id,
						primaryText: renderPrimary(entry),
						secondaryText: renderSecondary?.(entry),
						actions: [
							{ icon: <FiEdit2 />, type: "secondary", onClick: () => openEdit(entry) },
							{ icon: <FiTrash2 />, type: "error", onClick: () => onRemove(entry._id || entry.id) },
						],
					}))}
				/>
			)}

			{!disabled && mode !== "closed" && (
				<Form
					fields={fields}
					value={formValue}
					onChange={(key, val) => setFormValue((prev) => ({ ...prev, [key]: val }))}
					onSubmit={handleSubmit}
					onCancel={close}
					submitText="Save"
					isLoading={isSaving}
				/>
			)}
		</Sheet>
	);
};

export default EntryListSection;
