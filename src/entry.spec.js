// Test loader configuration
// load all specs in ./src
const context = require.context('.', true, /\.spec\.ts$/);
context.keys().map(context);
