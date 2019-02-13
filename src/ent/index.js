import { analyze } from './logic'
import MonkeyPatchGrChangeList from './elements/gr-change-list.js'
import MonkeyPatchGrChangeListView from './elements/gr-change-list-view.js'
import MonkeyPatchGrDashboardView from './elements/gr-dashboard-view.js'

const tryCatch = (message, f) => {
  try {
    return f()
  }
  catch (e) {
    console.warn(`gr-ent: ${message}`)
    console.warn(e)

    return null
  }
}

const monkeyPatch = () => {
  MonkeyPatchGrChangeList()
  MonkeyPatchGrChangeListView()
  MonkeyPatchGrDashboardView()

  // const GrChangeListView = document.createElement('gr-change-list-view').constructor.prototype
  // // const GrChangeList = document.createElement('gr-change-list').constructor.prototype
  // const GrDashboardView = document.createElement('gr-dashboard-view').constructor.prototype

  // const { _getChanges } = GrChangeListView

  // GrChangeListView._getChanges = function() {
  //   console.log('gr-ent: hijacked _getChanges')

  //   const { restAPI } = this.$;
  //   const options = restAPI.listChangesOptionsToHex(
  //     restAPI.ListChangesOption.LABELS,
  //     restAPI.ListChangesOption.DETAILED_ACCOUNTS,
  //     restAPI.ListChangesOption.CURRENT_COMMIT,
  //     restAPI.ListChangesOption.CURRENT_REVISION,
  //   )

  //   console.log('gr-ent: change options:', options)

  //   return restAPI.getChanges(
  //     this._changesPerPage,
  //     this._query,
  //     this._offset,
  //     options
  //   );
  // }

  // Object.defineProperty(GrDashboardView, 'options', {
  //   value: GrDashboardView.listChangesOptionsToHex(
  //     GrDashboardView.ListChangesOption.CURRENT_COMMIT,
  //     GrDashboardView.ListChangesOption.CURRENT_REVISION,
  //     GrDashboardView.ListChangesOption.DETAILED_ACCOUNTS,
  //     GrDashboardView.ListChangesOption.LABELS,
  //     GrDashboardView.ListChangesOption.REVIEWED,
  //   )
  // })

  // GrChangeList._ent_changesDidChange = function(changes) {
  //   console.log('gr-ent: GrChangeList#changesDidChange')

  //   if (!changes || changes.some(x => !x.revisions)) {
  //     console.warn('gr-ent: cannot render tree since revisions were not fetched')
  //     return
  //   }

  //   Polymer.RenderStatus.afterNextRender(this, () => {
  //     // doThing({ changes, rootDOMNode: this.$.changeList })
  //     this._ent_render()
  //   })
  // }

  // GrChangeList._ent_sectionsDidChange = function(sections) {
  //   console.log('gr-ent: GrChangeList#sectionsDidChange', sections)

  //   sections.forEach(({ results: changes }) => {
  //     if (!changes || changes.some(x => !x.revisions)) {
  //       console.warn('gr-ent: cannot render tree since revisions were not fetched')
  //       return
  //     }

  //     Polymer.RenderStatus.afterNextRender(this, () => {
  //       doThing({ changes, rootDOMNode: this.$.changeList })
  //     })
  //   })
  // }

  // GrChangeList._ent_render = function() {
  //   doThing({ changes: this.changes, rootDOMNode: this.$.changeList })
  // }

  // GrChangeList._addObserverEffect('changes', '_ent_changesDidChange')
  // GrChangeList._addObserverEffect('sections', '_ent_sectionsDidChange')
}

const doFirstTime = () => {
  const views = [
    {
      view: 'gr-change-list-view',
      then: view => {
        view._paramsChanged(view.params)
      }
    },
    {
      view: 'gr-dashboard-view',
      then: view => {
        console.log('ent: injecting into dashboard')
        view._userChanged(view.params.user)
      }
    }
  ]

  for (let i = 0; i < views.length; ++i) {
    const view = document.body.querySelector(views[i].view)

    if (view) {
      views[i].then(view)

      break
    }
  }
}

