const path = require('path')
const commonjs = require('rollup-plugin-commonjs')
const execute = require('../../contrib/rollup-plugin-execute')
const polymer = require('../../contrib/rollup-plugin-polymer')

const PLUGIN = 'ent'
const PLUGIN_VERSION = '1'
const GERRIT_VERSION = '2.15'
const FILENAME = `${PLUGIN}-${GERRIT_VERSION}-${PLUGIN_VERSION}.html`

module.exports = {
  input: path.resolve(__dirname, 'index.js'),
  output: {
    file: `build/${PLUGIN}.js`,
    format: 'iife'
  },
  plugins: [
    commonjs(),

    polymer({
      input: path.resolve(__dirname, 'index.html'),
      output: `build/${FILENAME}`,
    }),

    execute([
      `ssh -p 29418 admin@localhost gerrit plugin install '/mnt/build/${FILENAME}'`
    ]),
  ]
}
