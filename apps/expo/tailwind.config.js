const { theme } = require("./src/design/tailwind")

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  plugins: [require("nativewind/tailwind/css")],
  theme: {
    ...theme,
  },
}
