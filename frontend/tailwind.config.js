/** @type {import('tailwindcss').Config} */
export default {
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        inter: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
