import { useState, useEffect, useRef } from "react";
import "./InputTime.css";

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

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 01–12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 00–59
const SECONDS = Array.from({ length: 60 }, (_, i) => i); // 00–59

// ── Helpers ───────────────────────────────────────────────────────────────────

const resolveColor = (color) =>
	PRESET_COLORS.includes(color) ? `var(--color-${color})` : color;

const pad = (n) => String(n).padStart(2, "0");

// Parse "HH:MM:SS" (24h) → { hour (1-12), minute, second, period }
const parse24h = (timeStr) => {
	if (!timeStr) return { hour: 12, minute: 0, second: 0, period: "AM" };
	const [hStr, mStr = "0", sStr = "0"] = timeStr.split(":");
	const h24 = parseInt(hStr, 10);
	return {
		hour: h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24,
		minute: parseInt(mStr, 10),
		second: parseInt(sStr, 10),
		period: h24 >= 12 ? "PM" : "AM",
	};
};

// Build "HH:MM:SS" (24h) from parts
const build24h = (hour12, minute, second, period) => {
	let h24 = hour12;
	if (period === "AM" && hour12 === 12) h24 = 0;
	else if (period === "PM" && hour12 !== 12) h24 = hour12 + 12;
	return `${pad(h24)}:${pad(minute)}:${pad(second)}`;
};

// Format for display: "02:15:30 AM"
const formatDisplay = (timeStr) => {
	if (!timeStr) return "";
	const { hour, minute, second, period } = parse24h(timeStr);
	return `${pad(hour)}:${pad(minute)}:${pad(second)} ${period}`;
};

// ── Inline Icons (proprietary — full style freedom) ───────────────────────────

const ClockIcon = () => (
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
		<circle cx="12" cy="12" r="10" />
		<polyline points="12 6 12 12 16 14" />
	</svg>
);

