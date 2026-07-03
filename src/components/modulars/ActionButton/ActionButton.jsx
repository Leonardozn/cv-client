import "./ActionButton.css";

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

const ActionButton = ({
	icon,
	type = "primary",
	onClick,
	elevation = 0,
	className = "",
	style = {},
	outline = false,
	...props
}) => {
	// We resolve the color whether it's a theme preset ("primary") or a direct hex ("#8b5cf6")
	const bgColor = resolveColor(type);

	return (
		<button
			type="button"
			className={`action-btn elevation-${elevation} ${outline ? "outline" : ""} ${className}`.replace(/\s+/g, ' ').trim()}
			onClick={onClick}
			style={{
				...(bgColor ? { "--action-btn-bg": bgColor } : {}),
				...style,
			}}
			{...props}
		>
			{icon}
		</button>
	);
};

export default ActionButton;
