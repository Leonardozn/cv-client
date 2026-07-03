import "./Switch.css";

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

const Switch = ({
	checked = false,
	onChange,
	disabled = false,
	type = "primary",
	defaultChecked,
	...props
}) => {
	const accentColor = resolveColor(type);

	return (
		<label
			className={`switch ${checked ? "switch--checked" : ""} ${disabled ? "switch--disabled" : ""}`}
			style={{
				...(accentColor ? { "--switch-accent": accentColor } : {}),
				...(props.style || {}),
			}}
		>
			<input
				type="checkbox"
				className="switch__input"
				checked={checked}
				onChange={(e) => {
					if (!disabled && onChange) {
						onChange(e.target.checked);
					}
				}}
				disabled={disabled}
				{...props}
			/>
			<div className="switch__track"></div>
			<div className="switch__thumb"></div>
		</label>
	);
};

export default Switch;
