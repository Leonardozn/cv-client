import "./Sheet.css";

/**
 * Sheet (Paper/Figure) Component
 * A blank container to group elements together. Mimics Material UI's Paper or Bootstrap's Figure.
 * Provides configurable elevation, padding, border radius, and background color.
 */
const Sheet = ({
	children,
	elevation = 1,
	padding = "1.5rem",
	borderRadius = "8px",
	bgColor = "var(--color-bg, #ffffff)",
	className = "",
	style = {},
	...props
}) => {
	return (
		<div
			className={`sheet elevation-${elevation} ${className}`.trim()}
			style={{
				padding,
				borderRadius,
				backgroundColor: bgColor,
				...style,
			}}
			{...props}
		>
			{children}
		</div>
	);
};

export default Sheet;