const install = plugin => {
  console.log('ent: Hello World!')

  tryCatch('monkey-patch', () => monkeyPatch())
  tryCatch('first-time', () => doFirstTime())

  // tryCatch('hijacking gr-change-list-view', () => {
  //   Polymer({
  //     is: 'gr-change-list-view',
  //     attached() {
  //       console.log('gr-ent: hijacked gr-change-list-view!')
  //     }
  //   })
  // })

  // GrChangeListView.behaviors.push({
  //   properties: {
  //     xoxo: {
  //       type: Object,
  //       computed: 'computeXOXO(params)'
  //     }
  //   },

  //   observers: [
  //     // 'changesDidChange(_changes, _changes.*, _changes.splices)',
  //     // 'paramsDidChange(params)',
  //     '__xo_paramsDidChange(params)',
  //   ],

  //   computeXOXO() {
  //     console.log('gr-ent-hijack: asked to compute XOXO! lol!!!')
  //   },

  //   attached() {
  //     console.log('gr-ent-hijack: attached!', this.changes)
  //   },

  //   ready() {
  //     console.log('gr-ent-hijack: ready!', this.changes)
  //   },

  //   detached() {
  //     console.log('gr-ent-hijack: detached!', this.changes)
  //   },

  //   // changesDidChange(value) {
  //   //   console.log('gr-ent-hijack: changesDidChange', value)
  //   // },

  //   // paramsDidChange(value) {
  //   //   console.log('gr-ent-hijack: paramsDidChange', value)
  //   // }
  // })

  // GrChangeListView.observers = [
  //   '_paramsDidChange(params)'
  // ]

  // const { attached } = GrChangeListView

  // GrChangeListView.attached = function() {
  //   console.log('hijacked!')
  //   return attached.apply(this, arguments)
  // }

  // Polymer({
  //   is: 'gr-ent-view',

  //   properties: {
  //     params: {
  //       type: Object,
  //       observer: 'paramsDidChange',
  //     },
  //   },

  //   created() {
  //     console.log('gr-ent-view: created!', Object.keys(this))
  //   },

  //   attached() {
  //     console.log('gr-ent-view: attached!', Object.keys(this))
  //   },

  //   paramsDidChange(value) {
  //     console.log('gr-ent-view: paramsDidChange!', value)
  //   }
  // })

  // Polymer({
  //   is: 'gr-ent',

  //   properties: {
  //     name: {
  //       type: String,
  //       value: 'Ent'
  //     },

  //     /**
  //      * URL params passed from the router.
  //      */
  //     params: {
  //       type: Object,
  //       observer: 'paramsDidChange',
  //     },

  //     _changesPerPage: Number,

  //     /**
  //      * Currently active query.
  //      */
  //     _query: {
  //       type: String,
  //       value: '',
  //     },

  //     /**
  //      * Offset of currently visible query results.
  //      */
  //     _offset: Number,

  //     /**
  //      * Change objects loaded from the server.
  //      */
  //     _changes: {
  //       type: Array,
  //       observer: '_changesChanged',
  //     },
  //   },

  //   created() {
  //     console.log('gr-ent: created!', this.params)
  //   },

  //   attached() {
  //     console.log('gr-ent: attached!', this.params)
  //   },

  //   paramsDidChange(value) {
  //     console.log('gr-ent: paramsDidChange!', value)
  //   }
  // })

  // plugin.registerCustomComponent('plugin-overlay', 'gr-ent-view')
  // plugin.registerCustomComponent('change-list-view', 'gr-ent-view')

  // plugin.restApi().get(
  //   '/changes/' +
  //   '?S=0' +
  //   '&o=CURRENT_COMMIT' +
  //   '&o=CURRENT_REVISION' +
  //   '&q=is%3Aopen%20((reviewer%3Aself%20-owner%3Aself%20-is%3Aignored)%20OR%20assignee%3Aself)%20-is%3Awip'
  // ).then(changes => {
  //   doThing(changes)
  // })

  console.log('ent: Bye world!')
}

// const doThing = ({ changes, rootDOMNode }) => {
//   const hierarchy = analyze(changes)
//   const linkDOMNodes = changes.map(change => {
//     const changeHref = `/c/${change.project}/+/${change._number}`

//     return rootDOMNode.querySelector(
//       `a[title][href="${changeHref}"]`
//     )
//   })

//   const changeDOMNodes = changes.reduce((acc, change, index) => {
//     acc[change.current_revision] = linkDOMNodes[index].closest('gr-change-list-item')

//     return acc
//   }, {})

//   changes.forEach((change, index) => {
//     const changeHref = `/c/${change.project}/+/${change._number}`
//     const linkNode = linkDOMNodes[index]
//     const domNode = linkNode.closest('gr-change-list-item')

//     const { children, level } = hierarchy[change.current_revision]

//     const maxLevel = Math.max.apply(Math,
//       changes
//         .filter(otherChange => otherChange.project === change.project)
//         .map(x => hierarchy[x.current_revision].level)
//     )

//     if (level > 1) {
//       const markerNode = document.createElement('span')

//       if (level > 1) {
//         const markerNodeSpacer = document.createElement('code')

//         markerNodeSpacer.innerText = Array(Math.min(5, level - 0)).join('-')
//         markerNodeSpacer.classList.add('ent-change-marker__spacer')

//         markerNode.classList.add('ent-change-marker')
//         markerNode.appendChild(markerNodeSpacer)

//         linkNode.prepend(
//           markerNode
//         )
//       }
//     }
//   })

//   const orderedChanges = changes.sort((a, b) => {
//     return hierarchy[a.current_revision].level > hierarchy[b.current_revision] ? 1 : -1
//   })

//   orderedChanges.forEach((change, index) => {
//     const parentChange = hierarchy[change.current_revision].parents[0]

//     if (parentChange) {
//       const changeDOMNode = changeDOMNodes[change.current_revision]
//       const parentChangeDOMNode = changeDOMNodes[parentChange]

//       if (parentChangeDOMNode) {
//         changeDOMNode.parentNode.insertBefore(
//           changeDOMNode,
//           parentChangeDOMNode.nextSibling
//         )
//       }
//       // else {
//       //   console.warn("Unable to find the DOM node for change:", parentChange)
//       // }
//     }
//   })
// }

Gerrit.install(plugin => {
  tryCatch('install', () => install(plugin))
});
