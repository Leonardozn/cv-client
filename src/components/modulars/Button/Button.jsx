import "./Button.css";

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

const Button = ({
	text = "Button",
	type = "neutral",
	outline = false,
	onClick,
	icon,
	iconPosition = "start",
	elevation = 0,
	isLoading,
	isSubmitting,
	...props
}) => {
	const isPreset = PRESET_COLORS.includes(type);
	const bgColor = resolveColor(type);
	const typeClass = isPreset ? ` btn--${type}` : " btn--custom";

	return (
		<button
			className={`btn${typeClass}${outline ? " btn--outline" : ""} elevation-${elevation}`}
			style={!isPreset && bgColor ? { "--accent": bgColor } : {}}
			onClick={onClick}
			{...props}
		>
			{icon && iconPosition === "start" && (
				<span className="btn__icon">{icon}</span>
			)}
			{text}
			{icon && iconPosition === "end" && (
				<span className="btn__icon">{icon}</span>
			)}
		</button>
	);
};

export default Button;
