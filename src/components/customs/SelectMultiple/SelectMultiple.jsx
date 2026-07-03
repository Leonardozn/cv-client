import { useState, useRef, useEffect } from "react";
import "./SelectMultiple.css";

const EMPTY_ARRAY = [];

const SelectMultiple = ({
	label,
	placeholder = "Select options",
	options = EMPTY_ARRAY,
	type = "neutral",
	onChange,
	value = EMPTY_ARRAY,
	disabled = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState(() =>
		options.filter((o) =>
			Array.isArray(value) ? value.includes(o.id) : false,
		),
	);
	const containerRef = useRef(null);

	useEffect(() => {
		setSelected(
			options.filter((o) =>
				Array.isArray(value) ? value.includes(o.id) : false,
			),
		);
	}, [value, options]);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setIsOpen(false);
				setQuery("");
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleToggle = () => {
		if (disabled) return;
		setIsOpen((prev) => !prev);
		setQuery("");
	};

	const handleClearAll = (e) => {
		e.stopPropagation();
		setSelected([]);
		setIsOpen(false);
		setQuery("");
		onChange?.([]);
	};

	const handleSelect = (option) => {
		const isAlreadySelected = selected.some((item) => item.id === option.id);
		let newSelected;

		if (isAlreadySelected) {
			newSelected = selected.filter((item) => item.id !== option.id);
		} else {
			newSelected = [...selected, option];
		}

		setSelected(newSelected);
		onChange?.(newSelected.map((item) => item.id));
	};

	const handleRemoveItem = (e, optionId) => {
		e.stopPropagation();
		const newSelected = selected.filter((item) => item.id !== optionId);
		setSelected(newSelected);
		onChange?.(newSelected.map((item) => item.id));
	};

	const filtered = options.filter((o) =>
		(o.value || "").toLowerCase().includes(query.toLowerCase()),
	);

	const typeClass = `select-multiple--${type}`;
	const disabledClass = disabled ? "select-multiple--disabled" : "";

	return (
		<div
			className={`select-multiple ${typeClass} ${disabledClass}`}
			ref={containerRef}
		>
			{label && <label className="select-multiple-label">{label}</label>}

			{/* Trigger */}
			<div
				className={`select-multiple-trigger ${isOpen ? "select-multiple-trigger--open" : ""}`}
				onClick={handleToggle}
				tabIndex={disabled ? -1 : 0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						if (e.target !== e.currentTarget) return;
						e.preventDefault();
						handleToggle();
					}
				}}
			>
				<div className="select-multiple-values">
					{selected.length === 0 ? (
						<span className="select-multiple-placeholder">{placeholder}</span>
					) : (
						selected.map((item) => (
							<span key={item.id} className="select-multiple-chip">
								{item.value}
								<button
									type="button"
									className="select-multiple-chip-remove"
									onClick={(e) => {
										if (disabled) return;
										handleRemoveItem(e, item.id);
									}}
								>
									&times;
								</button>
							</span>
						))
					)}
				</div>
				<div className="select-multiple-controls">
					{selected.length > 0 && !disabled && (
						<button
							type="button"
							className="select-multiple-clear"
							onClick={handleClearAll}
							aria-label="Clear all selections"
						>
							&times;
						</button>
					)}
					<span className="select-multiple-chevron" />
				</div>
			</div>

			{/* Dropdown */}
			{isOpen && (
				<div className="select-multiple-dropdown">
					<div className="select-multiple-search">
						<input
							className="select-multiple-search-input"
							type="text"
							placeholder="Search..."
							value={query}
							autoFocus
							onChange={(e) => setQuery(e.target.value)}
							onClick={(e) => e.stopPropagation()}
						/>
					</div>
					<ul className="select-multiple-list">
						{filtered.length > 0 ? (
							filtered.map((option) => {
								const isSelected = selected.some(
									(item) => item.id === option.id,
								);
								return (
									<li
										key={option.id}
										className={`select-multiple-option ${isSelected ? "select-multiple-option--selected" : ""}`}
										onClick={() => handleSelect(option)}
									>
										<div className="select-multiple-option-content">
											<span
												className={`select-multiple-checkbox ${isSelected ? "checked" : ""}`}
											>
												{isSelected && "✓"}
											</span>
											{option.value}
										</div>
									</li>
								);
							})
						) : (
							<li className="select-multiple-option-empty">No results found</li>
						)}
					</ul>
				</div>
			)}
		</div>
	);
};

export default SelectMultiple;
