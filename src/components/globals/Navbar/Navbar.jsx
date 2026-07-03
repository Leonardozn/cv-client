import { AiOutlineMenu } from "react-icons/ai";
import "./Navbar.css";

const Navbar = ({ isOpen, toggleSidebar }) => {
	return (
		<header className="navbar">
			<div className="navbar-toolbar">
				<h1 className="navbar-title">Application</h1>
			</div>
		</header>
	);
};

export default Navbar;
