import "./Breadcrumb.css";

const Breadcrumb = ({ path = [] }) => {
	return (
		<nav className="breadcrumb" aria-label="breadcrumb">
			<ol className="breadcrumb-list">
				{path.map((item, index) => {
					const isLast = index === path.length - 1;
					return (
						<li key={index} className="breadcrumb-item">
							<span
								className={`breadcrumb-label ${isLast ? "breadcrumb-label--active" : ""}`}
								aria-current={isLast ? "page" : undefined}
							>
								{item}
							</span>
							{!isLast && <span className="breadcrumb-separator">/</span>}
						</li>
					);
				})}
			</ol>
		</nav>
	);
};

export default Breadcrumb;
