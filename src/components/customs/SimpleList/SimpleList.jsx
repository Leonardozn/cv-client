import Avatar from "../../modulars/Avatar/Avatar";
import ActionButton from "../../modulars/ActionButton/ActionButton";
import "./SimpleList.css";

const SimpleListItem = ({
	primaryText,
	secondaryText,
	icon,
	iconPosition = "start",
	avatar,
	avatarPosition = "start",
	action,                    // backward compat: single action
	actionPosition = "end",    // backward compat: single action position
	actions,                   // array of up to 3 ActionButton props
	actionsPosition = "end",   // position for the actions group
	customActions,             // NEW: custom JSX for actions
	onClick,
}) => {
	// Normalize: actions array takes priority over single action. Max 3.
	const resolvedActions = actions
		? actions.slice(0, 3)
		: action
			? [action]
			: null;
	const resolvedActionsPosition = actions ? actionsPosition : actionPosition;

	const resolveSide = (position) => {
		// Determine which element renders based on priority and assigned position.
		// Only one component renders per side.
		if (avatar && (avatarPosition || "start") === position) {
			return <Avatar {...avatar} />;
		}
		if (icon && (iconPosition || "start") === position) {
			return <div className="simple-list__icon">{icon}</div>;
		}
		if (customActions && (actionsPosition || "end") === position) {
			return <div className="simple-list__actions">{customActions}</div>;
		}
		if (resolvedActions && resolvedActionsPosition === position) {
			return (
				<div className="simple-list__actions">
					{resolvedActions.map((act, i) => (
						<ActionButton key={i} {...act} />
					))}
				</div>
			);
		}
		return null;
	};

	const startContent = resolveSide("start");
	const endContent = resolveSide("end");

	return (
		<div
			className={`simple-list__item ${onClick ? "simple-list__item--clickable" : ""}`}
			onClick={onClick}
		>
			{startContent && (
				<div className="simple-list__side simple-list__side--start">
					{startContent}
				</div>
			)}

			<div className="simple-list__content">
				{primaryText && (
					<div className="simple-list__primary-text">{primaryText}</div>
				)}
				{secondaryText && (
					<div className="simple-list__secondary-text">{secondaryText}</div>
				)}
			</div>

			{endContent && (
				<div className="simple-list__side simple-list__side--end">
					{endContent}
				</div>
			)}
		</div>
	);
};

const SimpleList = ({ items = [], elevation = 0, actions, actionsPosition, ...props }) => {
	return (
		<div className={`simple-list elevation-${elevation}`} {...props}>
			{items.map((item, index) => (
				<SimpleListItem
					key={item.id || index}
					{...item}
					actions={item.actions ?? actions}
					actionsPosition={item.actionsPosition ?? actionsPosition}
					customActions={item.customActions}
				/>
			))}
		</div>
	);
};

export default SimpleList;
