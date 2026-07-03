import "./Range.css";

const Range = ({
	label,
	type = "primary",
	min = 0,
	max = 100,
	step = 1,
	elevation = 0,
	...props
}) => {
	return (
		<div className={`range range--${type} elevation-${elevation}`}>
			{label && <label className="range-label">{label}</label>}
			<input
				className="range-field"
				type="range"
				min={min}
				max={max}
				step={step}
				{...props}
			/>
		</div>
	);
};

export default Range;
