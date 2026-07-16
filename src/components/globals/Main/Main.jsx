import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import SideMenu from "../SideMenu/SideMenu";
import "./Main.css";

// Below this width SideMenu.css/Main.css already switch to the mobile overlay layout - the
// sidebar should start collapsed there instead of covering the content on first render.
const MOBILE_BREAKPOINT_QUERY = "(max-width: 768px)";

const Main = () => {
	const [isOpen, setIsOpen] = useState(() => !window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches);

	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	const closeSidebar = () => setIsOpen(false);

	return (
		<div
			className={`main-layout ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
		>
			<Navbar isOpen={isOpen} toggleSidebar={toggleSidebar} />

			<SideMenu
				isOpen={isOpen}
				toggleSidebar={toggleSidebar}
				closeSidebar={closeSidebar}
			/>

			<main className="main-content-area">
				<Outlet />
			</main>
		</div>
	);
};

export default Main;
