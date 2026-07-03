import "./ProgressBar.css";

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

const ProgressBar = ({
	now,
	min = 0,
	max = 100,
	type = "primary",
	elevation = 0,
	...props
}) => {
	// Validate that 'now' is a number
	const isNumber = typeof now === "number" && !isNaN(now);

	// If it's not a valid number, we don't render anything or render an empty state.
	// The requirement says: "siempre sea un número, de lo contrario no se muestra".
	if (!isNumber) {
		return null;
	}

	// Ensure 'now' is within the min and max bounds
	const clampedNow = Math.max(min, Math.min(max, now));

	// Calculate percentage relative to min and max
	const range = max - min;
	// Prevent division by zero if min === max
	const percentage = range > 0 ? ((clampedNow - min) / range) * 100 : 0;

	const barColor = resolveColor(type);

	return (
		<div
			className={`progress-bar-container elevation-${elevation}`}
			style={{
				...(barColor ? { "--progress-color": barColor } : {}),
				...(props.style || {}),
			}}
			role="progressbar"
			aria-valuenow={clampedNow}
			aria-valuemin={min}
			aria-valuemax={max}
			{...props}
		>
			<div className="progress-bar__fill" style={{ width: `${percentage}%` }}>
				<span className="progress-bar__label">{clampedNow}%</span>
			</div>
		</div>
	);
};

export default ProgressBar;
