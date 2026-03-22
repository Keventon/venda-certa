const jiti = require("jiti")(__filename);
const { colors } = jiti("./src/styles/colors.ts");
const { tailwindFontFamily } = jiti("./src/styles/fontFamily.ts");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      fontFamily: tailwindFontFamily,
    },
  },
  plugins: [],
};
