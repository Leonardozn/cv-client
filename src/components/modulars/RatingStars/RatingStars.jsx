import "./RatingStars.css";

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

const StarPolygon = () => (
	<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
);

const Star = ({ fillPercentage, onClick, interactive }) => {
	return (
		<div
			className={`rating-star ${interactive ? "rating-star--interactive" : ""}`}
			onClick={onClick}
		>
			<svg
				className="rating-star__empty"
				viewBox="0 0 24 24"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<StarPolygon />
			</svg>
			<div
				className="rating-star__fill-container"
				style={{ width: `${Math.max(0, Math.min(100, fillPercentage))}%` }}
			>
				<svg
					className="rating-star__filled"
					viewBox="0 0 24 24"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<StarPolygon />
				</svg>
			</div>
		</div>
	);
};

const RatingStars = ({
	value = 0,
	readOnly = false,
	onChange,
	type = "warning",
	precision = 1,
	elevation = 0,
	...props
}) => {
	const isInteractive = !readOnly && typeof onChange === "function";
	const clampedValue = Math.max(0, Math.min(5, value));

	const bgColor = resolveColor(type);

	const stars = Array.from({ length: 5 }, (_, i) => {
		const starIndex = i + 1;
		const diff = clampedValue - starIndex + 1;
		let fillPercentage = 0;

		if (diff >= 1) {
			fillPercentage = 100;
		} else if (diff > 0) {
			fillPercentage = diff * 100;
		}

		return (
			<Star
				key={starIndex}
				fillPercentage={fillPercentage}
				interactive={isInteractive}
				onClick={(e) => {
					if (isInteractive) {
						const rect = e.currentTarget.getBoundingClientRect();
						const x = e.clientX - rect.left;
						const fraction = x / rect.width;

						// starIndex - 1 is the base value of the previous stars.
						// fraction + base is the exact float value clicked
						let newValue = starIndex - 1 + fraction;

						// Round to nearest precision
						// e.g if precision is 0.5, and clicked 2.3 -> 2.5
						// if precision is 1, and clicked 2.3 -> 2.0 (wait, usually clicking anywhere in star 3 makes it 3 if precision is 1)
						// To mimic standard rating behavior:
						// We usually calculate the nearest precision step.
						const inv = 1.0 / precision;
						newValue = Math.ceil(newValue * inv) / inv;

						onChange(Math.max(0, Math.min(5, newValue)));
					}
				}}
			/>
		);
	});

	return (
		<div
			className={`rating-stars ${isInteractive ? "rating-stars--interactive" : ""} elevation-${elevation}`}
			style={{
				...(bgColor ? { "--rating-color-fill": bgColor } : {}),
				...(props.style || {}),
			}}
			{...props}
		>
			{stars}
		</div>
	);
};

export default RatingStars;
