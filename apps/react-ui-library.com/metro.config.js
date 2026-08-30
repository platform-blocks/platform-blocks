const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Include the monorepo root so Metro watches changes in the UI and charts packages
// Merge with existing watchFolders instead of overriding
config.watchFolders = [...(config.watchFolders || []), workspaceRoot];

// Add haste/extra resolver settings for charts package path
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'platform-blocks': path.resolve(workspaceRoot, 'packages', 'ui', 'src'),
  '@platform-blocks/charts': path.resolve(workspaceRoot, 'packages', 'charts', 'src'),
  '@platform-blocks/react-ui-library': path.resolve(workspaceRoot, 'packages', 'ui', 'src'),
  // Force singletons for React stack to avoid duplicate copies across workspaces
  react: path.resolve(projectRoot, 'node_modules', 'react'),
  'react-dom': path.resolve(projectRoot, 'node_modules', 'react-dom'),
  'react-native': path.resolve(projectRoot, 'node_modules', 'react-native'),
  'react-native-web': path.resolve(projectRoot, 'node_modules', 'react-native-web'),
};

// Merge with existing nodeModulesPaths instead of overriding
config.resolver.nodeModulesPaths = [
  ...(config.resolver.nodeModulesPaths || []),
  path.resolve(projectRoot, 'node_modules'),
  // Also allow resolving shared workspace dependencies from the monorepo root
  path.resolve(workspaceRoot, 'node_modules'),
];

// Remove problematic overrides that expo-doctor warns about
// config.resolver.disableHierarchicalLookup = true;
// config.resolver.unstable_enableSymlinks = true;

// Make sure source files from the UI package are transformed (not the prebuilt lib)
config.resolver.sourceExts = config.resolver.sourceExts.concat(['cjs']);

// Keep the default transformer; Reanimated plugin is handled in root babel.config.js
module.exports = config;