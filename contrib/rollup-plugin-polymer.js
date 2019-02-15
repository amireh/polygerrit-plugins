const $ = require('cheerio')
const arrayFlatten = require('array-flatten')
const path = require('path');
const pretty = require('pretty');
const { readFile, readFileSync, writeFile } = require('fs');
const { promisify } = require('util')

// Generate the plugin entry HTML file for PolyGerrit for some JS chunk.
//
//    <dom-module id="my-plugin">
//      <script>
//        ... emitted chunk source code ...
//      </script>
//    </dom-module>
//
// See https://gerrit-review.googlesource.com/Documentation/pg-plugin-dev.html#loading
// See https://gerrit-review.googlesource.com/Documentation/dev-plugins.html#deployment
module.exports = function polymer({ input, inject = [], output }) {
  const state = { elements: null }

  return {
    name: 'rollup-plugin-polymer',

    buildStart() {
      state.elements = []

      return loadAndAggregate(input).then(({ elements, sources }) => {
        state.elements = elements

        Object.keys(sources).forEach(file => {
          this.addWatchFile(file)
        })
      })
    },

    writeBundle(chunkInfo) {
      return new Promise((resolve, reject) => {
        const injections = inject.map(({ chunk }) => {
          if (!chunkInfo[chunk]) {
            return reject(new Error(`rollup-plugin-polyer: chunk "${chunk}" was not emitted!`))
          }

          return `
            <dom-module>
              <script>
                ${chunkInfo[chunk].code}
              </script>
            </dom-module>
          `
        })

        const bundle = pretty($.html(state.elements) + injections.join("\n\n"))

        writeFile(output, bundle, 'utf8', function(writeErr) {
          if (writeErr) {
            reject(writeErr)
          }
          else {
            resolve()
          }
        })
      })
    },
  }
}

const loadAndAggregate = file => load(file).then(results => (
  arrayFlatten(results).reduce((acc, { element, source }) => {
    acc.elements.push(element)
    acc.sources[source] = true

    return acc
  }, { elements: [], sources: {} })
))

const load = file => readFileP(file).then(buffer => Promise.all(
  $(buffer.toString('utf8')).toArray().map(node => {
    if (node.name === 'link' && $(node).attr('rel') === 'import') {
      return load(path.resolve(path.dirname(file), $(node).attr('href')))
    }
    else {
      return Promise.resolve({ element: node, source: file })
    }
  })
))

const readFileP = promisify(readFile)