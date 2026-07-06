/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand navy / royal blue (headings, brand text, primary actions)
        navy: {
          50: "#eef1fb",
          100: "#dbe1f6",
          200: "#b7c3ec",
          300: "#8a9cdd",
          400: "#5f74c9",
          500: "#3f53b0",
          600: "#2f3f92",
          700: "#273472",
          800: "#1f295a",
          900: "#161d3f",
        },
        // Soft pink / rose accents
        rose: {
          50: "#fff5f8",
          100: "#ffe6ef",
          200: "#ffccdd",
          300: "#ffa6c4",
          400: "#ff6fa1",
          500: "#f43f85",
          600: "#e11d6d",
          700: "#bd1259",
          800: "#9c134e",
          900: "#821444",
        },
        blush: "#fff7fb",
        cream: "#fffdfb",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(31, 41, 90, 0.15)",
        card: "0 6px 24px -8px rgba(31, 41, 90, 0.12)",
        "card-hover": "0 22px 50px -14px rgba(225, 29, 109, 0.28)",
        glow: "0 0 0 1px rgba(255,204,221,0.6), 0 18px 40px -14px rgba(225,29,109,0.35)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        "scale-in": "scale-in 0.3s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
