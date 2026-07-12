const { getDefaultConfig } = require("expo/metro-config");
const { FileStore } = require("metro-cache");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add 'wasm' to Metro's resolver assetExtensions
if (!config.resolver.assetExts.includes("wasm")) {
  config.resolver.assetExts.push("wasm");
}

// Redirect Metro build cache to a local directory in the project (Drive D) to avoid C drive ENOSPC errors
config.cacheStores = [
  new FileStore({
    root: path.join(__dirname, ".metro-cache"),
  }),
];

// Enhance server middleware with COOP and COEP headers to enable SharedArrayBuffer in the browser (needed for SQLite)
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
