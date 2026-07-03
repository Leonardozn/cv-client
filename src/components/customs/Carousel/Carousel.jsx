import { useState, useEffect, useCallback } from "react";
import "./Carousel.css";

// ── Icons ────────────────────────────────────────────────────────────────────
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

// ── Component ────────────────────────────────────────────────────────────────
/**
 * Custom Carousel component handling specific image swiping layouts.
 *
 * @param {string[]} images - Array of image URLs to display.
 * @param {string} layout - "peek" (shows adjacent slides) or "full" (current takes 100%).
 * @param {number} interval - Autoplay interval in ms (0 means disabled).
 * @param {string} height - CSS height string for the sliding viewport.
 */
const Carousel = ({
	images = [],
	layout = "peek",
	interval = 0,
	height = "21.875rem",
	gap = "1rem",
	marginBottom = "0",
	padding = "0",
	bgColor = "transparent",
	elevation = 0,
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	// Auto-slide effect using useCallback for dependencies
	const nextSlide = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % images.length);
	}, [images.length]);

	const prevSlide = useCallback(() => {
		setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
	}, [images.length]);

	useEffect(() => {
		if (interval <= 0 || images.length <= 1) return;
		const timer = setInterval(nextSlide, interval);
		return () => clearInterval(timer);
	}, [interval, images.length, nextSlide]);

	if (!images || images.length === 0) return null;

	return (
		<div
			className={`carousel carousel--${layout} elevation-${elevation}`}
			style={{
				"--carousel-gap-dots": gap,
				"--carousel-mb": marginBottom,
				"--carousel-p": padding,
				"--carousel-bg": bgColor,
			}}
		>
			<div
				className="carousel__viewport"
				style={{ "--current-index": currentIndex, height }}
			>
				<div className="carousel__track">
					{images.map((src, idx) => (
						<div
							key={idx}
							className={`carousel__slide ${idx === currentIndex ? "carousel__slide--active" : ""}`}
						>
							<img
								src={src}
								alt={`Slide ${idx + 1}`}
								className="carousel__image"
								loading="lazy"
							/>
						</div>
					))}
				</div>

				{/* Prevent rendering arrows if there's only 1 image */}
				{images.length > 1 && (
					<>
						<button
							className="carousel__btn carousel__btn--left"
							onClick={prevSlide}
							aria-label="Previous slide"
						>
							<ChevronLeft />
						</button>
						<button
							className="carousel__btn carousel__btn--right"
							onClick={nextSlide}
							aria-label="Next slide"
						>
							<ChevronRight />
						</button>
					</>
				)}
			</div>

			{images.length > 1 && (
				<div className="carousel__dots">
					{images.map((_, idx) => (
						<button
							key={idx}
							className={`carousel__dot ${idx === currentIndex ? "carousel__dot--active" : ""}`}
							onClick={() => setCurrentIndex(idx)}
							aria-label={`Go to slide ${idx + 1}`}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default Carousel;
