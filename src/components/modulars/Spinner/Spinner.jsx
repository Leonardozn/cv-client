import "./Spinner.css";

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

const Spinner = ({ type = "primary", ...props }) => {
	const spinnerColor = resolveColor(type);

	return (
		<div
			className="spinner"
			style={{
				...(spinnerColor ? { "--spinner-color": spinnerColor } : {}),
				...(props.style || {}),
			}}
			role="status"
			aria-label="Loading"
			{...props}
		/>
	);
};

export default Spinner;
