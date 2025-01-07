/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#255586",
        secondary: "#FBF1E5",
        warning: "#780E0E",
        danger: "#790209",
      },
      fontFamily: {
        SquadaOne: ["SquadaOne", "sans-serif"],
        Arial: ["Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
