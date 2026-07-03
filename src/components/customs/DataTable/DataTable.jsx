import ActionButton from "../../modulars/ActionButton/ActionButton";
import Input from "../../modulars/Input/Input";
import SimpleList from "../SimpleList/SimpleList";
import { FiCheck, FiEye, FiX } from "react-icons/fi";
import "./DataTable.css";

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

const TablePaginationGroup = ({
	currentPage = 1,
	totalPages = 1,
	type = "neutral",
	outline = false,
	onClick,
	elevation = 0,
}) => {
	const generatePagination = (current, total) => {
		if (total <= 7)
			return Array.from({ length: total }, (_, i) => String(i + 1));
		if (current <= 4) return ["1", "2", "3", "4", "5", "...", String(total)];
		if (current >= total - 3)
			return [
				"1",
				"...",
				String(total - 4),
				String(total - 3),
				String(total - 2),
				String(total - 1),
				String(total),
			];
		return [
			"1",
			"...",
			String(current - 1),
			String(current),
			String(current + 1),
			"...",
			String(total),
		];
	};

	const pages = generatePagination(Number(currentPage), Number(totalPages));
	const items = ["Prev", ...pages, "Next"];

	const handleClick = (text) => {
		if (text === "...") return;
		onClick?.(text);
	};

	return (
		<div
			className={`btn-group btn-group--${type} elevation-${elevation}`}
			role="group"
		>
			{items.map((text, index) => {
				const isActive =
					String(text) === String(currentPage) &&
					text !== "Prev" &&
					text !== "Next";
				const stateClass = isActive
					? "btn-group-item--active"
					: outline
						? "btn-group-item--outline"
						: "btn-group-item--inactive";

				if (text === "...") {
					return (
						<span
							key={`ellipsis-${index}`}
							className={`btn-group-item btn-group-item--ellipsis ${outline ? "btn-group-item--outline" : "btn-group-item--inactive"}`}
						>
							...
						</span>
					);
				}

				return (
					<button
						key={`${text}-${index}`}
						className={`btn-group-item ${stateClass}`}
						onClick={() => handleClick(text)}
					>
						{text}
					</button>
				);
			})}
		</div>
	);
};

const resolveSecondaryText = (cellData) => {
	if (cellData === undefined || cellData === null) return "";
	if (typeof cellData === "boolean") return cellData ? "Yes" : "No";
	if (Array.isArray(cellData)) return `${cellData.length} item${cellData.length !== 1 ? "s" : ""}`;
	if (typeof cellData === "object") return "";
	return String(cellData);
};

