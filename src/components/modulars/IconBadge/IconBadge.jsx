import "./IconBadge.css";

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

const IconBadge = ({
	icon,
	count = 0,
	max = 99,
	dot = false,
	type = "error", // Default to red/error for notifications
	elevation = 0,
	...props
}) => {
	if (!icon) return null;

	// Render constraints
	const displayCount = count > max ? `${max}+` : count;

	// Decide if badge should be visible at all
	// - If it's a dot, it just shows it
	// - If it's a count, it must be > 0
	const isVisible = dot || count > 0;

	return (
		<div className={`icon-badge elevation-${elevation}`} {...props}>
			{icon}

			{isVisible && (
				<span
					className={`icon-badge__bubble ${dot ? "icon-badge__bubble--dot" : ""}`}
					style={resolveColor(type) ? { "--badge-bg": resolveColor(type) } : {}}
				>
					{/* We only render the text if dot is false */}
					{!dot && displayCount}
				</span>
			)}
		</div>
	);
};

export default IconBadge;
