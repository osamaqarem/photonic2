// @ts-check

const colors = require("@radix-ui/colors")

const palette = {
  white: colors.whiteA,
  black: colors.blackA,
  light: {
    blue: colors.blue,
    slate: colors.slate,
    tomato: colors.tomato,
    grass: colors.grass,
    amber: colors.amber,
    cyan: colors.cyan,
  },
  dark: {
    blue: colors.blueDark,
    slate: colors.slateDark,
    tomato: colors.tomatoDark,
    grass: colors.grassDark,
    amber: colors.amberDark,
    cyan: colors.cyanDark,
  },
}

module.exports = { palette, rawPalette: colors }
