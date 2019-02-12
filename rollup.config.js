import generatePolyGerritHtml from './contrib/rollup/generatePolyGerritHtml'
import execute from './contrib/rollup/execute'

const GERRIT_VERSION = '2.15'
const ENT_BUILD      = '1'

const installGerritPlugin = fileName => {
  return `ssh -p 29418 admin@localhost gerrit plugin install '${fileName}'`
}

export default [
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
      }),

      execute([
        installGerritPlugin(`/mnt/build/ent-${GERRIT_VERSION}-${ENT_BUILD}.html`)
      ])
    ]
  },
]
