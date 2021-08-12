const defineConfig = require("windicss/helpers").defineConfig;
const forms = require("windicss/plugin/forms");

module.exports = defineConfig({
  extract: {
    include: ["src/**/*.{tsx,css}", "../common/src/**/*.{tsx,ts,css}", "public/**/*.html"],
  },
  darkMode: false,
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
        infinity: 9999999,
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
  plugins: [forms],
});
