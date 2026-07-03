import "./CheckBox.css";

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

const CheckBox = ({ label, type = "primary", elevation = 0, ...props }) => {
	return (
		<label
			className={`checkbox elevation-${elevation}`}
			style={{ "--accent": resolveColor(type) }}
		>
			<input className="checkbox-input" type="checkbox" {...props} />
			<span className="checkbox-custom" />
			{label && <span className="checkbox-label">{label}</span>}
		</label>
	);
};

export default CheckBox;
