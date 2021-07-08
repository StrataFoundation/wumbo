const defineConfig = require("windicss/helpers").defineConfig;
const forms = require("windicss/plugin/forms");

module.exports = defineConfig({
  extract: {
    include: ["src/**/*.{tsx,css}", "public/**/*.html"],
  },
  darkMode: false,
  plugins: [forms],
  theme: {
    extend: {
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
    },
  },
});
