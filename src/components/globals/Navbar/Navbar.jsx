import { AiOutlineMenu } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import Modal from "../../customs/Modal/Modal";
import Button from "../../modulars/Button/Button";
import { useLogoutController } from "../../../config/controllers/useLogoutController";
import "./Navbar.css";

const Navbar = ({ isOpen, toggleSidebar }) => {
	const { isSubmitting, isConfirmOpen, actions } = useLogoutController();

	return (
		<header className="navbar">
			<div className="navbar-toolbar">
				<h1 className="navbar-title">Application</h1>
			</div>
			<button
				className="icon-button navbar-logout"
				onClick={actions.openConfirm}
				aria-label="Log out"
				title="Log out"
			>
				<FiLogOut />
			</button>

			<Modal isOpen={isConfirmOpen} onClose={actions.closeConfirm} title="Log out">
				<p className="navbar-logout-confirm-text">
					Are you sure you want to log out? You'll need to sign in again to access your CV.
				</p>
				<div className="navbar-logout-confirm-actions">
					<Button text="Cancel" type="neutral" outline={true} onClick={actions.closeConfirm} disabled={isSubmitting} />
					<Button text="Log out" type="error" onClick={actions.confirmLogout} disabled={isSubmitting} />
				</div>
			</Modal>
		</header>
	);
};

export default Navbar;
