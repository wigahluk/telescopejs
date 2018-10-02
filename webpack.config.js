const path = require('path');

const isTest = process.argv.some(a => /\/karma$/.test(a));

const devTool = isTest ? 'inline-source-map' : 'source-map';

const mode = isTest ? 'development' : 'production';
const entry = isTest ? undefined :
  {
    'telescope': './src/index.ts',
    'telescope.min': './src/index.ts'
  };

console.log(isTest, mode);

module.exports = () =>
  ({
    mode: mode,
    entry: entry,
    optimization: {
      minimize: !isTest
    },
    output: {
      path: path.resolve(__dirname, '_bundles'),
      filename: '[name].js',
      libraryTarget: 'umd',
      library: 'Telescope',
      umdNamedDefine: true
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    devtool: devTool,
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'awesome-typescript-loader',
          exclude: /node_modules/,
          query: { declaration: false }
        },
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      ]
    }
  });
