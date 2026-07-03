import { useState } from "react";
import "./Radios.css";

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

const Radios = ({
	options = [],
	type = "primary",
	name = "radio-group",
	defaultValue,
	onChange,
}) => {
	const [selected, setSelected] = useState(defaultValue ?? null);

	const handleChange = (value) => {
		setSelected(value);
		onChange?.(value);
	};

	return (
		<div className="radios" style={{ "--accent": resolveColor(type) }}>
			{options.map((option, index) => (
				<label key={index} className="radio">
					<input
						className="radio-input"
						type="radio"
						name={name}
						value={option}
						checked={selected === option}
						onChange={() => handleChange(option)}
					/>
					<span className="radio-custom" />
					<span className="radio-label">{option}</span>
				</label>
			))}
		</div>
	);
};

export default Radios;