const Table = ({
	columns = [],
	data = [],
	header = "",
	type,
	alternate = false,
	search = false,
	searchValue = "",
	onSearchChange,
	pagination,
	onObjectClick,
	elevation = 0,
	rowsElevation = 0,
	paginationElevation = 0,
	responsiveSize = "sm",
	...props
}) => {
	const themeColor = resolveColor(type);
	const hasTheme = !!themeColor;

	return (
		<div
			className={`table-container ${hasTheme ? "table-container--themed" : ""} table-container--responsive-${responsiveSize} elevation-${elevation}`}
			style={{
				...(hasTheme ? { "--table-theme-color": themeColor } : {}),
				...(props.style || {}),
			}}
			{...props}
		>
			{(Boolean(header) || search) && (
				<div className="table__header-bar">
					{Boolean(header) && <div className="table__title">{header}</div>}
					{search && (
						<div className="table__search">
							<Input
								placeholder="Search..."
								value={searchValue}
								onChange={(e) =>
									onSearchChange && onSearchChange(e.target.value)
								}
							/>
						</div>
					)}
				</div>
			)}

			<div className="table-responsive">
				<table className={`table ${alternate ? "table--alternate" : ""}`}>
					<thead>
						<tr>
							{columns.map((col, idx) => (
								<th
									key={col.key || idx}
									style={{
										width: col.width,
										height: col.height,
										padding: col.padding,
										backgroundColor: col.bgColor
											? resolveColor(col.bgColor)
											: undefined,
										color: col.textColor
											? resolveColor(col.textColor)
											: undefined,
										...(col.styles || {}),
									}}
								>
									{col.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.map((row, rowIndex) => (
							<tr key={row.id || rowIndex}>
								{columns.map((col, colIndex) => {
									const cellData = row[col.key];

									const isObj = typeof cellData === "object" && cellData !== null;
									const isArray = Array.isArray(cellData);
									const isCellConfig =
										isObj && !isArray && !cellData.$$typeof &&
										(cellData.text !== undefined || cellData.data !== undefined ||
											cellData.icon !== undefined || cellData.action !== undefined ||
											cellData.bgColor !== undefined || cellData.textColor !== undefined ||
											cellData.bold !== undefined || cellData.styles !== undefined);
									
									let text = col.type === "object" ? null : cellData;
									let defaultIcon = null;

									if (isCellConfig) {
										text = col.type === "object" ? null : (cellData.text ?? cellData.data);
									} else if (isArray) {
										text = col.type === "object" ? null : cellData.length;
									} else if (typeof cellData === "boolean") {
										text = null;
										defaultIcon = cellData ? (
											<span style={{ color: "var(--color-success)", display: "flex", alignItems: "center" }}>
												<FiCheck size={20} />
											</span>
										) : (
											<span style={{ color: "var(--color-error)", display: "flex", alignItems: "center" }}>
												<FiX size={20} />
											</span>
										);
									} else if (isObj) {
										text = null;
									}

									const height = isCellConfig?.height ?? col.height;
									const width = isCellConfig?.width ?? col.width;
									const padding = isCellConfig?.padding ?? col.padding;
									const bgColor = isCellConfig?.bgColor ?? col.bgColor;
									const textColor = isCellConfig?.textColor ?? col.textColor;
									const bold = isCellConfig?.bold ?? col.bold;
									const icon = isCellConfig?.icon ?? defaultIcon;
									const action = isCellConfig?.action || (col.type === "object" ? {
										icon: <FiEye />,
										type: "neutral",
										onClick: () => (col.onClick ? col.onClick(cellData, row) : onObjectClick?.(cellData, col)),
										style: {
											width: "2rem",
											height: "2rem",
											fontSize: "1rem",
										}
									} : undefined);
									const onClick = isCellConfig?.onClick;
									const styles = isCellConfig?.styles ?? col.styles;

									const resolvedBgColor = bgColor
										? resolveColor(bgColor)
										: undefined;
									const resolvedTextColor = textColor
										? resolveColor(textColor)
										: undefined;

									return (
										<td
											key={col.key || colIndex}
											className={`table__cell ${onClick ? "table__cell--clickable" : ""}`}
											title={
												text !== undefined && text !== null && typeof text !== "object"
													? String(text)
													: undefined
											}
											onClick={onClick}
											style={{
												height,
												width,
												padding,
												...(resolvedBgColor
													? { backgroundColor: resolvedBgColor }
													: {}),
												...(resolvedTextColor
													? { color: resolvedTextColor }
													: {}),
												fontWeight: bold ? "bold" : "normal",
												...(styles || {}),
											}}
										>
											<div className="table__cell-content">
												{col.renderCell ? (
													col.renderCell(cellData, row)
												) : (
													<>
														{icon && (
															<span className="table__cell-icon">{icon}</span>
														)}
														{text !== undefined && text !== null && (
															<span className="table__cell-text">{text}</span>
														)}
														{action && (
															<div className="table__cell-action">
																<ActionButton {...action} />
															</div>
														)}
													</>
												)}
											</div>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* SimpleList responsive view — shown at the configured breakpoint */}
			<div className="table-list-view">
				{(() => {
					const dataColumns = columns.filter((col) => col.key !== "actions");
					const actionsColumn = columns.find((col) => col.key === "actions");
					const mainColumn = dataColumns.find((col) => col.mainColumn) || dataColumns[0];
					return data.map((row, rowIndex) => (
						<SimpleList
							key={row.id || rowIndex}
							items={[{
								primaryText: mainColumn?.label,
								secondaryText: mainColumn 
									? (mainColumn.renderCell 
										? mainColumn.renderCell(row[mainColumn.key], row) 
										: resolveSecondaryText(row[mainColumn.key])) 
									: "",
								customActions: actionsColumn?.renderCell 
									? actionsColumn.renderCell(row[actionsColumn.key], row) 
									: undefined,
							}]}
							// Use rowActions only if there is no custom actions column
							actions={!actionsColumn?.renderCell && rowActions.length > 0
								? rowActions.slice(0, 3).map((act) => ({
									...act,
									onClick: () => act.onClick(row),
								}))
								: undefined
							}
							actionsPosition="end"
						/>
					));
				})()}
			</div>

			{pagination && (
				<div
					className={`table__pagination table__pagination--${pagination.position || "center"}`}
				>
					{pagination.rowsOptions && (
						<div className="table__rows-container">
							<span>Show</span>
							<select
								className={`table__rows-select elevation-${rowsElevation}`}
								value={pagination.rowsPerPage}
								onChange={(e) =>
									pagination.onRowsChange?.(Number(e.target.value))
								}
							>
								{pagination.rowsOptions.map((opt) => (
									<option key={opt} value={opt}>
										{opt}
									</option>
								))}
							</select>
							<span>records</span>
						</div>
					)}
					<div className="table__pagination-buttons">
						<TablePaginationGroup
							{...pagination}
							elevation={paginationElevation}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default Table;
