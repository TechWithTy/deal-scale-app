import { HERO_COLORS } from "@/constants/theme/marketing";
import Link from "next/link";
import React from "react";
import type { CSSProperties } from "react";

export const runtime = "edge";
export const dynamic = "force-static";
export const revalidate = 3600;
export const fetchCache = "force-cache";

const heroStyle: CSSProperties = {
	minHeight: "100vh",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "4rem 1.5rem",
	background: `radial-gradient(circle at top left, ${HERO_COLORS.muted}, ${HERO_COLORS.background})`,
	color: HERO_COLORS.text,
};

const ctaStyle: CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "0.875rem 2.75rem",
	fontWeight: 600,
	fontSize: "1rem",
	borderRadius: "9999px",
	backgroundColor: HERO_COLORS.accent,
	color: HERO_COLORS.accentText,
	textDecoration: "none",
	boxShadow: "0 12px 30px rgba(14, 165, 233, 0.35)",
	border: `2px solid ${HERO_COLORS.outline}`,
};

const secondaryStyle: CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "0.875rem 1.5rem",
	fontWeight: 600,
	fontSize: "1rem",
	borderRadius: "9999px",
	backgroundColor: "transparent",
	color: HERO_COLORS.text,
	textDecoration: "none",
	border: `2px solid ${HERO_COLORS.outline}`,
	marginLeft: "1rem",
};

export default function HomePage() {
	return (
		<main>
			<section data-testid="hero" style={heroStyle}>
				<div style={{ maxWidth: "60rem", textAlign: "center" }}>
					<span
						style={{
							fontSize: "0.875rem",
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							display: "inline-block",
							marginBottom: "1rem",
							fontWeight: 700,
							color: HERO_COLORS.accent,
						}}
					>
						Real Estate Growth Platform
					</span>
					<h1
						style={{
							fontSize: "clamp(2.75rem, 5vw, 4.5rem)",
							lineHeight: 1.1,
							marginBottom: "1.5rem",
						}}
					>
						Close More Deals with Predictable, High-Intent Leads
					</h1>
					<p
						style={{
							fontSize: "1.125rem",
							lineHeight: 1.8,
							color: "rgba(241, 245, 249, 0.86)",
							margin: "0 auto 2.5rem",
							maxWidth: "42rem",
						}}
					>
						Deal Scale unifies data-driven targeting, automated follow-ups, and
						transparent analytics so your brokerage can convert prospects into
						clients faster than ever.
					</p>
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							flexWrap: "wrap",
						}}
					>
						<Link href="https://www.dealscale.io/sign-up" style={ctaStyle}>
							Get Started
						</Link>
						<Link href="/signin" style={secondaryStyle}>
							View Live Demo
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
