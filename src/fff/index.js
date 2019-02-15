import { discardLeadingSlash } from './legacy/utils'

Gerrit.install(plugin => {
  const app = document.querySelector('gr-app')
  const router = document.querySelector('gr-router')

  let controller

  plugin.registerCustomComponent('plugin-overlay', 'fff-controller').onAttached(controllerInstance => {
    controller = controllerInstance
    controller.view = app.params.view
  })

  router.addEventListener('location-change', () => {
    if (controller) {
      controller.view = app.params.view
    }
  })

  plugin.on('showchange', (change, revision) => {
    const chNumber = change._number
    const rvNumber = revision._number

    Promise.all([
      plugin.restApi().get(`/changes/${change.project}~${change._number}/revisions/${revision._number}/files`),
      plugin.restApi().get(`/changes/${change.project}~${change._number}/revisions/${revision._number}/comments`),
    ]).then(([files, comments]) => {
      if (!controller) {
        return
      }

      controller.view = app.params.view
      controller.files = createFileList({
        change,
        comments,
        files,
        revision,
      })
    })
  })
})

function createFileList({ change, comments, files, revision }) {
  return Object.keys(files).reduce((acc, abnormalFilePath) => {
    const filePath = discardLeadingSlash(abnormalFilePath);

    let file = acc.find(x => x.filePath === filePath);

    if (!file) {
      file = {
        name: basename(filePath),
        path: filePath,
      };

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

function basename(path) {
  return path.slice(path.lastIndexOf('/') + 1)
}
