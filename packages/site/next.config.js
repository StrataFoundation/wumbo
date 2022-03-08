const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      os: false,
    };

    config.resolve.extensions.push(".mjs");

    config.module.rules.push({
      test: /\.m?js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve("../../node_modules/react"),
      "@solana/wallet-adapter-react": path.resolve(
        "../../node_modules/@solana/wallet-adapter-react"
      ),
      "@toruslabs/solana-embed": path.resolve(
        "../../node_modules/@toruslabs/solana-embed"
      ),
      "@chakra-ui/react": path.resolve("../../node_modules/@chakra-ui/react"),
      // For local dev with linked packages:
      ...(process.env.NEXT_PUBLIC_LINKED_DEV === "true"
        ? {
            "@strata-foundation/react": path.resolve(
              "./node_modules/@strata-foundation/react"
            ),
            "@strata-foundation/spl-token-bonding": path.resolve(
              "./node_modules/@strata-foundation/spl-token-bonding"
            ),
            "@strata-foundation/spl-token-collective": path.resolve(
              "./node_modules/@strata-foundation/spl-token-collective"
            ),
            "@strata-foundation/spl-utils": path.resolve(
              "./node_modules/@strata-foundation/spl-utils"
            ),
          }
        : {}),
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/app/:path*",
        destination: `${process.env.NEXT_PUBLIC_APP_REDIRECT_URL}/:path*`,
        permanent: false,
      },
    ];
  },
};
