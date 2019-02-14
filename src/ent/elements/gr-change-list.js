import { analyze } from '../logic'

const GrChangeList = document.createElement('gr-change-list').constructor.prototype

// used by gr-change-list-view
GrChangeList._ent_changesDidChange = function(changes) {
  if (changeSetHasData(changes)) {
    renderAfterNextPaint(this, changes)
  }
}

// used by gr-dashboard-view
GrChangeList._ent_sectionsDidChange = function(sections) {
  sections.forEach(({ results: changes }) => {
    if (changeSetHasData(changes)) {
      renderAfterNextPaint(this, changes)
    }
  })
}

GrChangeList._addObserverEffect('changes', '_ent_changesDidChange')
GrChangeList._addObserverEffect('sections', '_ent_sectionsDidChange')

// (Array.<ChangeInfo>): Bool
const changeSetHasData = changes => {
  return changes && changes.every(x => x.revisions && x.current_revision)
}

// (Array.<ChangeInfo>): void
const renderAfterNextPaint = (component, changes) => {
  Polymer.RenderStatus.afterNextRender(component, () => {
    render({ changes, rootDOMNode: component.$.changeList })
  })
}

// (changes: Array.<ChangeInfo>, rootDOMNode: HTMLElement): void
//
// Find the DOM nodes for the supplied changes and visualize their hierarchy
// if they are dependent.
//
// This mutates the DOM!
const render = ({ changes, rootDOMNode }) => {
  const hierarchy = analyze(changes)

  renderHeader({ rootDOMNode })

  changes.forEach(change => {
    renderCell({
      level: hierarchy[change.current_revision].level,
      changeDOMNode: findDOMNodeForChange(rootDOMNode, change),
    })
  })
}

const renderHeader = ({ rootDOMNode }) => {
  if (!rootDOMNode.querySelector('th[is=ent-header]')) {
    // place it before the subject column
    rootDOMNode.querySelector('th.gr-change-list.subject').before(
      document.createElement('th', 'ent-header')
    )
  }
}

const renderCell = ({ changeDOMNode, level }) => {
  let markerNode = changeDOMNode.querySelector('td[is=ent-cell]');

  if (!markerNode) {
    markerNode = document.createElement('td', 'ent-cell')

    // place it before the "subject" cell
    changeDOMNode.querySelector('.gr-change-list-item.cell.subject').before(
      markerNode
    )
  }

  markerNode.level = level
}

const findDOMNodeForChange = (rootDOMNode, change) => (
  rootDOMNode
    .querySelector(`gr-change-list-item a[href="/c/${change.project}/+/${change._number}"]`)
    .closest('gr-change-list-item')
)
