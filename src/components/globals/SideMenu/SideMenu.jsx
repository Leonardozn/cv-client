import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
	AiOutlineLeft,
	AiOutlineMenu,
	AiOutlineDown,
	AiOutlineRight,
} from "react-icons/ai";
import "./SideMenu.css";

// Menu Configuration
// { label: "", link: "", icon: null || <Icon /> }
const menuConfig = [
	{
		label: "User",
		link: "user",
		icon: null,
	},
	{
		label: "Curriculum",
		link: "curriculum",
		icon: null,
	},
	{
		label: "Education",
		link: "education",
		icon: null,
	},
	{
		label: "Experience",
		link: "experience",
		icon: null,
	},
	{
		label: "Certificate",
		link: "certificate",
		icon: null,
	},
];

// Renders a single menu item (with or without children)
const MenuItem = ({ item, isOpen }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const hasChildren = item.children?.length > 0;

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
		>
			{item.icon && <span className="nav-icon">{item.icon}</span>}
			<span className={`nav-label ${isOpen ? "visible" : "hidden"}`}>
				{item.label}
			</span>
		</NavLink>
	);
};

const SideMenu = ({ isOpen, toggleSidebar }) => {
	return (
		<aside className={`sidebar-container ${isOpen ? "open" : "closed"}`}>
			<div className="sidebar-header">
				<button className="icon-button chevron-toggle" onClick={toggleSidebar}>
					{isOpen ? <AiOutlineLeft /> : <AiOutlineMenu />}
				</button>
			</div>

			<nav className="nav-list">
				{menuConfig.map((item) => (
					<MenuItem key={item.link} item={item} isOpen={isOpen} />
				))}
			</nav>
		</aside>
	);
};

export default SideMenu;
