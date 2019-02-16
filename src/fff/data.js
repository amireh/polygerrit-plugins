export default ({ view, restApi }) => {
  const dumpError = error => {
    console.warn('fff: unable to fetch data because:', error)

    throw error;
  }

  if (view === 'change') {
    return stealDataFromChangeView().then(createFileList, dumpError)
  }
  else if (view === 'diff') {
    return stealDataFromDiffView({ restApi }).then(createFileList, dumpError)
  }
  else {
    return Promise.reject(`fff: view "${view}" is not applicable`)
  }
}

const stealDataFromChangeView = () => {
  return waitForElement('gr-change-view').then(changeView => {
    const change = changeView._change
    const revision = change.revisions[change.current_revision]

    return {
      change,
      comments: changeView._comments,
      fileList: changeView.$.fileList._files.map(x => x.__path),
      revision,
    }
  })
}

const stealDataFromDiffView = ({ restApi }) => {
  return waitForElement('gr-diff-view').then(diffView => {
    const change = diffView._change
    const revision = change.revisions[change.current_revision]
    const commentsUrl = `/changes/${change.project}~${change._number}/revisions/${revision._number}/comments`

    return restApi().get(commentsUrl).then(comments => ({
      change,
      comments,
      fileList: diffView._fileList,
      revision,
    }))
  })
}

const waitForElement = selector => {
  return new Promise((resolve, reject) => {
    let timeout, checker

    timeout = setTimeout(() => {
      clearInterval(checker)
      reject(`timeout waiting for element "${selector}"`)
    }, 500)

    checker = setInterval(() => {
      const element = document.querySelector(selector)

      if (element) {
        clearTimeout(timeout)
        clearInterval(checker)

        resolve(element)
      }
    })
  })
}

function createFileList({ change, comments, fileList, revision }) {
  return fileList.reduce((acc, abnormalFilePath) => {
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

function discardLeadingSlash(s) {
  return s.replace(/^\//, '');
}

function getUrlForFile({ change, revision, file }) {
  return (
    `/c/${change.project}/+/${change._number}/${revision._number}/${file}`
  );
}

function basename(path) {
  return path.slice(path.lastIndexOf('/') + 1)
}
