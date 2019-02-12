const path = require('path');
const pretty = require('pretty');
const { writeFile } = require('fs');

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
module.exports = function generatePolyGerritHtml({ chunk, name, output }) {
  return {
    name: 'generate-polygerrit-html',
    writeBundle(chunkInfo) {
      return new Promise((resolve, reject) => {
        const template = pretty(`
          <dom-module>
            <script>
              ${chunkInfo[chunk].code}
            </script>
          </dom-module>
        `)

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
