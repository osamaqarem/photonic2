const tailwindColors = require("tailwindcss/colors")

// Silence console warnings about deprecated colors
delete tailwindColors.lightBlue
delete tailwindColors.blueGray
delete tailwindColors.coolGray
delete tailwindColors.trueGray
delete tailwindColors.warmGray

// TODO: only include actual theme colors
const colors = {
  ...tailwindColors,
  black: {
    DEFAULT: "#000",
    600: "#1A1C1C",
    800: "#090909",
  },
  gray: tailwindColors.neutral,
}

module.exports = { colors }
