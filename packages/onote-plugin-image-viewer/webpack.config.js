const path = require("path");

module.exports = {
  entry: {
    main: "./src/main/index.ts",
    imageviewer: "./src/image-viewer/index.tsx",
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  externals: {
    // react: "React",
    // "react-dom": "ReactDOM",
    "monaco-editor": "monaco",
  },
};
