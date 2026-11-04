const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// The workspace root must be watched so Metro can compile the "core" package,
// which ships TypeScript sources instead of a build output.
config.watchFolders = [workspaceRoot];

// Dependencies are hoisted to the workspace root, so resolution is pinned to
// both node_modules directories instead of walking up the tree.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
