import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import SideMenu from "../SideMenu/SideMenu";
import "./Main.css";

const Main = () => {
	const [isOpen, setIsOpen] = useState(true);

	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div
			className={`main-layout ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
		>
			<Navbar isOpen={isOpen} toggleSidebar={toggleSidebar} />

			<SideMenu isOpen={isOpen} toggleSidebar={toggleSidebar} />

			<main className="main-content-area">
				<Outlet />
			</main>
		</div>
	);
};

export default Main;
