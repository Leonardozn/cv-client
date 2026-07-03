import { useState } from "react";
import "./ButtonGroup.css";

const ButtonGroup = ({
	buttons = [],
	type = "neutral",
	outline = false,
	onClick,
	elevation = 0,
}) => {
	const [activeIndex, setActiveIndex] = useState(0);

	const handleClick = (text, index) => {
		setActiveIndex(index);
		onClick?.(text, index);
	};

	return (
		<div
			className={`btn-group btn-group--${type} elevation-${elevation}`}
			role="group"
		>
			{buttons.map((text, index) => {
				const isActive = index === activeIndex;
				const stateClass = isActive
					? "btn-group-item--active"
					: outline
						? "btn-group-item--outline"
						: "btn-group-item--inactive";

				return (
					<button
						key={index}
						className={`btn-group-item ${stateClass}`}
						onClick={() => handleClick(text, index)}
					>
						{text}
					</button>
				);
			})}
		</div>
	);
};

export default ButtonGroup;
