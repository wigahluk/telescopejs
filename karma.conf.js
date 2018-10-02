// Karma configuration

const isDevMode = process.argv.indexOf('-dev') >= 0;
const reporters = ['dots'];
const preprocesors = ['webpack', 'sourcemap'];

// If not running interactive tests, add coverage reporter
if (!isDevMode) reporters.push('coverage');
if (!isDevMode) reporters.push('remap-coverage');

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: './src/entry.spec.js', watched: false }
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './src/entry.spec.js': preprocesors,
    },

    webpack: {
      resolve: {
        extensions: ['.ts', '.js']
      },
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.ts$/,
            loader: 'awesome-typescript-loader',
            exclude: /node_modules/,
            query: { declaration: false }
          },
          {
            test: /\/[^\.]+\.ts$/,
            enforce: "post",
            use: [
              {
                loader: 'istanbul-instrumenter-loader'
              }
            ]
          }
        ]
      }
    },

    webpackMiddleware: {
      stats: 'errors-only'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: reporters,

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: isDevMode? ['Chrome'] : ['ChromeHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: !isDevMode,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // Coverage Reporters
    coverageReporter: {
      type: 'in-memory'
    },

    remapCoverageReporter: {
      'text-summary': null,
      html: './coverage/html',
      cobertura: './coverage/cobertura.xml'
    }

  })
};