// ── InputTime ─────────────────────────────────────────────────────────────────
// Custom component — scrollable time picker (12h format + seconds).
//
// Props:
//   value       {string}   — Controlled time in "HH:MM:SS" 24h format.
//   onChange    {function} — Callback: (timeStr: string) => void. Called on OK.
//   type        {string}   — Accent color: preset name OR any CSS color string.
//                            Affects border (open), clock icon, selected items, OK btn.
//   label       {string}   — Optional field label.
//   placeholder {string}   — Text shown when no time is selected.
const InputTime = ({
	value = "",
	onChange,
	type = "primary",
	label,
	placeholder = "HH:MM:SS AM",
	disabled = false,
}) => {
	const accentColor = resolveColor(type);

	// Pull initial parts from value (or defaults)
	const init = () => parse24h(value);

	const [isOpen, setIsOpen] = useState(false);
	const [tempHour, setTempHour] = useState(() => init().hour);
	const [tempMinute, setTempMinute] = useState(() => init().minute);
	const [tempSecond, setTempSecond] = useState(() => init().second);
	const [tempPeriod, setTempPeriod] = useState(() => init().period);

	const wrapperRef = useRef(null);
	const hourColRef = useRef(null);
	const minColRef = useRef(null);
	const secColRef = useRef(null);

	// Close on outside click
	useEffect(() => {
		const handleOutside = (e) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleOutside);
		return () => document.removeEventListener("mousedown", handleOutside);
	}, []);

	// Scroll each column to its selected item whenever the panel opens
	useEffect(() => {
		if (!isOpen) return;
		const scrollTo = (ref) => {
			const el = ref.current?.querySelector(".input-time__col-item--selected");
			el?.scrollIntoView({ block: "center", behavior: "instant" });
		};
		// Wait one tick for the DOM to paint
		const id = setTimeout(() => {
			scrollTo(hourColRef);
			scrollTo(minColRef);
			scrollTo(secColRef);
		}, 0);
		return () => clearTimeout(id);
	}, [isOpen]);

	// Toggle panel; on open, reset temp state to current value
	const handleToggle = () => {
		if (disabled) return;
		if (!isOpen) {
			const parsed = parse24h(value);
			setTempHour(parsed.hour);
			setTempMinute(parsed.minute);
			setTempSecond(parsed.second);
			setTempPeriod(parsed.period);
		}
		setIsOpen((prev) => !prev);
	};

	const handleOk = () => {
		onChange?.(build24h(tempHour, tempMinute, tempSecond, tempPeriod));
		setIsOpen(false);
	};

	const handleCancel = () => setIsOpen(false);

	return (
		<div
			className="input-time"
			ref={wrapperRef}
			style={{ "--input-time-color": accentColor }}
		>
			{/* Label */}
			{label && <label className="input-time__label">{label}</label>}

			{/* Field trigger */}
			<div
				className={`input-time__field ${isOpen ? "input-time__field--open" : ""} ${disabled ? "input-time__field--disabled" : ""}`}
				onClick={handleToggle}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => e.key === "Enter" && handleToggle()}
				aria-haspopup="dialog"
				aria-expanded={isOpen}
			>
				<span
					className={`input-time__value ${!value ? "input-time__value--placeholder" : ""}`}
				>
					{value ? formatDisplay(value) : placeholder}
				</span>
				<span className="input-time__icon" aria-hidden="true">
					<ClockIcon />
				</span>
			</div>

			{/* Dropdown panel */}
			{isOpen && (
				<div
					className="input-time__panel"
					role="dialog"
					aria-label="Time picker"
				>
					{/* Column headers */}
					<div className="input-time__col-headers">
						<span>HH</span>
						<span>MM</span>
						<span>SS</span>
						<span>{/* AM/PM — no header text */}</span>
					</div>

					{/* Scrollable columns */}
					<div className="input-time__columns">
						{/* Hours (01–12) */}
						<div
							className="input-time__col"
							ref={hourColRef}
							aria-label="Hours"
						>
							{HOURS.map((h) => (
								<button
									key={h}
									type="button"
									className={`input-time__col-item${tempHour === h ? " input-time__col-item--selected" : ""}`}
									onClick={() => setTempHour(h)}
									aria-pressed={tempHour === h}
								>
									{pad(h)}
								</button>
							))}
						</div>

						{/* Minutes (00–55 step 5) */}
						<div
							className="input-time__col"
							ref={minColRef}
							aria-label="Minutes"
						>
							{MINUTES.map((m) => (
								<button
									key={m}
									type="button"
									className={`input-time__col-item${tempMinute === m ? " input-time__col-item--selected" : ""}`}
									onClick={() => setTempMinute(m)}
									aria-pressed={tempMinute === m}
								>
									{pad(m)}
								</button>
							))}
						</div>

						{/* Seconds (00–55 step 5) */}
						<div
							className="input-time__col"
							ref={secColRef}
							aria-label="Seconds"
						>
							{SECONDS.map((s) => (
								<button
									key={s}
									type="button"
									className={`input-time__col-item${tempSecond === s ? " input-time__col-item--selected" : ""}`}
									onClick={() => setTempSecond(s)}
									aria-pressed={tempSecond === s}
								>
									{pad(s)}
								</button>
							))}
						</div>

						{/* AM / PM */}
						<div
							className="input-time__col input-time__col--period"
							aria-label="Period"
						>
							{["AM", "PM"].map((p) => (
								<button
									key={p}
									type="button"
									className={`input-time__col-item${tempPeriod === p ? " input-time__col-item--selected" : ""}`}
									onClick={() => setTempPeriod(p)}
									aria-pressed={tempPeriod === p}
								>
									{p}
								</button>
							))}
						</div>
					</div>

					{/* Footer actions */}
					<div className="input-time__footer">
						<button
							type="button"
							className="input-time__btn-cancel"
							onClick={handleCancel}
						>
							CANCEL
						</button>
						<button
							type="button"
							className="input-time__btn-ok"
							onClick={handleOk}
						>
							OK
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default InputTime;
