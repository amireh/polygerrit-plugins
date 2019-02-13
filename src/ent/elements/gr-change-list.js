import { analyze } from '../logic'

const GrChangeList = document.createElement('gr-change-list').constructor.prototype

// Because we can't remove a Polymer observer, we'll rely on a flag instead
let enabled = false

export default () => {
  enabled = true
}

// used by gr-change-list-view
GrChangeList._ent_changesDidChange = function(changes) {
  if (enabled && changeSetHasData(changes)) {
    renderAfterNextPaint(this, changes)
  }
}

// used by gr-dashboard-view
GrChangeList._ent_sectionsDidChange = function(sections) {
  if (!enabled) {
    return
  }

  sections.forEach(({ results: changes }) => {
    if (enabled && changeSetHasData(changes)) {
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
  const linkDOMNodes = changes.reduce((acc, change) => {
    acc[change.current_revision] = findDOMNodeForChangeLink(rootDOMNode, change)

    return acc
  }, {})

  const changeDOMNodes = changes.reduce((acc, change) => {
    acc[change.current_revision] = findDOMNodeForChange(linkDOMNodes[change.current_revision])

    return acc
  }, {})

  const thNode = document.createElement('th')
  thNode.innerText = '⮡'
  thNode.classList.add('gr-ent', 'topHeader', 'gr-change-list')
  const subjectNode = rootDOMNode.querySelector('th.gr-change-list.subject')
  // const subjectNode = [].find.call(
  //   rootDOMNode.querySelectorAll('th.gr-change-list'),
  //   (node) => node.innerText.trim() === 'Subject'
  // )

  if (subjectNode.parentNode.querySelector('th.gr-ent')) {
    subjectNode.parentNode.querySelector('th.gr-ent').remove()
  }

  subjectNode.parentNode.insertBefore(thNode, subjectNode)
  // thNode.before(subjectNode)
  // rootDOMNode.insertBefore(
  //   [].find.call(
  //     rootDOMNode.querySelectorAll('th.gr-change-list'),
  //     (node) => node.innerText.trim() === 'Subject'
  //   ),
  //   thNode
  // )

  changes.forEach((change, index) => {
    const { level } = hierarchy[change.current_revision]

    // if (level > 0) {
      markDependentChange({
        change,
        level,
        changeDOMNode: changeDOMNodes[change.current_revision],
        linkDOMNode: linkDOMNodes[change.current_revision]
      })
    // }
  })

  const last = x => x[x.length - 1]
  const grouped = changes.reduce((acc, change) => {
    const rootAncestor = last(hierarchy[change.current_revision].ancestry)

    if (!acc[rootAncestor]) {
      acc[rootAncestor] = []
    }

    acc[rootAncestor].push(change)

    return acc
  }, {})

  Object.keys(grouped).sort().forEach(groupId => {
    const changesInGroup = grouped[groupId]

    changesInGroup.reverse().forEach(change => {
      const { level } = hierarchy[change.current_revision]

      if (level > 0) {
        // reorderChangeInDOM({
        //   node: changeDOMNodes[change.current_revision],
        //   parentNode: changeDOMNodes[hierarchy[change.current_revision].parents[0]]
        // })
      }
    })
  })
}

const findDOMNodeForChangeLink = (rootDOMNode, change) => (
  rootDOMNode.querySelector(
    `a[title][href="/c/${change.project}/+/${change._number}"]`
  )
)

const findDOMNodeForChange = linkDOMNode => (
  linkDOMNode.closest('gr-change-list-item')
)


const markDependentChange = ({ change, changeDOMNode, level, linkDOMNode }) => {
  const existingMarkerNode = changeDOMNode.querySelector('.ent-change-marker');

  if (existingMarkerNode) {
    existingMarkerNode.remove()
  }

  const markerNode = document.createElement('td')
  const markerNodeSpacer = document.createElement('code')

  // markerNodeSpacer.innerText = Array(Math.min(5, level - 0)).join('-')
  markerNodeSpacer.innerText = Array(( level )).join('-')
  markerNodeSpacer.classList.add('ent-change-marker__spacer')

  markerNode.classList.add('ent-change-marker')

  if (level > 0) {
    markerNode.classList.add('ent-change-marker--dependent')
    markerNode.innerText = level
  }

  // markerNode.appendChild(markerNodeSpacer)

  const tdNode = linkDOMNode.closest('td')
  changeDOMNode.insertBefore(markerNode, tdNode)

  // linkDOMNode.parentNode.insertBefore(markerNode, linkDOMNode)
  // linkDOMNode.prepend(markerNode)
}

const reorderChangeInDOM = ({ node, parentNode }) => {
  parentNode.insertAdjacentElement('afterend', node)
}
