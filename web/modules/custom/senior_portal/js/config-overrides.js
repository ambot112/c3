// config-overrides.js
const { override, overrideDevServer } = require('customize-cra');

const removeHashFromFilenames = () => (config) => {
  if (config.mode === 'production') {
    config.output.filename = 'static/js/[name].js';
    config.output.chunkFilename = 'static/js/[name].chunk.js';

    const cssPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin'
    );

    if (cssPlugin) {
      cssPlugin.options.filename = 'static/css/[name].css';
      cssPlugin.options.chunkFilename = 'static/css/[name].chunk.css';
    }
  }
  return config;
};

module.exports = override(removeHashFromFilenames());
