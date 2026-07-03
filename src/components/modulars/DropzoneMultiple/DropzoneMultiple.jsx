import { useRef, useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import "./DropzoneMultiple.css";

const DropzoneMultiple = ({
	label,
	value = [],
	onChange,
	accept = "image/*",
	disabled = false,
	error = false,
	errorMessage,
	placeholder = "Click or drag images to upload",
	apiHost,
	imageHost,
	apiPath,
	...props
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef(null);

	const staticHost = imageHost || (apiHost && apiPath ? `${apiHost}${apiPath}` : "");

	const resolvePreview = (item) => {
		if (item instanceof File || item instanceof Blob) {
			return URL.createObjectURL(item);
		}
		if (typeof item === "string") {
			if (item.startsWith("http") || item.startsWith("data:")) return item;
			if (staticHost) return `${staticHost}/${item.replace(/\\/g, "/")}`;
		}
		return null;
	};

	const addFiles = (files) => {
		if (!files || files.length === 0) return;
		const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"));
		if (incoming.length === 0) return;
		onChange([...value, ...incoming]);
	};

	const handleFileChange = (e) => {
		addFiles(e.target.files);
		// Reset so the same file can be re-added if removed
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleRemove = (e, index) => {
		e.stopPropagation();
		const updated = value.filter((_, i) => i !== index);
		onChange(updated);
	};

	const onDragOver = (e) => {
		e.preventDefault();
		if (!disabled) setIsDragging(true);
	};

	const onDragLeave = () => setIsDragging(false);

	const onDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		if (disabled) return;
		addFiles(e.dataTransfer.files);
	};

	const hasItems = value.length > 0;

	return (
		<div className={`dropzone-multiple ${error ? "dropzone-multiple--error" : ""}`}>
			{label && (
				<label className={`dropzone-multiple__label ${error ? "dropzone-multiple__label--error" : ""}`}>
					{label}
				</label>
			)}

			{/* Thumbnails grid */}
			{hasItems && (
				<div className="dropzone-multiple__grid">
					{value.map((item, index) => {
						const preview = resolvePreview(item);
						return (
							<div key={index} className="dropzone-multiple__thumb">
								{preview ? (
									<img
										src={preview}
										alt={`Image ${index + 1}`}
										className="dropzone-multiple__thumb-img"
										draggable={false}
									/>
								) : (
									<div className="dropzone-multiple__thumb-placeholder">
										<FiUpload />
									</div>
								)}
								{!disabled && (
									<button
										type="button"
										className="dropzone-multiple__thumb-remove"
										onClick={(e) => handleRemove(e, index)}
										title="Remove"
									>
										<FiX />
									</button>
								)}
							</div>
						);
					})}

					{/* Inline add tile */}
					{!disabled && (
						<div
							className={`dropzone-multiple__thumb dropzone-multiple__add-tile ${isDragging ? "dropzone-multiple__add-tile--dragging" : ""}`}
							onClick={() => fileInputRef.current?.click()}
							onDragOver={onDragOver}
							onDragLeave={onDragLeave}
							onDrop={onDrop}
							title="Add more images"
						>
							<FiUpload className="dropzone-multiple__add-icon" />
						</div>
					)}
				</div>
			)}

			{/* Empty drop zone */}
			{!hasItems && (
				<div
					className={`dropzone-multiple__zone ${isDragging ? "dropzone-multiple__zone--dragging" : ""} ${disabled ? "dropzone-multiple__zone--disabled" : ""}`}
					onClick={() => !disabled && fileInputRef.current?.click()}
					onDragOver={onDragOver}
					onDragLeave={onDragLeave}
					onDrop={onDrop}
				>
					<div className="dropzone-multiple__zone-icon">
						<FiUpload />
					</div>
					<p className="dropzone-multiple__zone-text">{placeholder}</p>
					<p className="dropzone-multiple__zone-subtext">PNG, JPG, GIF up to 10MB each</p>
				</div>
			)}

			<input
				type="file"
				ref={fileInputRef}
				accept={accept}
				multiple
				style={{ display: "none" }}
				disabled={disabled}
				onChange={handleFileChange}
				{...props}
			/>

			{error && (
				<span className="dropzone-multiple__error-message">
					{errorMessage || "This field is required."}
				</span>
			)}
		</div>
	);
};

export default DropzoneMultiple;
