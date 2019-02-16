export default ({ currentView, restApi }) => {
  return [ 'changeInfo', 'files', 'comments' ].reduce(function(service, param) {
    return service.then(state => {
      const paramResolvers = [].concat(resolvers[param])
      const tryNext = () => {
        const resolver = paramResolvers.shift()

        if (!resolver) {
          return Promise.reject(`unable to retrieve "${param}"`)
        }
        else if (!resolver.when(state)) {
          return tryNext()
        }
        else {
          return resolver.then(state).then(null, tryNext)
        }
      }

      return tryNext().then(resolved => {
        return Object.assign(state, resolved)
      }, tryNext)
    })
  }, Promise.resolve({ currentView, restApi }))
}

const didResolveParameters = required => supplied => (
  required.every(param => supplied.hasOwnProperty(param))
)

const resolvers = {
  changeInfo: [
    {
      when: ({ currentView }) => currentView === 'change',
      then: () => tryTo('grab change from "gr-change-view"', () => {
        const changeView = document.querySelector('gr-change-view');

        if (changeView && changeView._change) {
          return {
            changeNum:  String(changeView._change._number),
            patchNum:   String(changeView._change.revisions[changeView._change.current_revision]._number),
            project:    changeView._change.project,
          }
        }
        else {
          return tryTo.again
        }
      })
    },

    {
      when: ({ currentView }) => currentView === 'diff',
      then: () => tryTo('grab change from "gr-diff-view"', () => {
        const diffView = document.querySelector('gr-diff-view');

        if (diffView && diffView._change) {
          return {
            changeNum: String(diffView._change._number),
            patchNum:  String(diffView._change.revisions[diffView._change.current_revision]._number),
            project:   diffView._change.project,
          }
        }
        else {
          return tryTo.again
        }
      })
    },

    // grab directly from the router
    {
      when: () => {
        const appView = document.querySelector('gr-app')

        return (
          appView &&
          typeof appView.params.changeNum === 'string' &&
          typeof appView.params.patchNum === 'string' &&
          typeof appView.params.project === 'string'
        )
      },
      then: () => Promise.resolve(document.querySelector('gr-app').params)
    },
  ],

  files: [
    // grab it from gr-change-view
    {
      when: ({ currentView }) => currentView === 'change',
      then: () => tryTo('grab fileList from gr-change-view', () => {
        const view = document.querySelector('gr-change-view')

        if (view && view.$ && view.$.fileList && Array.isArray(view.$.fileList._files)) {
          return { files: view.$.fileList._files.map(x => x.__path) }
        }
        else {
          return tryTo.again
        }
      })
    },

    // grab from gr-diff-view
    {
      when: ({ currentView }) => currentView === 'diff',
      then: () => tryTo('grab fileList from gr-diff-view', () => {
        const view = document.querySelector('gr-diff-view')

        if (view && view._change && view._fileList) {
          return {
            files: view._fileList
          }
        }
        else {
          return tryTo.again
        }
      })
    },

    // grab from API
    {
      when: didResolveParameters(['changeNum', 'patchNum', 'project', 'restApi']),
      then: ({ changeNum, patchNum, project, restApi }) => {
        return restApi.get(
          `/changes/${project}~${changeNum}/revisions/${patchNum}/files`
        ).then(files => ({ files }))
      }
    }
  ],

  comments: [
    {
      when: ({ currentView }) => currentView === 'change',
      then: () => tryTo('grab fileList from gr-change-view', () => {
        const view = document.querySelector('gr-change-view')

        if (view && view._comments) {
          return { comments: view._comments }
        }
        else {
          return tryTo.again
        }
      })
    },

    // grab from API
    {
      when: didResolveParameters(['changeNum', 'patchNum', 'project', 'restApi']),
      then: ({ changeNum, patchNum, project, restApi }) => {
        return restApi.get(
          `/changes/${project}~${changeNum}/revisions/${patchNum}/comments`
        ).then(comments => ({ comments }))
      }
    }
  ]
}

const again = {}
const tryTo = (message, fn) => {
  return new Promise((resolve, reject) => {
    let abortTimer, checker

    abortTimer = setTimeout(() => {
      clearInterval(checker)
      reject(`timed out trying to: "${message}"`)
    }, 500)

    checker = setInterval(() => {
      const value = fn()

      if (value !== again) {
        clearTimeout(abortTimer)
        clearInterval(checker)

        resolve(value)
      }
    }, 50)
  })
}

tryTo.again = again
