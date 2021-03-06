const path = require('path')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')

const execute = require('../../contrib/rollup-plugin-execute')
const polymer = require('../../contrib/rollup-plugin-polymer')

const PLUGIN = path.basename(__dirname)
const GERRIT_VERSION = '2.15'
const PLUGIN_VERSION = '1'
const FILENAME = `${PLUGIN}-${GERRIT_VERSION}-${PLUGIN_VERSION}.html`

module.exports = {
  input: path.resolve(__dirname, 'index.js'),
  output: {
    file: `build/${PLUGIN}.js`,
    format: 'iife'
  },
  plugins: [
    nodeResolve(),

    commonjs({
      namedExports: {
        'node_modules/jquery/dist/jquery.min.js': [ 'jquery' ],
      }
    }),

    polymer({
      inject: [{ chunk: `${PLUGIN}.js` }],
      input: path.resolve(__dirname, 'index.html'),
      output: `build/${FILENAME}`,
    }),

    execute([
      `ssh -p 29418 admin@localhost gerrit plugin install '/mnt/build/${FILENAME}'`
    ]),
  ]
}
