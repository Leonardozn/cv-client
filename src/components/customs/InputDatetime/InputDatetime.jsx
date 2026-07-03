import { useState, useEffect, useRef } from "react";
import "./InputDatetime.css";

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
const YEARS = Array.from({ length: 201 }, (_, i) => 1900 + i);

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const SECONDS = Array.from({ length: 60 }, (_, i) => i);

// ── Helpers ───────────────────────────────────────────────────────────────────

const resolveColor = (c) =>
	PRESET_COLORS.includes(c) ? `var(--color-${c})` : c;

const pad = (n) => String(n).padStart(2, "0");

const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

const buildDateStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

// Parse "YYYY-MM-DD" → { year, month (0-based), day } | null
const parseDate = (s) => {
	if (!s) return null;
	const [y, m, d] = s.split("-").map(Number);
	return { year: y, month: m - 1, day: d };
};

// Parse "HH:MM:SS" 24h → { hour (1-12), minute, second, period }
const parse24h = (s) => {
	if (!s) return { hour: 12, minute: 0, second: 0, period: "AM" };
	const [h = "0", m = "0", sec = "0"] = s.split(":");
	const h24 = parseInt(h, 10);
	return {
		hour: h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24,
		minute: parseInt(m, 10),
		second: parseInt(sec, 10),
		period: h24 >= 12 ? "PM" : "AM",
	};
};

// Build "HH:MM:SS" 24h from parts
const build24h = (h12, min, sec, period) => {
	let h24 = h12;
	if (period === "AM" && h12 === 12) h24 = 0;
	else if (period === "PM" && h12 !== 12) h24 = h12 + 12;
	return `${pad(h24)}:${pad(min)}:${pad(sec)}`;
};

// Split "YYYY-MM-DD HH:MM:SS" into its two parts
const splitDatetime = (s) => {
	if (!s) return { datePart: "", timePart: "" };
	const isT = s.includes("T");
	const idx = isT ? s.indexOf("T") : s.indexOf(" ");
	if (idx === -1) return { datePart: s, timePart: "" };

	const datePart = s.slice(0, idx);
	let timePart = s.slice(idx + 1);

	// Remove any decimal/millisecond or timezone suffix for pure time parsing
	if (timePart.includes(".")) timePart = timePart.split(".")[0];
	else if (timePart.includes("Z")) timePart = timePart.split("Z")[0];

	return { datePart, timePart };
};

// Format for field display: "04/17/2022 03:30:00 PM"
const formatDisplay = (datetimeStr) => {
	if (!datetimeStr) return "";
	const { datePart, timePart } = splitDatetime(datetimeStr);
	const d = parseDate(datePart);
	const t = parse24h(timePart);
	if (!d) return "";
	return `${pad(d.month + 1)}/${pad(d.day)}/${d.year} ${pad(t.hour)}:${pad(t.minute)}:${pad(t.second)} ${t.period}`;
};

// ── Inline icons (proprietary — full style freedom) ───────────────────────────

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

