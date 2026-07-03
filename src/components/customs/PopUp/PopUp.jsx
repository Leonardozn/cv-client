import { useState, useEffect } from "react";
import {
	AiFillInfoCircle,
	AiFillCheckCircle,
	AiFillWarning,
	AiFillCloseCircle,
	AiOutlineClose,
} from "react-icons/ai";
import ActionButton from "../../modulars/ActionButton/ActionButton";
import "./PopUp.css";

const ALERT_CONFIG = {
	info: { icon: <AiFillInfoCircle size={24} /> },
	success: { icon: <AiFillCheckCircle size={24} /> },
	warning: { icon: <AiFillWarning size={24} /> },
	error: { icon: <AiFillCloseCircle size={24} /> },
};

/**
 * PopUp Component
 * Behaves like Alert but floats over the screen with entry/exit animations from edges.
 */
const PopUp = ({
	isOpen = false,
	onClose,
	text = "PopUp message",
	type = "info",
	orientation = "bottom-left", // "top-left", "top-right", "bottom-left", "bottom-right"
	elevation = 16,
	duration, // optional auto-close in ms
}) => {
	const [render, setRender] = useState(isOpen);
	const [closing, setClosing] = useState(false);

	useEffect(() => {
		let timeoutId;

		if (isOpen) {
			setRender(true);
			setClosing(false);

			// Auto-close if duration is defined
			if (duration && duration > 0) {
				timeoutId = setTimeout(() => {
					if (onClose) onClose();
				}, duration);
			}
		} else if (render) {
			setClosing(true);
			// Wait for CSS animation to finish before unmounting
			timeoutId = setTimeout(() => {
				setRender(false);
				setClosing(false);
			}, 300);
		}

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [isOpen, render, duration, onClose]);

	if (!render) return null;

	const config = ALERT_CONFIG[type] ?? ALERT_CONFIG.info;

	return (
		<div
			className={`popup popup--${type} popup--${orientation} ${
				closing ? "popup--closing" : ""
			} elevation-${elevation}`}
			role="alert"
		>
			<span className="popup-icon">{config.icon}</span>
			<span className="popup-text">{text}</span>
			<ActionButton
				className="popup-close-btn"
				icon={<AiOutlineClose size={20} />}
				type="transparent"
				onClick={() => {
					if (onClose) onClose();
				}}
				elevation={0}
				aria-label="Close PopUp"
			/>
		</div>
	);
};

export default PopUp;
