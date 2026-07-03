import {
	AiFillInfoCircle,
	AiFillCheckCircle,
	AiFillWarning,
	AiFillCloseCircle,
} from "react-icons/ai";
import "./Alert.css";

const ALERT_CONFIG = {
	info: {
		icon: <AiFillInfoCircle size={20} />,
	},
	success: {
		icon: <AiFillCheckCircle size={20} />,
	},
	warning: {
		icon: <AiFillWarning size={20} />,
	},
	error: {
		icon: <AiFillCloseCircle size={20} />,
	},
};

const Alert = ({ text = "Alert message", type = "info", elevation = 0 }) => {
	const config = ALERT_CONFIG[type] ?? ALERT_CONFIG.info;

	return (
		<div className={`alert alert--${type} elevation-${elevation}`} role="alert">
			<span className="alert-icon">{config.icon}</span>
			<span className="alert-text">{text}</span>
		</div>
	);
};

export default Alert;
