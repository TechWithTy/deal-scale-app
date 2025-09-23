import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
					glow: "hsl(var(--primary-glow))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				success: {
					DEFAULT: "hsl(var(--success))",
					foreground: "hsl(var(--success-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
					hover: "hsl(var(--card-hover))",
				},
				rank: {
					1: "hsl(var(--rank-1))",
					2: "hsl(var(--rank-2))",
					3: "hsl(var(--rank-3))",
					top10: "hsl(var(--rank-top10))",
					rising: "hsl(var(--rank-rising))",
					falling: "hsl(var(--rank-falling))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
			backgroundImage: {
				"gradient-primary": "var(--gradient-primary)",
				"gradient-gold": "var(--gradient-gold)",
				"gradient-silver": "var(--gradient-silver)",
				"gradient-bronze": "var(--gradient-bronze)",
				"gradient-bg": "var(--gradient-bg)",
			},
			boxShadow: {
				glow: "var(--shadow-glow)",
				rank: "var(--shadow-rank)",
				card: "var(--shadow-card)",
			},
			transitionDuration: {
				fast: "var(--transition-fast)",
				smooth: "var(--transition-smooth)",
				slow: "var(--transition-slow)",
			},
			animation: {
				"rank-up": "rankUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
				"rank-down": "rankDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
				"score-pulse": "scorePulse 0.8s ease-out",
				"glow-pulse": "glowPulse 2s ease-in-out infinite",
				"slide-in-up": "slideInUp 0.4s ease-out",
				"fade-in": "fadeIn 0.3s ease-out",
			},
			keyframes: {
				rankUp: {
					"0%": {
						transform: "translateY(0) scale(1)",
						backgroundColor: "transparent",
					},
					"50%": {
						transform: "translateY(-4px) scale(1.02)",
						backgroundColor: "hsl(var(--rank-rising) / 0.1)",
					},
					"100%": {
						transform: "translateY(0) scale(1)",
						backgroundColor: "transparent",
					},
				},
				rankDown: {
					"0%": {
						transform: "translateY(0) scale(1)",
						backgroundColor: "transparent",
					},
					"50%": {
						transform: "translateY(4px) scale(0.98)",
						backgroundColor: "hsl(var(--rank-falling) / 0.1)",
					},
					"100%": {
						transform: "translateY(0) scale(1)",
						backgroundColor: "transparent",
					},
				},
				scorePulse: {
					"0%": { transform: "scale(1)" },
					"50%": { transform: "scale(1.05)", color: "hsl(var(--success))" },
					"100%": { transform: "scale(1)" },
				},
				glowPulse: {
					"0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" },
					"50%": {
						boxShadow:
							"0 0 40px hsl(var(--primary) / 0.6), 0 0 60px hsl(var(--primary) / 0.3)",
					},
				},
				slideInUp: {
					"0%": { transform: "translateY(10px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
