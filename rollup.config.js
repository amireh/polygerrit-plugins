const path = require('path')
const commonjs = require('rollup-plugin-commonjs')
const execute = require('./contrib/rollup-plugin-execute')
const polymer = require('./contrib/rollup-plugin-polymer')

const GERRIT_VERSION = '2.15'
const ENT_BUILD      = '1'

const installGerritPlugin = fileName => {
  return `ssh -p 29418 admin@localhost gerrit plugin install '${fileName}'`
}

module.exports = [
  {
    input: 'src/ent/index.js',
    output: {
      file: 'build/ent.js',
      format: 'iife'
    },
    plugins: [
      commonjs(),

      polymer({
        inject: [{ chunk: 'ent.js' }],
        input: 'src/ent/index.html',
        output: `build/ent-${GERRIT_VERSION}-${ENT_BUILD}.html`,
      }),

      execute([
        installGerritPlugin(`/mnt/build/ent-${GERRIT_VERSION}-${ENT_BUILD}.html`)
      ]),
    ]
  },
]
