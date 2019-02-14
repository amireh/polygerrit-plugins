const path = require('path')
const glob = require('glob')

module.exports = glob.sync(
  path.resolve(__dirname, 'src/*/rollup.config.js')
).map(require)
