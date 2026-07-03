import React, { useState, useEffect, useRef } from "react";
import { FiUpload, FiX, FiCheck, FiScissors } from "react-icons/fi";
import "./Dropzone.css";

const Dropzone = ({
	label,
	value,
	onChange,
	accept = "image/*",
	disabled = false,
	error = false,
	errorMessage,
	placeholder = "Click or drag an image to upload",
	apiHost,
	imageHost,
	apiPath,
	...props
}) => {
	const isConfigured = !!(imageHost || (apiHost && apiPath));
	const effectiveDisabled = disabled || !isConfigured;
	const staticHost = isConfigured
		? (imageHost || `${apiHost}${apiPath}`)
		: "";
	const [preview, setPreview] = useState(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isAdjusting, setIsAdjusting] = useState(false);
	const [zoom, setZoom] = useState(1);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isPanning, setIsPanning] = useState(false);
	const [startPan, setStartPan] = useState({ x: 0, y: 0 });
	
	const fileInputRef = useRef(null);
	const imageRef = useRef(null);
	const containerRef = useRef(null);
	const lastCroppedFileRef = useRef(null);


	// Effect to handle preview generation and source tracking
	useEffect(() => {
		// If the incoming value is exactly the one we just produced, 
		// don't update anything to preserve the high-res original in memory.
		if (value && lastCroppedFileRef.current === value) return;

		if (!value) {
			setPreview(null);
			setIsAdjusting(false);
			setPosition({ x: 0, y: 0 });
			setZoom(1);
			return;
		}

		if (value instanceof File || value instanceof Blob) {
			const objectUrl = URL.createObjectURL(value);
			setPreview(objectUrl);
			// We don't reset position/zoom here if it's the same file (though usually it's a new one)
			return () => URL.revokeObjectURL(objectUrl);
		}

		if (typeof value === "string") {
			let url = value.startsWith("http") || value.startsWith("data:") 
				? value 
				: `${staticHost}/${value.replace(/\\/g, "/")}`;
			
			// Add cache buster to remote images to avoid showing stale cached versions
			if (!value.startsWith("data:")) {
				const separator = url.includes("?") ? "&" : "?";
				url = `${url}${separator}t=${new Date().getTime()}`;
			}

			setPreview(url);
		}
	}, [value]);

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			lastCroppedFileRef.current = null; // New file, reset tracker
			onChange(file);
			setIsAdjusting(true);
			setZoom(1);
			setPosition({ x: 0, y: 0 });
		}
	};

	const onDragOver = (e) => {
		e.preventDefault();
		if (!effectiveDisabled && !isAdjusting) setIsDragging(true);
	};

	const onDragLeave = () => {
		setIsDragging(false);
	};

	const onDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		if (effectiveDisabled || isAdjusting) return;

		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith("image/")) {
			lastCroppedFileRef.current = null;
			onChange(file);
			setIsAdjusting(true);
			setZoom(1);
			setPosition({ x: 0, y: 0 });
		}
	};

	const handleClear = (e) => {
		e.stopPropagation();
		if (effectiveDisabled) return;
		lastCroppedFileRef.current = null;
		onChange(undefined);
		setIsAdjusting(false);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleMouseDown = (e) => {
		if (!isAdjusting || effectiveDisabled) return;
		e.preventDefault();
		setIsPanning(true);
		setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
	};

	const handleMouseMove = (e) => {
		if (!isPanning || effectiveDisabled) return;
		setPosition({
			x: e.clientX - startPan.x,
			y: e.clientY - startPan.y,
		});
	};

	const handleMouseUp = () => {
		setIsPanning(false);
	};

	const handleCrop = async (e) => {
		e.stopPropagation();
		if (!imageRef.current || !containerRef.current) return;

		const canvas = document.createElement("canvas");
		const container = containerRef.current;
		const img = imageRef.current;
		
		// 500x500 is a good resolution for logos/profile pics
		const size = 500; 
		canvas.width = size;
		canvas.height = size;
		
		const ctx = canvas.getContext("2d");
		
		// Get bounding rectangles
		const rect = container.getBoundingClientRect();
		const imgRect = img.getBoundingClientRect();
		
		// Calculate scale ratio between canvas and container UI
		const ratio = size / rect.width;
		
		// Fill background with white (prevents black empty spaces when saving as JPEG)
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, size, size);
		
		// We need to draw the image exactly as it's positioned in the UI
		// but scaled to the canvas resolution
		const drawX = (imgRect.left - rect.left) * ratio;
		const drawY = (imgRect.top - rect.top) * ratio;
		const drawWidth = imgRect.width * ratio;
		const drawHeight = imgRect.height * ratio;
		
		ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
		
		canvas.toBlob((blob) => {
			const croppedFile = new File([blob], "cropped_image.jpg", { type: "image/jpeg" });
			
			// Mark this specific file instance as our internal crop
			lastCroppedFileRef.current = croppedFile;
			
			onChange(croppedFile);
			setIsAdjusting(false);
		}, "image/jpeg", 0.95);
	};

	return (
		<div className={`dropzone-container ${error ? "dropzone--error" : ""}`}>
			{label && <label className="dropzone-label">{label}</label>}
			
			<div
				ref={containerRef}
				className={`dropzone ${isDragging ? "dropzone--dragging" : ""} ${effectiveDisabled ? "dropzone--disabled" : ""} ${preview ? "dropzone--has-image" : ""} ${isAdjusting ? "dropzone--adjusting" : ""}`}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onDrop={onDrop}
				onClick={() => !effectiveDisabled && !isAdjusting && !preview && fileInputRef.current?.click()}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
			>
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					accept={accept}
					style={{ display: "none" }}
					disabled={effectiveDisabled}
					{...props}
				/>

				{preview ? (
					<div className="dropzone__preview" onMouseDown={handleMouseDown}>
						<img 
							ref={imageRef}
							src={preview} 
							alt="Preview" 
							className="dropzone__image" 
							style={{
								transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
								cursor: isAdjusting ? (isPanning ? 'grabbing' : 'grab') : 'default',
								transition: isPanning ? 'none' : 'transform 0.1s ease-out'
							}}
							draggable={false}
							crossOrigin="anonymous"
						/>
						
						<div className="dropzone__overlay-actions">
							{!effectiveDisabled && !isAdjusting && (
								<>
									<button
										type="button"
										className="dropzone__action-btn dropzone__action-btn--edit"
										onClick={(e) => { e.stopPropagation(); setIsAdjusting(true); }}
										title="Adjust image"
									>
										<FiScissors />
									</button>
									<button
										type="button"
										className="dropzone__action-btn dropzone__action-btn--clear"
										onClick={handleClear}
										title="Remove image"
									>
										<FiX />
									</button>
								</>
							)}
							
							{isAdjusting && (
								<button
									type="button"
									className="dropzone__action-btn dropzone__action-btn--save"
									onClick={handleCrop}
									title="Apply adjustment"
								>
									<FiCheck />
								</button>
							)}
						</div>
					</div>
				) : (
					<div className="dropzone__content">
						<div className="dropzone__icon">
							<FiUpload />
						</div>
						<p className="dropzone__text">
							{isConfigured ? placeholder : "Image field not configured"}
						</p>
						{isConfigured && <p className="dropzone__subtext">PNG, JPG, GIF up to 10MB</p>}
					</div>
				)}
			</div>

			{isAdjusting && (
				<div className="dropzone__controls">
					<span className="dropzone__zoom-label">Zoom</span>
					<input 
						type="range" 
						min="1" 
						max="3" 
						step="0.01" 
						value={zoom} 
						onChange={(e) => setZoom(parseFloat(e.target.value))}
						className="dropzone__zoom-slider"
					/>
				</div>
			)}

			{error && errorMessage && (
				<span className="dropzone-error-message">{errorMessage}</span>
			)}
		</div>
	);
};

export default Dropzone;
