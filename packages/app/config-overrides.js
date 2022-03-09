// config-overrides.js
const { override } = require("customize-cra");
const path = require("path");

const emptyFs = () => (webpackConfig) => ({
  ...webpackConfig,
  node: {
    ...webpackConfig.node,
    fs: "empty",
  },
});

const supportMjs = () => (webpackConfig) => {
  webpackConfig.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: "javascript/auto",
  });
  webpackConfig.resolve = {
    ...webpackConfig.resolve,
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
            "@strata-foundation/marketplace-ui": path.resolve(
              "./node_modules/@strata-foundation/marketplace-ui"
            ),
            "@strata-foundation/marketplace-sdk": path.resolve(
              "./node_modules/@strata-foundation/marketplace-sdk"
            ),
          }
        : {
            "@chakra-ui/react": path.resolve(
              "../../node_modules/@chakra-ui/react"
            ),
            "@strata-foundation/react": path.resolve(
              "../../node_modules/@strata-foundation/react"
            ),
            "@strata-foundation/spl-token-bonding": path.resolve(
              "../../node_modules/@strata-foundation/spl-token-bonding"
            ),
            "@strata-foundation/spl-utils": path.resolve(
              "../../node_modules/@strata-foundation/spl-utils"
            ),
            "@strata-foundation/marketplace-ui": path.resolve(
              "../../node_modules/@strata-foundation/marketplace-ui"
            ),
            "@strata-foundation/marketplace-sdk": path.resolve(
              "../../node_modules/@strata-foundation/marketplace-sdk"
            ),
          }),
    },
  };
  return webpackConfig;
};

module.exports = override(emptyFs(), supportMjs());
