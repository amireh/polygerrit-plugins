const $ = require('cheerio')
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

      this.addWatchFile(input)

      return load(input).then(({ elements, imports }) => {
        state.elements = elements

        imports.forEach(file => {
          this.addWatchFile(file)
        })
      })
    },

    writeBundle(chunkInfo) {
      return new Promise((resolve, reject) => {
        const injections = inject.map(({ chunk }) => {
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

const load = file => readFileP(file).then(buffer => {
  const { elements, imports } = parse({ file, html: buffer.toString('utf8') })

  if (imports.length === 0) {
    return { elements, imports }
  }
  else {
    return loadAndAggregate(imports).then(result => {
      return ({
        elements: result.elements.concat(elements),
        imports: imports.concat(result.imports),
      })
    })
  }
})

const loadAndAggregate = (files) => {
  let elements = []
  let imports = []

  const loadAt = (cursor) => {
    const file = files[cursor]

    if (!file) {
      return Promise.resolve({ elements, imports })
    }
    else {
      return load(file).then(result => {
        elements = elements.concat(result.elements)
        imports  = imports.concat(result.imports)

        return loadAt(cursor + 1)
      })
    }
  }

  return loadAt(0)
}

const parse = ({ file, html }) => {
  const elements = []
  const imports = []

  $(html).each(function(index, node) {
    if (node.type === 'tag' && node.name === 'link' && $(node).attr('rel') === 'import') {
      imports.push(
        path.resolve(path.dirname(file), $(node).attr('href'))
      )
    }
    else {
      elements.push(node)
    }
  })

  return { elements, imports }
}

const readFileP = promisify(readFile)