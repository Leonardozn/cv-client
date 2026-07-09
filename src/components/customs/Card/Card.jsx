import "./Card.css";

// Resolves a color value to either a CSS variable or a direct CSS color string.
// Accepted preset names: primary, secondary, tertiary, quaternary, neutral,
// info, success, warning, error — or any valid CSS color (e.g. "#ff0000").
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

const resolveColor = (color) =>
	PRESET_COLORS.includes(color) ? `var(--color-${color})` : color;

// Groups an array of badges by their position key.
const groupByPosition = (badges) =>
	badges.reduce((acc, badge) => {
		const pos = badge.position ?? "body";
		if (!acc[pos]) acc[pos] = [];
		acc[pos].push(badge);
		return acc;
	}, {});

// Renders a single overlay badge pill (proprietary element — full style freedom).
const OverlayBadge = ({ text, icon, color = "neutral" }) => (
	<span
		className="card__overlay-badge"
		style={{ backgroundColor: resolveColor(color) }}
	>
		{icon && <span className="card__overlay-badge-icon">{icon}</span>}
		{text}
	</span>
);

// Renders a round action button (proprietary element — full style freedom).
const ActionButton = ({ icon, onClick }) => (
	<button className="card__action-btn" onClick={onClick} type="button">
		{icon}
	</button>
);

// Shared image block: renders the image + all overlay badges/actions.
// Used by all layouts that display an image.
const CardImage = ({ imageUrl, imageAlt, badgeGroups, actions, onImageError }) => {
	const hasOverlays =
		actions.length > 0 ||
		["top-left", "top-right", "bottom-left", "bottom-right"].some(
			(pos) => badgeGroups[pos]?.length > 0,
		);

	return (
		<div className="card__image-wrapper">
			<img src={imageUrl} alt={imageAlt} className="card__image" onError={onImageError} />

			{hasOverlays && (
				<div className="card__overlays">
					{badgeGroups["top-left"]?.length > 0 && (
						<div className="card__overlay card__overlay--tl">
							{badgeGroups["top-left"].map((b, i) => (
								<OverlayBadge key={i} {...b} />
							))}
						</div>
					)}

					{(badgeGroups["top-right"]?.length > 0 || actions.length > 0) && (
						<div className="card__overlay card__overlay--tr">
							{badgeGroups["top-right"]?.map((b, i) => (
								<OverlayBadge key={i} {...b} />
							))}
							{actions.map((a, i) => (
								<ActionButton key={i} icon={a.icon} onClick={a.onClick} />
							))}
						</div>
					)}

					{badgeGroups["bottom-left"]?.length > 0 && (
						<div className="card__overlay card__overlay--bl">
							{badgeGroups["bottom-left"].map((b, i) => (
								<OverlayBadge key={i} {...b} />
							))}
						</div>
					)}

					{badgeGroups["bottom-right"]?.length > 0 && (
						<div className="card__overlay card__overlay--br">
							{badgeGroups["bottom-right"].map((b, i) => (
								<OverlayBadge key={i} {...b} />
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

// ── Card ──────────────────────────────────────────────────────────────────────
// Custom component — composable content card.
//
// Props:
//   title        {string}   — Card heading.
//   description  {string}   — Supporting text.
//   imageUrl     {string}   — Optional image source.
//   imageAlt     {string}   — Alt text for image.
//   onImageError {function} — Called if imageUrl fails to load (e.g. hide/swap it).
//   layout          {string}   — Image position: "top" (default) | "left" | "right" | "background".
//   overlayStrength  {string}   — Gradient intensity for layout="background":
//                                  "light" | "medium" (default) | "heavy".
//   badges       {Array}    — Badge config objects:
//                              { text, icon?, color?, position? }
//                              position: "top-left" | "top-right" |
//                                        "bottom-left" | "bottom-right" | undefined (body)
//                              color: preset name OR any CSS color string.
//   actions      {Array}    — Round icon-button configs: { icon, onClick }.
//                              Rendered top-right corner over the image.
//   footer       {node}     — Slot for any footer content (buttons, links…).
//   onClick      {function} — Makes the whole card clickable.
//   className    {string}   — Extra class for external layout control by parent.
const Card = ({
	title,
	description,
	imageUrl,
	imageAlt = "",
	onImageError,
	layout = "top",
	overlayStrength = "medium",
	badges = [],
	actions = [],
	footer,
	onClick,
	className = "",
	elevation = 0,
}) => {
	const isClickable = typeof onClick === "function";
	const badgeGroups = groupByPosition(badges);

	const cardClasses = [
		"card",
		`card--layout-${layout}`,
		layout === "background" ? `card--overlay-${overlayStrength}` : "",
		isClickable ? "card--clickable" : "",
		`elevation-${elevation}`,
		className,
	]
		.filter(Boolean)
		.join(" ");

	// ── Body + Footer column (shared across layouts) ──
	const bodyContent = (
		<div className="card__content">
			<div className="card__body">
				{badgeGroups["body"]?.length > 0 && (
					<div className="card__body-badges">
						{badgeGroups["body"].map((b, i) => (
							<OverlayBadge key={i} {...b} />
						))}
					</div>
				)}
				{title && <h3 className="card__title">{title}</h3>}
				{description && <p className="card__description">{description}</p>}
			</div>
			{footer && <div className="card__footer">{footer}</div>}
		</div>
	);

	return (
		<div
			className={cardClasses}
			onClick={onClick}
			role={isClickable ? "button" : undefined}
			tabIndex={isClickable ? 0 : undefined}
			onKeyDown={
				isClickable ? (e) => e.key === "Enter" && onClick(e) : undefined
			}
		>
			{/* layout="background" — image covers full card, content overlaid */}
			{layout === "background" && imageUrl && (
				<CardImage
					imageUrl={imageUrl}
					imageAlt={imageAlt}
					badgeGroups={badgeGroups}
					actions={actions}
					onImageError={onImageError}
				/>
			)}

			{/* layout="top" | "left" | "right" — image as sibling of content */}
			{layout !== "background" && imageUrl && (
				<CardImage
					imageUrl={imageUrl}
					imageAlt={imageAlt}
					badgeGroups={badgeGroups}
					actions={actions}
					onImageError={onImageError}
				/>
			)}

			{bodyContent}
		</div>
	);
};

export default Card;
