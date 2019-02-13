const path = require('path');
const pretty = require('pretty');
const { readFile, writeFile } = require('fs');

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
module.exports = function generatePolyGerritHtml({ chunk, html, name, output, style }) {
  const buffers = { html: null, style: null }
  const generateTemplate = (params) => {
    if (buffers.html) {
      return (
        buffers.html
          .replace('{{ params.name }}', params.name)
          .replace('{{ params.style }}', params.style)
          .replace('{{ params.script }}', params.script)
      )
    }
    else {
      return `
        <dom-module>
          <script>
            ${params.script}
          </script>

          <style>
            ${params.style}
          </style>
        </dom-module>
      `
    }
  }

  return {
    name: 'generate-polygerrit-html',
    transform() {
      const plugin = this;

      const reads = [
        { file: style, name: 'style' },
        { file: html, name: 'html' }
      ].map(({ file, name }) => {
        if (!file) {
          return Promise.resolve()
        }
        else {
          plugin.addWatchFile(file)

          return new Promise((resolve, reject) => {
            readFile(file, (err, buffer) => {
              if (err) {
                reject(err)
              }
              else {
                buffers[name] = buffer.toString('utf8')
                resolve()
              }
            })
          })
        }
      })

      return Promise.all(reads).then(() => null)
    },

    writeBundle(chunkInfo) {
      return new Promise((resolve, reject) => {
        const template = pretty(generateTemplate({
          name,
          style: buffers.style || '',
          script: chunkInfo[chunk].code
        }))

        // const template = pretty(`
        //   <dom-module>
        //     ${buffers.html || ''}

        //     <script>
        //       ${chunkInfo[chunk].code}
        //     </script>

        //     <style>
        //       ${buffers.style || ''}
        //     </style>
        //   </dom-module>
        // `)

        writeFile(output, template, 'utf8', function(writeErr) {
          if (writeErr) {
            reject(writeErr)
          }
          else {
            resolve()
          }
        })
      })
    }
  }
}
