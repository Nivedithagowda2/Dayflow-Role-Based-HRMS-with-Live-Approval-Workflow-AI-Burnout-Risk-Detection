/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0B0C10",
          900: "#0B0C10",
          800: "#14161C",
          700: "#1B1E26",
          600: "#262A33",
        },
        cream: "#F3EFE6",
        mutedtext: "#9A9CA6",
        gold: {
          50: "#FBF3E1",
          200: "#F2DDA8",
          400: "#E8B85B",
          500: "#DDA83F",
          600: "#C6912E",
        },
        teal: {
          300: "#7FE7C4",
          500: "#3DCB98",
          700: "#1F9D74",
        },
        amber: {
          300: "#F6C77E",
          500: "#EDA83E",
          700: "#B87A1F",
        },
        coral: {
          300: "#FFA894",
          500: "#F16A50",
          700: "#C6482F",
        },
        violet: {
          300: "#C3B2F7",
          500: "#8F72EC",
          700: "#6448C4",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,184,91,0.15), transparent), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(143,114,236,0.12), transparent)",
        noise:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.6s ease-out both",
        popIn: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        slideInRight: "slideInRight 0.35s ease-out both",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        glow: "glow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
