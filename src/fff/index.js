// import $ from 'jquery'
// import createUI from './legacy/ui_controller'
import { discardLeadingSlash } from './legacy/utils'

Gerrit.install(plugin => {
  const app = document.querySelector('gr-app')
  const router = document.querySelector('gr-router')
  const core = {
    isViewingPatchset: () => ['change','diff'].indexOf(app.params.view) > -1
  }

  // const ui = createUI($, core)

  router.addEventListener('location-change', () => {
    controller.view = app.params.view

    // if (!core.isViewingPatchset()) {
    //   ui.unmount()
    // }
  })

  const controller = document.body.appendChild(
    document.createElement('fff-controller')
  )

  plugin.on('showchange', (change, revision) => {
    const chNumber = change._number
    const rvNumber = revision._number

    Promise.all([
      plugin.restApi().get(`/changes/${change.project}~${change._number}/revisions/${revision._number}/files`),
      plugin.restApi().get(`/changes/${change.project}~${change._number}/revisions/${revision._number}/comments`),
    ]).then(([files, comments]) => {
      controller.view = app.params.view
      controller.files = createFileList({
        change,
        comments,
        files,
        revision,
      })

      // ui.render(controller.files)
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