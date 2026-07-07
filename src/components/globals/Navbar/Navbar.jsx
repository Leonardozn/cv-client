import { AiOutlineMenu } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { useLogoutController } from "../../../config/controllers/useLogoutController";
import "./Navbar.css";

const Navbar = ({ isOpen, toggleSidebar }) => {
	const { isSubmitting, actions } = useLogoutController();

	return (
		<header className="navbar">
			<div className="navbar-toolbar">
				<h1 className="navbar-title">Application</h1>
			</div>
			<button
				className="icon-button navbar-logout"
				onClick={actions.handleLogout}
				disabled={isSubmitting}
				aria-label="Log out"
				title="Log out"
			>
				<FiLogOut />
			</button>
		</header>
	);
};

export default Navbar;
