const glob = require("glob");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const launchesData = require("./launches.json");
function isArchive(date) {
  const currentDate = new Date();
  const epsilon2DayTime = 180000000;
  return currentDate.getTime() - date.getTime() > epsilon2DayTime;
}

const futurLaunches = launchesData.launches.filter(
  (launch) => !isArchive(new Date(launch.launchWindow.endUTC))
);
const nextLaunch = futurLaunches.length == 0 ? null : futurLaunches[0];

const formattedDate = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(new Date(nextLaunch.launchWindow.beginUTC));

const formattedTime =
  nextLaunch.launchWindow.beginUTC == nextLaunch.launchWindow.endUTC
    ? null
    : new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        hour: "numeric",
        minute: "numeric",
        // timeZoneName: "long"
      }).format(new Date(nextLaunch.launchWindow.beginUTC));

const nextLaunchTitle = nextLaunch
  ? `${nextLaunch.title}`
  : "Lancements de fusées, vaisseaux spatiaux ou événements spatiaux.";
const nextLaunchDescription = nextLaunch
  ? `Lancement potentiel le ${formattedDate}${
      formattedTime ? " \nà " + formattedTime + " heure de Paris" : ""
    }.\n${nextLaunch.description}` : "";

module.exports = {
  mode: "production",
  entry: "./src/js/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, "src/scss"),
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src/css"),
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        include: path.resolve(__dirname, "src/img"),
        type: "asset/resource",
      },
    ],
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.lightningCssMinify,
        minimizerOptions: {
          cssModules: true,
        },
      }),
      new TerserPlugin(),
    ],
    minimize: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "bundle.css",
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(path.join(__dirname, "src/**/*"), { nodir: true }),
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      meta: {
        card_type: {
          property: "og:type",
          content: "website",
        },
        card_title: {
          property: "og:title",
          content: nextLaunchTitle,
        },
        card_description: {
          property: "og:description",
          content: nextLaunchDescription,
        },
        card_image: {
          property: "og:image",
          content: "https://space.magicorp.fr/thumb.png",
        },
        card_image_type: {
          name: "twitter:card",
          content: "summary_large_image",
        },
        card_url: {
          property: "og:url",
          content: "https://space.magicorp.fr/",
        },
      },
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
    }),
  ],
};
