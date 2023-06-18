const { colors } = require("./colors")

/**
 * @type {import('tailwindcss').Config['theme']}
 */
const theme = {
  colors,
  extend: {
    fontSize: {
      xxs: ["10px", "16px"],
    },
  },
}

module.exports = { theme, colors }
