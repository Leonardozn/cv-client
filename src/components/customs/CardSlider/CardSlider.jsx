import { useRef, useState, useEffect, Children, cloneElement } from "react";
import "./CardSlider.css";

const ChevronLeft = () => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="15 18 9 12 15 6" />
	</svg>
);

const ChevronRight = () => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="9 18 15 12 9 6" />
	</svg>
);

/**
 * CardSlider custom component.
 * Lays out child elements horizontally with native smooth scrolling.
 * Features floating arrows that disappear when hitting the boundaries.
 * Includes optional auto-sliding logic when interval > 0.
 * Customizable layout spacing/colors via props.
 */
const CardSlider = ({
	children,
	step = 300,
	interval = 0,
	gap = "1rem",
	marginBottom = "0",
	padding = "0.5rem 0.25rem",
	bgColor = "transparent",
	elevation = 0,
}) => {
	const trackRef = useRef(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	const checkScrollState = () => {
		if (!trackRef.current) return;
		const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;

		// Check if we can scroll left (we are not at the very beginning)
		setCanScrollLeft(scrollLeft > 0);
		// Check if we can scroll right (we haven't reached the end)
		// Using a 2px buffer to avoid float rounding issues
		setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
	};

	useEffect(() => {
		checkScrollState();
		// Re-check on window resize
		window.addEventListener("resize", checkScrollState);
		return () => window.removeEventListener("resize", checkScrollState);
	}, [children]);

	const slideLeft = () => {
		if (trackRef.current) {
			trackRef.current.scrollBy({ left: -step, behavior: "smooth" });
		}
	};

	const slideRight = () => {
		if (trackRef.current) {
			trackRef.current.scrollBy({ left: step, behavior: "smooth" });
		}
	};

	// Auto-slide effect
	useEffect(() => {
		if (interval <= 0) return;

		const autoSlide = () => {
			if (!trackRef.current) return;
			const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;

			// If we've reached the end, reset to beginning.
			// Using a buffer in comparison to dodge sub-pixel rounding inconsistencies.
			if (scrollLeft + clientWidth >= scrollWidth - 2) {
				trackRef.current.scrollTo({ left: 0, behavior: "smooth" });
			} else {
				trackRef.current.scrollBy({ left: step, behavior: "smooth" });
			}
		};

		const timer = setInterval(autoSlide, interval);
		return () => clearInterval(timer);
	}, [interval, step]);

	return (
		<div
			className="card-slider"
			style={{
				"--cs-gap": gap,
				"--cs-margin-bottom": marginBottom,
				"--cs-padding": padding,
				"--cs-bg": bgColor,
			}}
		>
			{/* Left Arrow */}
			<button
				type="button"
				className={`card-slider__arrow card-slider__arrow--left ${!canScrollLeft ? "card-slider__arrow--hidden" : ""}`}
				onClick={slideLeft}
				aria-label="Slide left"
			>
				<ChevronLeft />
			</button>

			{/* The Track (Scrollable Container) */}
			<div
				className="card-slider__track"
				ref={trackRef}
				onScroll={checkScrollState}
			>
				{Children.map(children, (child) =>
					child ? cloneElement(child, { elevation }) : null,
				)}
			</div>

			{/* Right Arrow */}
			<button
				type="button"
				className={`card-slider__arrow card-slider__arrow--right ${!canScrollRight ? "card-slider__arrow--hidden" : ""}`}
				onClick={slideRight}
				aria-label="Slide right"
			>
				<ChevronRight />
			</button>
		</div>
	);
};

export default CardSlider;
