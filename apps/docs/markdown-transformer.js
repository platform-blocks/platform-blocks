const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports = {
  ...upstreamTransformer,
  transform({ filename, src, ...rest }) {
    return upstreamTransformer.transform({
      filename,
      src: filename.endsWith('.md') ? `export default ${JSON.stringify(src)};` : src,
      ...rest,
    });
  },
};
