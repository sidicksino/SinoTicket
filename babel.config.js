module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // babel-preset-expo now auto-detects and injects react-native-worklets/plugin
    // (the reanimated 4 / New Architecture transform) since the package is
    // installed, so the old manual "react-native-reanimated/plugin" entry is
    // redundant and risks a duplicate transform.
  };
};