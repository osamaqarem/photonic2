const radix = require("@radix-ui/colors")

const palette = {
  white: radix.whiteA,
  black: radix.blackA,
  light: {
    blue: radix.blue,
    slate: radix.slate,
    tomato: radix.tomato,
    grass: radix.grass,
    amber: radix.amber,
    cyan: radix.cyan,
  },
  dark: {
    blue: radix.blueDark,
    slate: radix.slateDark,
    tomato: radix.tomatoDark,
    grass: radix.grassDark,
    amber: radix.amberDark,
    cyan: radix.cyanDark,
  },
}

module.exports = { palette }
