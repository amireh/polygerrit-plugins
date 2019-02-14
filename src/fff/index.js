import $ from 'jquery'
import createUI from './legacy/ui_controller'
import { discardLeadingSlash } from './legacy/utils'

Gerrit.install(plugin => {
  const ui = createUI($, {
    isViewingPatchset: () => true
  })

  plugin.on('showchange', (change, revision) => {
    const chNumber = change._number
    const rvNumber = revision._number

    Promise.all([
      plugin.restApi().get(`/changes/${chNumber}/revisions/${rvNumber}/files`),
      plugin.restApi().get(`/changes/${chNumber}/revisions/${rvNumber}/comments`),
    ]).then(([files, comments]) => {
      ui.render(createFileList({
        change,
        comments,
        files,
        revision,
      }))
    })
  })
})

function createFileList({ change, comments, files, revision }) {
  return Object.keys(files).reduce((acc, abnormalFilePath) => {
    const filePath = discardLeadingSlash(abnormalFilePath);

    let file = acc.find(x => x.filePath === filePath);

    if (!file) {
      file = { filePath: filePath };
      acc.push(file);
    }

    file.url = getUrlForFile({
      change,
      revision,
      file: filePath
    });

    file.comments = comments[abnormalFilePath]

    return acc
  }, []);
}

function getUrlForFile({ change, revision, file }) {
  return (
    `/c/${change.project}/+/${change._number}/${revision._number}/${file}`
  );
}