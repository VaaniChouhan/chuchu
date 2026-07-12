const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add 'wasm' to Metro's resolver assetExtensions instead of sourceExtensions
// to prevent Metro from trying to parse binary WebAssembly files as source code
if (!config.resolver.assetExts.includes("wasm")) {
  config.resolver.assetExts.push("wasm");
}

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
