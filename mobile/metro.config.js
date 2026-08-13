const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude temporary debugger frontend folders from Metro watcher on Windows
config.resolver.blockList = [
  /.*node_modules\/@react-native\/\.debugger-frontend-.*/,
];

module.exports = config;
