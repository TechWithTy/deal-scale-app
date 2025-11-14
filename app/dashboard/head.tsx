const HERO_POSTER = "/demos/svgs/JZP1_tcJNyZaQHtc8ZL9p.webp";
const HERO_THUMBNAIL_VIDEO = "/demos/gifs/SVGv2r.mp4";
const SUPADEMO_ORIGIN = "https://app.supademo.com";

export default function DashboardHead() {
	return (
		<>
			<link rel="preconnect" href={SUPADEMO_ORIGIN} crossOrigin="" />
			<link
				rel="preload"
				as="image"
				href={HERO_POSTER}
				type="image/webp"
				fetchPriority="high"
			/>
			<link
				rel="preload"
				as="video"
				href={HERO_THUMBNAIL_VIDEO}
				type="video/mp4"
				crossOrigin=""
			/>
		</>
	);
}
