// config-overrides.js
const { override } = require("customize-cra");
const path = require("path/posix");
const webpack = require("webpack");

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
        // For local dev with linked packages:
        // "@solana/wallet-adapter-react": path.resolve("../../node_modules/@solana/wallet-adapter-react"),
        // "@strata-foundation/react": path.resolve("./node_modules/@strata-foundation/react")
      }
    }
    return webpackConfig;
};

module.exports = override(
    supportMjs()
);  