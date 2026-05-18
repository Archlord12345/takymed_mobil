const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    path.resolve(__dirname, '../shared'),
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
    ],
    extraNodeModules: new Proxy({}, {
      get: (target, name) => {
        if (name === '@shared') {
          return path.resolve(__dirname, '../shared');
        }
        return path.resolve(__dirname, 'node_modules', name);
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
