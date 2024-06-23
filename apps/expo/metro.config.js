// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @type {import('expo/metro-config')}
 */
const { getSentryExpoConfig } = require("@sentry/react-native/metro")
const path = require("path")

const projectRoot = __dirname
const workspaceRoot = path.resolve(__dirname, "../..")

const config = getSentryExpoConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
]
config.resolver.sourceExts.push("sql")

module.exports = config
