const { override, fixBabelImports, addWebpackAlias } = require("customize-cra");
const path = require("path");

module.exports = override(
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true,
  }),
  addWebpackAlias({
    layouts: path.resolve(__dirname, "./src/app/layouts"),
    components: path.resolve(__dirname, "./src/app/components"),
    utils: path.resolve(__dirname, "./src/app/utils"),
  }),
);
