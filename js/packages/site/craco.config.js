const windiCSSCracoPlugin = require("windicss-craco-plugin");

module.exports = {
  plugins: [
    {
      plugin: windiCSSCracoPlugin,
      options: {
        scan: {
          dirs: ["./"],
          exclude: ["node_modules", ".git", "public/index.html"],
        },
      },
    },
  ]
};
