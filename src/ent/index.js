import './elements/gr-change-list.js'
import './elements/gr-change-list-view.js'
import './elements/gr-dashboard-view.js'

Gerrit.install(plugin => {
  let view

  try {
    view = document.querySelector('gr-change-list-view')

    if (view) {
      return view._paramsChanged(view.params)
    }

    view = document.querySelector('gr-dashboard-view')

    if (view) {
      return view._userChanged(view.params.user)
    }
  }
  catch (e) {
    console.error('ent: setup failed')
    console.error(e)
  }
});
