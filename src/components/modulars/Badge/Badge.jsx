import "./Badge.css";

const Badge = ({
	text = "Badge",
	type = "neutral",
	outline = false,
	icon,
	iconPosition = "start",
	elevation = 0,
}) => {
	return (
		<span
			className={`badge badge--${type}${outline ? " badge--outline" : ""} elevation-${elevation}`}
		>
			{icon && iconPosition === "start" && (
				<span className="badge__icon">{icon}</span>
			)}
			{text}
			{icon && iconPosition === "end" && (
				<span className="badge__icon">{icon}</span>
			)}
		</span>
	);
};

export default Badge;
