import resolveParameters from './params'
import { setProperties } from './ext/polymer'

Gerrit.install(plugin => {
  plugin.registerCustomComponent('plugin-overlay', 'fff-controller').onAttached(controller => {
    const app = document.querySelector('gr-app')
    const router = document.querySelector('gr-router')
    const restApi = plugin.restApi()

    const resolveAndInjectParameters = () => {
      const currentView = app.params.view

      if (['change','diff'].includes(currentView)) {
        resolveParameters({ currentView, restApi }).then(params => {
          setProperties(controller, {
            changeNum: params.changeNum,
            comments: params.comments,
            files: params.files,
            patchNum: params.patchNum,
            project: params.project,
            view: currentView
          })
        })
      }
    }

    router.addEventListener('location-change', () => {
      // always pass it the current view so that it can hide on non-applicable
      // views
      controller.view = app.params.view

      Polymer.RenderStatus.afterNextRender(app, () => {
        resolveAndInjectParameters()
      })
    })

    resolveAndInjectParameters()
  })
})

