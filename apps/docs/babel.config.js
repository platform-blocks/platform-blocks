module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Ensure React refresh is enabled
      process.env.NODE_ENV !== 'production' && 'react-refresh/babel',
      // Worklets (replaces old reanimated plugin) MUST be last
      'react-native-worklets/plugin'
    ].filter(Boolean),
  };
};
