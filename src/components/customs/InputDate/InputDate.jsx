import { useState, useEffect, useRef } from "react";
import "./InputDate.css";

// ── Constants ─────────────────────────────────────────────────────────────────

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

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];
const YEARS = Array.from({ length: 201 }, (_, i) => 1900 + i);

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const resolveColor = (color) =>
	PRESET_COLORS.includes(color) ? `var(--color-${color})` : color;

// Format YYYY-MM-DD → MM/DD/YYYY for display
const formatDisplay = (dateStr) => {
	if (!dateStr) return "";
	const [y, m, d] = dateStr.split("-");
	return `${m}/${d}/${y}`;
};

// Parse YYYY-MM-DD → { year, month (0-based), day }
const parseDate = (dateStr) => {
	if (!dateStr) return null;
	const [y, m, d] = dateStr.split("-").map(Number);
	return { year: y, month: m - 1, day: d };
};

// Build YYYY-MM-DD from parts
const buildDateStr = (year, month, day) =>
	`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

// ── CalendarIcon (inline SVG — proprietary) ───────────────────────────────────
const CalendarIcon = () => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
		<line x1="16" y1="2" x2="16" y2="6" />
		<line x1="8" y1="2" x2="8" y2="6" />
		<line x1="3" y1="10" x2="21" y2="10" />
	</svg>
);

const ChevronDownIcon = () => (
	<svg
		width="13"
		height="13"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		aria-hidden="true"
	>
		<polyline points="6 9 12 15 18 9" />
	</svg>
);

const ChevronLeftIcon = () => (
	<svg
		width="15"
		height="15"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		aria-hidden="true"
	>
		<polyline points="15 18 9 12 15 6" />
	</svg>
);

const ChevronRightIcon = () => (
	<svg
		width="15"
		height="15"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		aria-hidden="true"
	>
		<polyline points="9 18 15 12 9 6" />
	</svg>
);

// ── InputDate ─────────────────────────────────────────────────────────────────
// Custom component — calendar date picker.
//
// Props:
//   value        {string}   — Controlled date in YYYY-MM-DD format.
//   onChange     {function} — Callback: (dateStr: string) => void.
//   min          {string}   — Minimum allowed date (YYYY-MM-DD).
//   max          {string}   — Maximum allowed date (YYYY-MM-DD).
//   type         {string}   — Accent color: preset name OR any CSS color string.
//                             Affects border (focused) and selected day circle.
//   label        {string}   — Optional field label.
//   placeholder  {string}   — Text shown when no date is selected.
const InputDate = ({
	value: rawValue = "",
	onChange,
	min,
	max,
	type = "primary",
	label,
	placeholder = "MM/DD/YYYY",
	disabled = false,
}) => {
	// Normalize: strip time portion in case value comes as a full ISO string
	const value = rawValue ? rawValue.toString().slice(0, 10) : "";
	const today = new Date();
	const todayStr = buildDateStr(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);

	const parsed = parseDate(value);
	const accentColor = resolveColor(type);

	const [isOpen, setIsOpen] = useState(false);
	const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
	const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());
	const [showYearSelector, setShowYearSelector] = useState(false);

	const wrapperRef = useRef(null);
	const yearGridRef = useRef(null);

	// Close calendar on outside click
	useEffect(() => {
		const handleOutside = (e) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
				setIsOpen(false);
				setShowYearSelector(false);
			}
		};
		document.addEventListener("mousedown", handleOutside);
		return () => document.removeEventListener("mousedown", handleOutside);
	}, []);

	// Scroll to selected year when year selector opens
	useEffect(() => {
		if (showYearSelector && yearGridRef.current) {
			const selectedBtn = yearGridRef.current.querySelector(
				".input-date__year-btn--selected",
			);
			if (selectedBtn) {
				selectedBtn.scrollIntoView({ block: "center", behavior: "instant" });
			}
		}
	}, [showYearSelector]);

	// Toggle calendar; if opening, navigate view to selected date's month
	const handleToggle = () => {
		if (disabled) return;
		if (!isOpen && parsed) {
			setViewYear(parsed.year);
			setViewMonth(parsed.month);
		}
		setIsOpen((prev) => !prev);
		if (isOpen) setShowYearSelector(false);
	};

	// Day selection
	const handleDayClick = (day) => {
		onChange?.(buildDateStr(viewYear, viewMonth, day));
		setIsOpen(false);
	};

	// Month navigation
	const prevMonth = () => {
		if (viewMonth === 0) {
			setViewMonth(11);
			setViewYear((y) => y - 1);
		} else setViewMonth((m) => m - 1);
	};

	const nextMonth = () => {
		if (viewMonth === 11) {
			setViewMonth(0);
			setViewYear((y) => y + 1);
		} else setViewMonth((m) => m + 1);
	};

	// Day state helpers
	const isDisabled = (day) => {
		const str = buildDateStr(viewYear, viewMonth, day);
		if (min && str < min) return true;
		if (max && str > max) return true;
		return false;
	};

	const isSelected = (day) =>
		!!parsed &&
		parsed.year === viewYear &&
		parsed.month === viewMonth &&
		parsed.day === day;

	const isToday = (day) => buildDateStr(viewYear, viewMonth, day) === todayStr;

	// Build calendar grid cells (null = empty padding cell)
	const daysInMonth = getDaysInMonth(viewYear, viewMonth);
	const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
	const cells = [
		...Array(firstDay).fill(null),
		...Array.from({ length: daysInMonth }, (_, i) => i + 1),
	];

	return (
		<div
			className="input-date"
			ref={wrapperRef}
			style={{ "--input-date-color": accentColor }}
		>
			{/* Label */}
			{label && <label className="input-date__label">{label}</label>}

			{/* Input field trigger */}
			<div
				className={`input-date__field ${isOpen ? "input-date__field--open" : ""} ${disabled ? "input-date__field--disabled" : ""}`}
				onClick={handleToggle}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => e.key === "Enter" && handleToggle()}
				aria-haspopup="dialog"
				aria-expanded={isOpen}
			>
				<span
					className={`input-date__value ${!value ? "input-date__value--placeholder" : ""}`}
				>
					{value ? formatDisplay(value) : placeholder}
				</span>

				<span className="input-date__icon" aria-hidden="true">
					<CalendarIcon />
				</span>
			</div>

			{/* Calendar dropdown */}
			{isOpen && (
				<div
					className="input-date__calendar"
					role="dialog"
					aria-label="Date picker"
				>
					{/* Header: month label + navigation */}
					<div className="input-date__cal-header">
						<button
							type="button"
							className={`input-date__cal-month-label ${showYearSelector ? "input-date__cal-month-label--open" : ""}`}
							onClick={() => setShowYearSelector((p) => !p)}
						>
							{MONTHS[viewMonth]} {viewYear}
							<ChevronDownIcon />
						</button>

						<div className="input-date__cal-nav">
							<button
								className="input-date__cal-nav-btn"
								type="button"
								onClick={prevMonth}
								aria-label="Previous month"
							>
								<ChevronLeftIcon />
							</button>
							<button
								className="input-date__cal-nav-btn"
								type="button"
								onClick={nextMonth}
								aria-label="Next month"
							>
								<ChevronRightIcon />
							</button>
						</div>
					</div>

					{showYearSelector ? (
						<div className="input-date__year-grid" ref={yearGridRef}>
							{YEARS.map((y) => (
								<button
									key={y}
									type="button"
									className={`input-date__year-btn${viewYear === y ? " input-date__year-btn--selected" : ""}`}
									onClick={() => {
										setViewYear(y);
										setShowYearSelector(false);
									}}
									aria-pressed={viewYear === y}
								>
									{y}
								</button>
							))}
						</div>
					) : (
						<>
							{/* Weekday headers */}
							<div className="input-date__cal-weekdays" aria-hidden="true">
								{DAYS_OF_WEEK.map((d, i) => (
									<span key={i} className="input-date__cal-weekday">
										{d}
									</span>
								))}
							</div>

							{/* Day grid */}
							<div className="input-date__cal-grid" role="grid">
								{cells.map((day, i) => {
									if (!day)
										return (
											<span
												key={`pad-${i}`}
												className="input-date__cal-pad"
												aria-hidden="true"
											/>
										);

									const selected = isSelected(day);
									const disabled = isDisabled(day);
									const today = isToday(day) && !selected;

									return (
										<button
											key={day}
											type="button"
											role="gridcell"
											className={[
												"input-date__cal-day",
												selected ? "input-date__cal-day--selected" : "",
												disabled ? "input-date__cal-day--disabled" : "",
												today ? "input-date__cal-day--today" : "",
											]
												.filter(Boolean)
												.join(" ")}
											onClick={() => !disabled && handleDayClick(day)}
											disabled={disabled}
											aria-label={`${MONTHS[viewMonth]} ${day}, ${viewYear}`}
											aria-pressed={selected}
										>
											{day}
										</button>
									);
								})}
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default InputDate;
