import { useId, useState } from "react";
import "./Input.css";

const PRESET_COLORS = [
	"primary",
	"secondary",
	"tertiary",
	"quaternary",
	"neutral",
	"info",
	"success",
	"warning",
	"error",
];

const resolveColor = (color) => {
	if (!color) return null;
	return PRESET_COLORS.includes(color) ? `var(--color-${color})` : color;
};

const Input = ({
	label,
	placeholder = "",
	error = false,
	errorMessage,
	value,
	password = false,
	textarea = false,
	file = false,
	type = null,
	htmlType,
	floatingLabel = false,
	apiHost,
	imageHost,
	apiPath,
	enum: enumValues,
	hideEnumHint = false,
	options,
	...props
}) => {
	const isFile = file || htmlType === "file" || type === "file";
	const isFiles = type === "files";
	const fieldClass = `input-field ${error ? "input-field--error" : ""}`;

	// Native <datalist> suggestions: shows a browser-native dropdown while
	// leaving the field free-text — used for catalog-backed fields (e.g. Skill
	// suggestions) where the user must still be able to type an unlisted value.
	const datalistId = useId();
	const hasSuggestions = Array.isArray(options) && options.length > 0 && !isFile && !textarea;

	// A file input is only interactive when at least one host prop is provided
	const isConfigured = !isFile || !!(imageHost || (apiHost && apiPath));

	// Build URL for existing file values coming from the backend
	const fileUrl = (() => {
		if (!isFile || !value || typeof value !== "string") return null;
		if (value.startsWith("http") || value.startsWith("data:")) return value;
		const host = imageHost || (apiHost && apiPath ? `${apiHost}${apiPath}` : null);
		if (!host) return null;
		return `${host}/${value.replace(/\\/g, "/")}`;
	})();

	// Determines the input type (only relevant for <input> elements)
	const inputType = isFile ? "file" : password ? "password" : htmlType || "text";

	// Inline validation error for the array chip input
	const [arrayInputError, setArrayInputError] = useState("");

	// Renders the appropriate field element
	const renderField = (asFloating = false) => {
		const ph = asFloating ? " " : placeholder; // floating needs a space to trigger :placeholder-shown

		if (textarea) {
			return (
				<textarea
					className={`${fieldClass} input-textarea`}
					placeholder={ph}
					value={value}
					{...props}
				/>
			);
		}

		if (isFile) {
			// file inputs cannot have a controlled value
			return (
				<>
					<input
						className={fieldClass}
						type="file"
						{...props}
						disabled={!isConfigured || props.disabled}
					/>
					{fileUrl && (
						<a
							className="input-file-current"
							href={fileUrl}
							target="_blank"
							rel="noopener noreferrer"
							title={value}
						>
							{value.split("/").pop().split("\\").pop()}
						</a>
					)}
				</>
			);
		}


		return (
			<>
				<input
					className={fieldClass}
					type={inputType}
					placeholder={ph}
					value={value}
					list={hasSuggestions ? datalistId : undefined}
					{...props}
				/>
				{hasSuggestions && (
					<datalist id={datalistId}>
						{options.map((opt) => (
							<option key={opt.id} value={opt.value} />
						))}
					</datalist>
				)}
			</>
		);
	};

	// ── Multiple files mode ──────────────────────────────────────────────────
	if (isFiles) {
		const filesList = Array.isArray(value) ? value : [];

		return (
			<div className={`input input--files ${error ? "input--files-error" : ""}`}>
				{label && (
					<label className={`input-label ${error ? "input-label--error" : ""}`}>
						{label}
					</label>
				)}
				<input
					className={fieldClass}
					type="file"
					multiple
					{...props}
					disabled={props.disabled}
					onChange={(e) => {
						if (props.onChange) {
							props.onChange(Array.from(e.target.files));
						}
					}}
				/>
				{filesList.length > 0 && (
					<div className="input-files-list">
						{filesList.map((filePath, idx) => {
							if (!filePath || typeof filePath !== "string") return null;
							const resolvedUrl = (() => {
								if (filePath.startsWith("http") || filePath.startsWith("data:")) return filePath;
								const host = imageHost || (apiHost && apiPath ? `${apiHost}${apiPath}` : null);
								if (!host) return null;
								return `${host}/${filePath.replace(/\\/g, "/")}`;
							})();
							const fileName = filePath.split("/").pop().split("\\").pop();
							return resolvedUrl ? (
								<a
									key={idx}
									className="input-file-current"
									href={resolvedUrl}
									target="_blank"
									rel="noopener noreferrer"
									title={filePath}
								>
									{fileName}
								</a>
							) : (
								<span key={idx} className="input-file-current" title={filePath}>
									{fileName}
								</span>
							);
						})}
					</div>
				)}
				{error && (
					<span className="input-error-message">
						{errorMessage || "This field is required."}
					</span>
				)}
			</div>
		);
	}

	// Floating label layout (not available for file inputs)
	if (floatingLabel && !isFile) {
		return (
			<div
				className={`input input--floating ${textarea ? "input--floating-textarea" : ""} ${error ? "input--error" : ""}`}
				style={
					resolveColor(type) ? { "--input-color": resolveColor(type) } : {}
				}
			>
				{renderField(true)}
				{label && <label className="input-label">{label}</label>}
				{error && errorMessage && (
					<span className="input-error-message">{errorMessage}</span>
				)}
			</div>
		);
	}

	// ── Array of primitives mode ───────────────────────────────────────────────
	if (Array.isArray(value) && value.every((v) => typeof v === "string" || typeof v === "number")) {
		const chips = value;
		const chipType = inputType === "number" ? "number" : "text";

		// Label with enum hint
		const chipLabel = (enumValues?.length && !hideEnumHint)
			? label ? `${label} (${enumValues.join(', ')})` : `(${enumValues.join(', ')})`
			: label;

		const addChip = (raw) => {
			const trimmed = String(raw).trim();
			if (!trimmed) return;
			const parsed = chipType === "number" ? Number(trimmed) : trimmed;
			if (chipType === "number" && isNaN(parsed)) return;

			// Enum validation
			if (enumValues?.length && !enumValues.includes(parsed)) {
				setArrayInputError(`Allowed values: ${enumValues.join(', ')}`);
				setTimeout(() => setArrayInputError(""), 2500);
				return;
			}

			if (props.onChange) props.onChange([...chips, parsed]);
			setArrayInputError("");
		};

		const removeChip = (idx) => {
			if (props.onChange) props.onChange(chips.filter((_, i) => i !== idx));
		};

		return (
			<div className={`input input--array ${error ? "input--array-error" : ""}`}>
				{chipLabel && (
					<label className={`input-label ${error ? "input-label--error" : ""}`}>
						{chipLabel}
					</label>
				)}
				<div className={`input-array-body ${arrayInputError ? "input-array-body--shake" : ""}`}>
					{chips.map((chip, idx) => (
						<span key={idx} className="input-array-chip">
							{chip}
							{!props.disabled && (
								<button
									type="button"
									className="input-array-chip-remove"
									onClick={() => removeChip(idx)}
									aria-label="Remove"
								>×</button>
							)}
						</span>
					))}
					{!props.disabled && (
						<input
							className="input-array-input"
							type={chipType}
							placeholder={placeholder || "Add…"}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === ",") {
									e.preventDefault();
									addChip(e.target.value);
									e.target.value = "";
								}
							}}
							onBlur={(e) => {
								if (e.target.value) {
									addChip(e.target.value);
									e.target.value = "";
								}
							}}
						/>
					)}
				</div>
				{arrayInputError && (
					<span className="input-array-enum-error">{arrayInputError}</span>
				)}
				{error && (
					<span className="input-error-message">
						{errorMessage || "This field is required."}
					</span>
				)}
			</div>
		);
	}


	const fileTypeClass = isFile && type ? `input-file--${type}` : "";

	// Standard layout
	return (
		<div
			className={`input ${fileTypeClass}`}
			style={
				!isFile && resolveColor(type)
					? { "--input-color": resolveColor(type) }
					: {}
			}
		>
			{label && (
				<label className={`input-label ${error ? "input-label--error" : ""}`}>
					{label}
				</label>
			)}
			{renderField()}
			{error && (
				<span className="input-error-message">
					{errorMessage || "This field is required."}
				</span>
			)}
		</div>
	);
};

export default Input;
