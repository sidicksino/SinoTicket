/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ['"Manrope"', "sans-serif"],
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        riseIn: "riseIn 600ms ease-out both",
      },
      backgroundImage: {
        "admin-pattern":
          "radial-gradient(circle at 10% 20%, rgba(14,165,233,0.14) 0, rgba(2,6,23,0) 42%), radial-gradient(circle at 88% 8%, rgba(245,158,11,0.12) 0, rgba(2,6,23,0) 38%), linear-gradient(160deg, #020617 0%, #0f172a 40%, #111827 100%)",
      },
    },
  },
  plugins: [],
};
