const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add 'wasm' to Metro's resolver sourceExtensions to support expo-sqlite web compilation
if (!config.resolver.sourceExts.includes("wasm")) {
  config.resolver.sourceExts.push("wasm");
}

module.exports = config;
