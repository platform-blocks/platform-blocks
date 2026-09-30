const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Include the monorepo root so Metro watches changes in the UI and charts packages
// Merge with existing watchFolders instead of overriding
config.watchFolders = [...(config.watchFolders || []), workspaceRoot];

// Resolve every @plocks package to its source (one copy of each, so they share
// @plocks/ui's theme and overlay contexts).
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'plocks': path.resolve(workspaceRoot, 'packages', 'ui', 'src'),
  '@plocks/charts': path.resolve(workspaceRoot, 'packages', 'charts', 'src'),
  '@plocks/ui': path.resolve(workspaceRoot, 'packages', 'ui', 'src'),
  '@plocks/dates': path.resolve(workspaceRoot, 'packages', 'dates', 'src'),
  '@plocks/code': path.resolve(workspaceRoot, 'packages', 'code', 'src'),
  '@plocks/media': path.resolve(workspaceRoot, 'packages', 'media', 'src'),
  '@plocks/carousel': path.resolve(workspaceRoot, 'packages', 'carousel', 'src'),
  '@plocks/spotlight': path.resolve(workspaceRoot, 'packages', 'spotlight', 'src'),
  '@plocks/brands': path.resolve(workspaceRoot, 'packages', 'brands', 'src'),
  '@plocks/qrcode': path.resolve(workspaceRoot, 'packages', 'qrcode', 'src'),
  '@plocks/emoji-picker': path.resolve(workspaceRoot, 'packages', 'emoji-picker', 'src'),
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
config.resolver.sourceExts = config.resolver.sourceExts.concat(['cjs', 'md']);
config.transformer.babelTransformerPath = require.resolve('./markdown-transformer');

// Wrap Expo's transformer to expose imported Markdown as text. Reanimated's
// plugin is handled in root babel.config.js.
module.exports = config;
