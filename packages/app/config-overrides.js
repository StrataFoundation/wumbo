const path = require("path");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");

module.exports = function override(config, env) {
  //do stuff with the webpack config...

  // disable ModuleScopePlugin
  config.resolve.plugins = config.resolve.plugins.filter(
    (plugin) => !(plugin instanceof ModuleScopePlugin)
  );

  // emptyFs
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    os: require.resolve("os-browserify/browser"),
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
  };

  // supportMjs
  config.module.rules.push({
    test: /\.mjs$/,
    include: "/node_modules/",
    type: "javascript/auto",
  });

  config.resolve = {
    ...config.resolve,
    alias: {
      react: path.resolve("../../node_modules/react"),
      "@solana/wallet-adapter-react": path.resolve(
        "../../node_modules/@solana/wallet-adapter-react"
      ),
      "@toruslabs/solana-embed": path.resolve(
        "../../node_modules/@toruslabs/solana-embed"
      ),
      // For local dev with linked packages:
      ...(process.env.LINKED_DEV
        ? {
            "@chakra-ui/react": path.resolve(
              "../../node_modules/@chakra-ui/react"
            ),
            "@strata-foundation/react": path.resolve(
              "./node_modules/@strata-foundation/react"
            ),
            "@strata-foundation/spl-token-bonding": path.resolve(
              "./node_modules/@strata-foundation/spl-token-bonding"
            ),
            "@strata-foundation/spl-utils": path.resolve(
              "./node_modules/@strata-foundation/spl-utils"
            ),
          }
        : {}),
    },
  };

  config.ignoreWarnings = [{ message: /source-map-loader/ }];

  return config;
};
