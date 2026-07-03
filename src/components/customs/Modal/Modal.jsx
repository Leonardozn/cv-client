import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import ActionButton from "../../modulars/ActionButton/ActionButton";
import { AiOutlineClose } from "react-icons/ai";
import "./Modal.css";

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

const Modal = ({
	isOpen = false,
	onClose,
	title,
	children,
	footer,
	size = "md", // sm, md, lg, xl
	type = "neutral",
	elevation = 24,
	closeOnOverlayClick = true,
	...props
}) => {
	const modalRef = useRef(null);
	const themeColor = resolveColor(type);

	// Handle escape key to close
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape" && isOpen && onClose) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			// Prevent body scrolling when modal is open
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const handleOverlayClick = (e) => {
		if (closeOnOverlayClick && e.target === e.currentTarget && onClose) {
			onClose();
		}
	};

	return ReactDOM.createPortal(
		<div
			className="modal-overlay"
			onMouseDown={handleOverlayClick}
			role="dialog"
			aria-modal="true"
		>
			<div
				ref={modalRef}
				className={`modal modal--${size} elevation-${elevation}`}
				style={{
					...(themeColor ? { "--modal-theme-color": themeColor } : {}),
					...(props.style || {}),
				}}
				{...props}
			>
				{(title || onClose) && (
					<div className="modal__header">
						{title && <h3 className="modal__title">{title}</h3>}
						{onClose && (
							<ActionButton
								className="modal__close-btn"
								icon={<AiOutlineClose size={20} />}
								type="transparent"
								onClick={onClose}
								elevation={0}
								aria-label="Close modal"
							/>
						)}
					</div>
				)}

				<div className="modal__body">{children}</div>

				{footer && <div className="modal__footer">{footer}</div>}
			</div>
		</div>,
		document.body,
	);
};

export default Modal;
