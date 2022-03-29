const CracoEsbuildPlugin = require("craco-esbuild");
const path = require("path");

module.exports = {
  plugins: [
    {
      plugin: CracoEsbuildPlugin,
      options: {
        includePaths: ["/external/dir/with/components"], // Optional. If you want to include components which are not in src folder
        esbuildLoaderOptions: {
          // Optional. Defaults to auto-detect loader.
          loader: "tsx", // Set the value to 'tsx' if you use typescript
          target: "es2015",
        },
        esbuildMinimizerOptions: {
          // Optional. Defaults to:
          target: "es2015",
          css: true, // if true, OptimizeCssAssetsWebpackPlugin will also be replaced by esbuild.
        },
        skipEsbuildJest: false, // Optional. Set to true if you want to use babel for jest tests,
        esbuildJestOptions: {
          loaders: {
            ".ts": "ts",
            ".tsx": "tsx",
          },
        },
      },
    },
  ],
  webpack: {
    configure: {
      node: {
        fs: "empty",
      },
      module: {
        rules: [
          {
            test: /\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto",
          },
        ],
      },
      resolve: {
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
      },
    },
  },
};
