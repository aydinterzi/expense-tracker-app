const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Performance optimizations
config.resolver.platforms = ["ios", "android", "web"];

// Enable caching for better performance
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Optimize bundle splitting
config.serializer.customSerializer =
  config.serializer.customSerializer || (() => {});

// Bundle optimization
config.transformer.enableBabelRCLookup = false;
config.transformer.enableBabelRuntime = false;

// Asset optimization
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  "bin",
  "txt",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "ttf",
  "otf",
  "woff",
  "woff2",
];

// Performance monitoring
if (process.env.NODE_ENV === "development") {
  config.reporter = {
    update: (event) => {
      if (event.type === "bundle_build_done") {
        console.log(`📦 Bundle built in ${event.buildTime}ms`);
      }
    },
  };
}

module.exports = config;
