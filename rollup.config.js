const path = require('path')
const generatePolyGerritHtml = require('./contrib/rollup/generatePolyGerritHtml')
const execute = require('./contrib/rollup/execute')
const commonjs = require('rollup-plugin-commonjs')

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
      generatePolyGerritHtml({
        chunk: 'ent.js',
        name: 'ent',
        output: `build/ent-${GERRIT_VERSION}-${ENT_BUILD}.html`,
        html: path.resolve(__dirname, 'src/ent/index.html'),
        style: path.resolve(__dirname, 'src/ent/index.css'),
      }),

      execute([
        installGerritPlugin(`/mnt/build/ent-${GERRIT_VERSION}-${ENT_BUILD}.html`)
      ]),

      commonjs()
    ]
  },
]
