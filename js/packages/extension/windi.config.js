const defineConfig = require("windicss/helpers").defineConfig;
const forms = require("windicss/plugin/forms");
const animations = require("@windicss/animations")({
  settings: {
    animatedSpeed: 1000,
    heartBeatSpeed: 1000,
    hingeSpeed: 2000,
    bounceInSpeed: 750,
    bounceOutSpeed: 750,
    animationDelaySpeed: 1000,
  },
});

module.exports = defineConfig({
  prefix: "wum-",
  extract: {
    include: ["src/**/*.{tsx,css}", "../common/src/**/*.{tsx,ts,css}", "public/**/*.html"],
    exclude: ["node_modules/**/*", ".git/**/*"],
  },
  darkMode: false,
  plugins: [animations, forms],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: (_theme) => ({
        "beta-splash-hero-pattern": "url('/src/assets/images/bg/beta-splash@2x.png')",
      }),
      height: {
        "560px": "560px",
      },
      maxWidth: {
        "340px": "340px",
      },
      width: {
        "340px": "340px",
      },
      fontSize: {
        xxs: ".675rem",
      },
      colors: {
        twitter: "#1DA1F2",
      },
      zIndex: {
        infinity: 999999999,
      },
    },
    fontFamily: {
      sans: [
        "avenir",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "Noto Sans",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji",
      ],
    },
  },
});
