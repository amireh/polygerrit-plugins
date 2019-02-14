import monkeyPatchGrChangeList from './elements/gr-change-list.js'
import monkeyPatchGrChangeListView from'./elements/gr-change-list-view.js'
import monkeyPatchGrDashboardView from './elements/gr-dashboard-view.js'

const canInstall = () => {
  const footer = document.querySelector('footer.gr-app[r=contentinfo]')

  if (footer) {
    return /Powered by Gerrit Code Review \(2\.15\.7\)/.test(footer.innerText)
  }
  else {
    return false
  }
}

Gerrit.install(plugin => {
  if (!window.Polymer || !canInstall()) { return; } // Only supported in PolyGerrit.
  if (!canInstall()) {
    console.warn('ent: this version of Gerrit not supported')
    return
  }

  let view

  try {
    monkeyPatchGrChangeList()
    monkeyPatchGrChangeListView()
    monkeyPatchGrDashboardView()

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
