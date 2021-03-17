const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: { main: path.resolve(__dirname, "./test/index.ts") },
  output: {
    path: path.resolve(__dirname, "./test/dist"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "html-loader",
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "test/index.html",
    }),
  ],
  resolve: {
    extensions: [".ts", ".js"],
  },
};