const ChevronDown = () => (
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
const ChevronLeft = () => (
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
const ChevronRight = () => (
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

// ── InputDatetime ─────────────────────────────────────────────────────────────
// Custom component — combined date + time picker in one integrated panel.
//
// Props:
//   value       {string}   — Controlled value: "YYYY-MM-DD HH:MM:SS" (24h).
//   onChange    {function} — Callback: (datetimeStr: string) => void. Called on OK.
//   min         {string}   — Minimum date (YYYY-MM-DD).
//   max         {string}   — Maximum date (YYYY-MM-DD).
//   type        {string}   — Accent color: preset name OR any CSS color string.
//   label       {string}   — Optional field label.
//   placeholder {string}   — Text shown when no value is selected.
const InputDatetime = ({
	value = "",
	onChange,
	min,
	max,
	type = "primary",
	label,
	placeholder = "MM/DD/YYYY HH:MM:SS AM",
	disabled = false,
}) => {
	const accentColor = resolveColor(type);
	const today = new Date();
	const todayStr = buildDateStr(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);

	// Derive initial state from value
	const deriveState = () => {
		const { datePart, timePart } = splitDatetime(value);
		const d = parseDate(datePart);
		const t = parse24h(timePart);
		return {
			dateStr: datePart || "",
			viewYear: d?.year ?? today.getFullYear(),
			viewMonth: d?.month ?? today.getMonth(),
			hour: t.hour,
			minute: t.minute,
			second: t.second,
			period: t.period,
		};
	};

	const [isOpen, setIsOpen] = useState(false);
	const [tempDate, setTempDate] = useState(() => deriveState().dateStr);
	const [viewYear, setViewYear] = useState(() => deriveState().viewYear);
	const [viewMonth, setViewMonth] = useState(() => deriveState().viewMonth);
	const [tempHour, setTempHour] = useState(() => deriveState().hour);
	const [tempMinute, setTempMinute] = useState(() => deriveState().minute);
	const [tempSecond, setTempSecond] = useState(() => deriveState().second);
	const [tempPeriod, setTempPeriod] = useState(() => deriveState().period);
	const [showYearSelector, setShowYearSelector] = useState(false);

	const wrapperRef = useRef(null);
	const yearGridRef = useRef(null);
	const hourColRef = useRef(null);
	const minColRef = useRef(null);
	const secColRef = useRef(null);

	// Close on outside click
	useEffect(() => {
		const handler = (e) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
				setIsOpen(false);
				setShowYearSelector(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	// Auto-scroll year selector to selected year on open
	useEffect(() => {
		if (showYearSelector && yearGridRef.current) {
			const selectedBtn = yearGridRef.current.querySelector(
				".idt__year-btn--selected",
			);
			if (selectedBtn) {
				selectedBtn.scrollIntoView({ block: "center", behavior: "instant" });
			}
		}
	}, [showYearSelector]);

	// Auto-scroll time columns to selected item on open
	useEffect(() => {
		if (!isOpen) return;
		const scrollTo = (ref) => {
			ref.current
				?.querySelector(".idt__col-item--selected")
				?.scrollIntoView({ block: "center", behavior: "instant" });
		};
		const id = setTimeout(() => {
			scrollTo(hourColRef);
			scrollTo(minColRef);
			scrollTo(secColRef);
		}, 0);
		return () => clearTimeout(id);
	}, [isOpen]);

	// Toggle — reset temp state to current value on open
	const handleToggle = () => {
		if (disabled) return;
		if (!isOpen) {
			const s = deriveState();
			setTempDate(s.dateStr);
			setViewYear(s.viewYear);
			setViewMonth(s.viewMonth);
			setTempHour(s.hour);
			setTempMinute(s.minute);
			setTempSecond(s.second);
			setTempPeriod(s.period);
		}
		setIsOpen((p) => !p);
		if (isOpen) setShowYearSelector(false);
	};

	const handleOk = () => {
		if (tempDate) {
			onChange?.(
				`${tempDate}T${build24h(tempHour, tempMinute, tempSecond, tempPeriod)}.000Z`,
			);
		}
		setIsOpen(false);
	};

	const handleCancel = () => setIsOpen(false);

	// Calendar state helpers
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

	const isDayDisabled = (day) => {
		const s = buildDateStr(viewYear, viewMonth, day);
		return (min && s < min) || (max && s > max);
	};

	const isDaySelected = (day) => {
		const d = parseDate(tempDate);
		return !!d && d.year === viewYear && d.month === viewMonth && d.day === day;
	};

	const isDayToday = (day) =>
		buildDateStr(viewYear, viewMonth, day) === todayStr;

	// Calendar cells array (null = empty padding)
	const cells = [
		...Array(getFirstDayOfMonth(viewYear, viewMonth)).fill(null),
		...Array.from(
			{ length: getDaysInMonth(viewYear, viewMonth) },
			(_, i) => i + 1,
		),
	];

	return (
		<div
			className="input-datetime"
			ref={wrapperRef}
			style={{ "--idt-color": accentColor }}
		>
			{label && <label className="idt__label">{label}</label>}

			{/* ── Field trigger ── */}
			<div
				className={`idt__field ${isOpen ? "idt__field--open" : ""} ${disabled ? "idt__field--disabled" : ""}`}
				onClick={handleToggle}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => e.key === "Enter" && handleToggle()}
				aria-haspopup="dialog"
				aria-expanded={isOpen}
			>
				<span
					className={`idt__value ${!value ? "idt__value--placeholder" : ""}`}
				>
					{value ? formatDisplay(value) : placeholder}
				</span>
				<span className="idt__icon" aria-hidden="true">
					<CalendarIcon />
				</span>
			</div>

			{/* ── Panel ── */}
			{isOpen && (
				<div
					className="idt__panel"
					role="dialog"
					aria-label="Date and time picker"
				>
					<div className="idt__panel-body">
						{/* ──────────── LEFT: Calendar ──────────── */}
						<div className="idt__calendar">
							{/* Header */}
							<div className="idt__cal-header">
								<button
									type="button"
									className={`idt__cal-month-label ${showYearSelector ? "idt__cal-month-label--open" : ""}`}
									onClick={() => setShowYearSelector((p) => !p)}
								>
									{MONTHS[viewMonth]} {viewYear}
									<ChevronDown />
								</button>
								<div className="idt__cal-nav">
									<button
										type="button"
										className="idt__cal-nav-btn"
										onClick={prevMonth}
										aria-label="Previous month"
									>
										<ChevronLeft />
									</button>
									<button
										type="button"
										className="idt__cal-nav-btn"
										onClick={nextMonth}
										aria-label="Next month"
									>
										<ChevronRight />
									</button>
								</div>
							</div>

							{showYearSelector ? (
								<div className="idt__year-grid" ref={yearGridRef}>
									{YEARS.map((y) => (
										<button
											key={y}
											type="button"
											className={`idt__year-btn${viewYear === y ? " idt__year-btn--selected" : ""}`}
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
									{/* Weekday labels */}
									<div className="idt__cal-weekdays" aria-hidden="true">
										{DAYS_OF_WEEK.map((d, i) => (
											<span key={i} className="idt__cal-weekday">
												{d}
											</span>
										))}
									</div>

									{/* Day grid */}
									<div className="idt__cal-grid" role="grid">
										{cells.map((day, i) => {
											if (!day)
												return (
													<span
														key={`pad-${i}`}
														className="idt__cal-pad"
														aria-hidden="true"
													/>
												);
											const selected = isDaySelected(day);
											const disabled = isDayDisabled(day);
											const isToday = isDayToday(day) && !selected;
											return (
												<button
													key={day}
													type="button"
													role="gridcell"
													className={[
														"idt__cal-day",
														selected ? "idt__cal-day--selected" : "",
														disabled ? "idt__cal-day--disabled" : "",
														isToday ? "idt__cal-day--today" : "",
													]
														.filter(Boolean)
														.join(" ")}
													onClick={() =>
														!disabled &&
														setTempDate(buildDateStr(viewYear, viewMonth, day))
													}
													disabled={disabled}
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

						{/* ──────────── DIVIDER ──────────── */}
						<div className="idt__divider" aria-hidden="true" />

						{/* ──────────── RIGHT: Time columns ──────────── */}
						<div className="idt__time">
							{/* Column headers */}
							<div className="idt__col-headers">
								<span>HH</span>
								<span>MM</span>
								<span>SS</span>
								<span>{/* AM/PM */}</span>
							</div>

							<div className="idt__columns">
								{/* Hours */}
								<div className="idt__col" ref={hourColRef} aria-label="Hours">
									{HOURS.map((h) => (
										<button
											key={h}
											type="button"
											className={`idt__col-item${tempHour === h ? " idt__col-item--selected" : ""}`}
											onClick={() => setTempHour(h)}
											aria-pressed={tempHour === h}
										>
											{pad(h)}
										</button>
									))}
								</div>

								{/* Minutes */}
								<div className="idt__col" ref={minColRef} aria-label="Minutes">
									{MINUTES.map((m) => (
										<button
											key={m}
											type="button"
											className={`idt__col-item${tempMinute === m ? " idt__col-item--selected" : ""}`}
											onClick={() => setTempMinute(m)}
											aria-pressed={tempMinute === m}
										>
											{pad(m)}
										</button>
									))}
								</div>

								{/* Seconds */}
								<div className="idt__col" ref={secColRef} aria-label="Seconds">
									{SECONDS.map((s) => (
										<button
											key={s}
											type="button"
											className={`idt__col-item${tempSecond === s ? " idt__col-item--selected" : ""}`}
											onClick={() => setTempSecond(s)}
											aria-pressed={tempSecond === s}
										>
											{pad(s)}
										</button>
									))}
								</div>

								{/* AM/PM */}
								<div className="idt__col idt__col--period" aria-label="Period">
									{["AM", "PM"].map((p) => (
										<button
											key={p}
											type="button"
											className={`idt__col-item${tempPeriod === p ? " idt__col-item--selected" : ""}`}
											onClick={() => setTempPeriod(p)}
											aria-pressed={tempPeriod === p}
										>
											{p}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* ── Footer ── */}
					<div className="idt__footer">
						<button
							type="button"
							className="idt__btn-cancel"
							onClick={handleCancel}
						>
							CANCEL
						</button>
						<button type="button" className="idt__btn-ok" onClick={handleOk}>
							OK
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default InputDatetime;
