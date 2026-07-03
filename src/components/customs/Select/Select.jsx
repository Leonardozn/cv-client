import { useState, useRef, useEffect } from "react";
import "./Select.css";

const EMPTY_ARRAY = [];

const Select = ({
	label,
	placeholder = "Select an option",
	options = EMPTY_ARRAY,
	type = "neutral",
	onChange,
	value,
	disabled = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState(
		() => options.find((o) => o.id === value) || null,
	);
	const containerRef = useRef(null);

	useEffect(() => {
		setSelected(options.find((o) => o.id === value) || null);
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
		setSelected(option);
		setIsOpen(false);
		setQuery("");
		onChange?.(option.id);
	};

	const filtered = options.filter((o) =>
		(o.value || "").toLowerCase().includes(query.toLowerCase()),
	);

	const typeClass = `select--${type}`;
	const disabledClass = disabled ? "select--disabled" : "";

	return (
		<div className={`select ${typeClass} ${disabledClass}`} ref={containerRef}>
			{label && <label className="select-label">{label}</label>}

			{/* Trigger */}
			<div
				className={`select-trigger ${isOpen ? "select-trigger--open" : ""}`}
				onClick={handleToggle}
				tabIndex={disabled ? -1 : 0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleToggle();
					}
				}}
			>
				<span
					className={`select-value ${!selected ? "select-value--placeholder" : ""}`}
				>
					{selected ? selected.value : placeholder}
				</span>
				<div className="select-controls">
					{selected && !disabled && (
						<button
							type="button"
							className="select-clear"
							onClick={handleClearAll}
							aria-label="Clear selection"
						>
							&times;
						</button>
					)}
					<span className="select-chevron" />
				</div>
			</div>

			{/* Dropdown */}
			{isOpen && (
				<div className="select-dropdown">
					<div className="select-search">
						<input
							className="select-search-input"
							type="text"
							placeholder="Search..."
							value={query}
							autoFocus
							onChange={(e) => setQuery(e.target.value)}
							onClick={(e) => e.stopPropagation()}
						/>
					</div>
					<ul className="select-list">
						{filtered.length > 0 ? (
							filtered.map((option) => (
								<li
									key={option.id}
									className={`select-option ${selected?.id === option.id ? "select-option--selected" : ""}`}
									onClick={() => handleSelect(option)}
								>
									{option.value}
								</li>
							))
						) : (
							<li className="select-option-empty">No results found</li>
						)}
					</ul>
				</div>
			)}
		</div>
	);
};

export default Select;
