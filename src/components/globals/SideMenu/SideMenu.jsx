import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
	AiOutlineLeft,
	AiOutlineMenu,
	AiOutlineDown,
	AiOutlineRight,
} from "react-icons/ai";
import "./SideMenu.css";

// Same breakpoint SideMenu.css/Main.css already switch on for the mobile overlay layout - a nav
// click there should collapse the sidebar back instead of leaving it covering the content.
const MOBILE_BREAKPOINT_QUERY = "(max-width: 768px)";

// Menu Configuration
// { label: "", link: "", icon: null || <Icon /> }
// The CLI-generated CRUD entries (User, Curriculum, Education, Experience,
// Certificate, Skill, Template) were removed: this is an end-user product,
// not an admin panel, so nobody should navigate a raw table of those models.
// Real entries land here as their dedicated pages are built.
const menuConfig = [
	{
		label: "Home",
		link: "home",
		icon: null,
	},
	{
		label: "Curriculum",
		link: "curriculum",
		icon: null,
	},
	{
		label: "Account",
		link: "account",
		icon: null,
	},
];

// Renders a single menu item (with or without children)
const MenuItem = ({ item, isOpen, closeSidebar }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const hasChildren = item.children?.length > 0;

	// Only an actual navigation (leaf link) should collapse the sidebar on mobile - expanding a
	// group is just revealing more menu, not leaving the page.
	const handleNavigate = () => {
		if (window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches) closeSidebar();
	};

	if (hasChildren) {
		return (
			<div className={`nav-group ${isExpanded && isOpen ? "expanded" : ""}`}>
				<button
					className={`nav-item nav-group-toggle ${!item.icon ? "no-icon" : ""}`}
					onClick={() => isOpen && setIsExpanded((prev) => !prev)}
					title={!isOpen && item.icon ? item.label : ""}
				>
					{item.icon && <span className="nav-icon">{item.icon}</span>}
					<span className={`nav-label ${isOpen ? "visible" : "hidden"}`}>
						{item.label}
					</span>
					{isOpen && (
						<span className="nav-chevron">
							{isExpanded ? (
								<AiOutlineDown size={14} />
							) : (
								<AiOutlineRight size={14} />
							)}
						</span>
					)}
				</button>
				<div className={`nav-sublist ${isExpanded && isOpen ? "visible" : ""}`}>
					{item.children.map((child) => (
						<NavLink
							key={child.link}
							to={child.link}
							className={({ isActive }) =>
								`nav-item nav-subitem ${isActive ? "active" : ""}`
							}
							title={child.label}
							onClick={handleNavigate}
						>
							{child.icon && <span className="nav-icon">{child.icon}</span>}
							<span className={`nav-label ${isOpen ? "visible" : "hidden"}`}>
								{child.label}
							</span>
						</NavLink>
					))}
				</div>
			</div>
		);
	}

	return (
		<NavLink
			to={item.link}
			className={({ isActive }) =>
				`nav-item ${isActive ? "active" : ""} ${!item.icon ? "no-icon" : ""}`
			}
			title={!isOpen && item.icon ? item.label : ""}
			onClick={handleNavigate}
		>
			{item.icon && <span className="nav-icon">{item.icon}</span>}
			<span className={`nav-label ${isOpen ? "visible" : "hidden"}`}>
				{item.label}
			</span>
		</NavLink>
	);
};

const SideMenu = ({ isOpen, toggleSidebar, closeSidebar }) => {
	return (
		<aside className={`sidebar-container ${isOpen ? "open" : "closed"}`}>
			<div className="sidebar-header">
				<button className="icon-button chevron-toggle" onClick={toggleSidebar}>
					{isOpen ? <AiOutlineLeft /> : <AiOutlineMenu />}
				</button>
			</div>

			<nav className="nav-list">
				{menuConfig.map((item) => (
					<MenuItem
						key={item.link}
						item={item}
						isOpen={isOpen}
						closeSidebar={closeSidebar}
					/>
				))}
			</nav>
		</aside>
	);
};

export default SideMenu;
