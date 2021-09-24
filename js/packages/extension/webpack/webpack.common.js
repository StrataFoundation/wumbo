const webpack = require("webpack");
const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");
const { ESBuildMinifyPlugin } = require("esbuild-loader");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  entry: {
    popup: path.join(srcDir, "/pages/popup/index.tsx"),
    background: path.join(srcDir, "/pages/background/background.ts"),
    content_script: path.join(srcDir, "pages/content/index.tsx"),
    oauth: path.join((srcDir, "pages/oauth/index.tsx")),
    wallet_proxy: path.join((srcDir, "pages/wallet-proxy/index.ts")),
  },
  output: {
    path: path.join(__dirname, "../dist"),
    filename: "[name].js",
  },
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        target: "es2015",
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "esbuild-loader",
        options: {
          loader: "tsx",
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: [{ removeViewBox: false }],
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    fallback: { fs: false },
    plugins: [new TsconfigPathsPlugin()],
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      react: path.resolve("../../node_modules/react"),
      "@solana/wallet-ledger": path.resolve(
        "../../node_modules/@solana/wallet-ledger/dist/lib/index.js"
      ),
    },
  },
  plugins: [
    new webpack.EnvironmentPlugin([
      'REACT_APP_NFT_VERIFIER_TLD',
      'REACT_APP_NFT_VERIFIER',
      'REACT_APP_TROPHY_CREATOR',
      'REACT_APP_TWITTER_REGISTRAR_SERVER_URL',
      'REACT_APP_WUM_BONDING',
      'REACT_APP_WUM_TOKEN',
      'REACT_APP_WUMBO_INSTANCE_KEY',
      'REACT_APP_SOLANA_API_URL',
      'REACT_APP_IS_DEV',
      'REACT_APP_TWITTER_TLD',
      'REACT_APP_TWITTER_VERIFIER',
      'REACT_APP_NFT_VERIFIER_URL',
      'REACT_APP_WUMBO_API_URL'
    ]),
    new NodePolyfillPlugin(),
    new CopyPlugin({
      patterns: [{ from: ".", to: ".", context: "public" }],
      options: {},
    }),
  ],
};
