import fetchData from './data'

Gerrit.install(plugin => {
  plugin.registerCustomComponent('plugin-overlay', 'fff-controller').onAttached(controller => {
    const app = document.querySelector('gr-app')
    const router = document.querySelector('gr-router')
    const fetchAndInjectData = () => {
      if (['change','diff'].includes(app.params.view)) {
        fetchData({ view: app.params.view, restApi: plugin.restApi }).then(files => {
          controller.view = app.params.view
          controller.files = files
        })
      }
    }

    router.addEventListener('location-change', () => {
      if (controller) {
        fetchAndInjectData({ app, controller, plugin })
      }
    })

    fetchAndInjectData({ app, controller, plugin })
  })
})

