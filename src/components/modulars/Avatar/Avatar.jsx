import { useState } from "react";
import "./Avatar.css";

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

// Helper to extract up to 2 initials from a text string
const getInitials = (text) => {
	if (!text) return "";
	const parts = text.trim().split(/\s+/);
	if (parts.length === 1) return parts[0].substring(0, 2);
	return parts[0][0] + parts[1][0];
};

const Avatar = ({
	text,
	imageUrl,
	type = "neutral",
	size = "md",
	elevation = 0,
	...props
}) => {
	const [imageError, setImageError] = useState(false);

	const initials = getInitials(text);
	const showImage = imageUrl && !imageError;
	const bgColor = resolveColor(type);

	return (
		<div
			className={`avatar avatar--${size} elevation-${elevation}`}
			style={bgColor ? { "--avatar-bg": bgColor } : {}}
			title={text}
			role={showImage ? "img" : "text"}
			aria-label={text}
			{...props}
		>
			{showImage ? (
				<img
					src={imageUrl}
					alt={text || "Avatar"}
					className="avatar__image"
					onError={() => setImageError(true)}
				/>
			) : (
				initials
			)}
		</div>
	);
};

export default Avatar;
