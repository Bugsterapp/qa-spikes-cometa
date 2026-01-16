// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
	theme: {
		extend: {
			gridTemplateColumns: {
				delinquency: '2fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr',
			},
			fontFamily: {
				lota: ['"Lota Grotesque"', "sans-serif"],
			},
			keyframes: {
				slideDown: {
					from: { height: 0 },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				slideUp: {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: 0 },
				},
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
			animation: {
				slideDown: "slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)",
				slideUp: "slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)",
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
					neutral: "hsl(var(--primary-neutral))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
					neutral: "hsl(var(--secondary-neutral))",
					"neutral-foreground": "hsl(var(--secondary-neutral-foreground))",
				},
				"background-white": "hsl(var(--background-white))",
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
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					// DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
				// Core colors
				neutral: {
					25: "#F7F9FC",
					50: "#F4F6FB",
					100: "#E9EEF7",
					200: "#DBE3F0",
					300: "#C0C9D8",
					400: "#A2ABB9",
					500: "#6E7480",
					600: "#535765",
					700: "#353540",
					800: "#22222A",
					900: "#202024",
					950: "#1C1C1D",
				},
				galaxy: {
					50: "#F3EBFF",
					100: "#E4D2FF",
					200: "#CAA8FF",
					300: "#AF7BFF",
					400: "#9F61FF",
					500: "#873AFF",
					600: "#7B35E8",
					700: "#6029B5",
					800: "#4A208C",
					900: "#39186B",
				},
				aurora: {
					50: "#FFEFF7",
					100: "#FFCEE7",
					200: "#FFB7DB",
					300: "#FE96CA",
					400: "#FE81C0",
					500: "#FE62B0",
					600: "#E759A0",
					700: "#B4467D",
					800: "#8C3661",
					900: "#6B294A",
				},
				horizon: {
					50: "#FFF5EE",
					100: "#FFE0CB",
					200: "#FFD1B2",
					300: "#FFBD8E",
					400: "#FFB079",
					500: "#FF9C57",
					600: "#E88E4F",
					700: "#B56F3E",
					800: "#8C5630",
					900: "#6B4225",
				},
				// State colors
				success: {
					50: "#EDFFEB",
					100: "#D5FBD5",
					200: "#A0E5AB",
					300: "#86D992",
					400: "#55D067",
					500: "#28C441",
					600: "#20B137",
					700: "#23A337",
					800: "#1E8E30",
					900: "#197428",
				},
				info: {
					DEFAULT: "#1890FF",
					50: "#E8F4FF",
					100: "#B7DDFF",
					200: "#95CCFF",
					300: "#64B5FF",
					400: "#46A6FF",
					500: "#1890FF",
					600: "#1683E8",
					700: "#1166B5",
					800: "#0D4F8C",
					900: "#0A3C6B",
				},
				warning: {
					50: "#FFF9E6",
					100: "#FFECB2",
					200: "#FFE28D",
					300: "#FFD559",
					400: "#FFCD39",
					500: "#FFC107",
					600: "#E8B006",
					700: "#B58905",
					800: "#8C6A04",
					900: "#6B5103",
				},
				error: {
					DEFAULT: "#FD6262",
					50: "#FFEFEF",
					100: "#FECECE",
					200: "#FEB7B7",
					300: "#FE9696",
					400: "#FD8181",
					500: "#FD6262",
					600: "#E65959",
					700: "#B44646",
					800: "#8B3636",
					900: "#6A2929",
				},
				legacy: {
					DEFAULT: "#00AB55",
				},
			},
		},
	},
	plugins: [
		require("@tailwindcss/forms"),
		require("tailwindcss-animate"),
		require("@tailwindcss/typography"),
		plugin((helpers) => {
			// variants that help styling Radix-UI components
			dataStateVariant("active", helpers);
			dataStateVariant("closed", helpers);
			dataStateVariant("placeholder", helpers);
			// dataStateVariant('on', helpers);
			dataStateVariant("checked", helpers);
			dataStateVariant("unchecked", helpers);
		}),
	],
};

function dataStateVariant(
	state,
	{
		addVariant, // for registering custom variants
		e, // for manually escaping strings meant to be used in class names
	},
) {
	addVariant(`data-state-${state}`, ({ modifySelectors, separator }) => {
		modifySelectors(
			({ className }) =>
				`.${e(`data-state-${state}${separator}${className}`)}[data-state='${state}']`,
		);
	});

	addVariant(`group-data-state-${state}`, ({ modifySelectors, separator }) => {
		modifySelectors(
			({ className }) =>
				`.group[data-state='${state}'] .${e(`group-data-state-${state}${separator}${className}`)}`,
		);
	});

	addVariant(`peer-data-state-${state}`, ({ modifySelectors, separator }) => {
		modifySelectors(
			({ className }) =>
				`.peer[data-state='${state}'] ~ .${e(`peer-data-state-${state}${separator}${className}`)}`,
		);
	});
}
