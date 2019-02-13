import { analyze } from './logic'

Gerrit.install(plugin => {
  console.log('ent: Hello World!')

  plugin.restApi().get(
    '/changes/' +
    '?S=0' +
    '&o=CURRENT_COMMIT' +
    '&o=CURRENT_REVISION' +
    '&q=is%3Aopen%20((reviewer%3Aself%20-owner%3Aself%20-is%3Aignored)%20OR%20assignee%3Aself)%20-is%3Awip'
  ).then(changes => {
    const hierarchy = analyze(changes)
    const linkDOMNodes = changes.map(change => {
      const changeHref = `/c/${change.project}/+/${change._number}`

      return document.querySelector(
        `gr-change-list-item a[title][href="${changeHref}"]`
      )
    })

    const changeDOMNodes = changes.reduce((acc, change, index) => {
      acc[change.current_revision] = linkDOMNodes[index].closest('gr-change-list-item')

      return acc
    }, {})

    changes.forEach((change, index) => {
      const changeHref = `/c/${change.project}/+/${change._number}`
      const linkNode = linkDOMNodes[index]
      const domNode = linkNode.closest('gr-change-list-item')

      const { children, level } = hierarchy[change.current_revision]

      const maxLevel = Math.max.apply(Math,
        changes
          .filter(otherChange => otherChange.project === change.project)
          .map(x => hierarchy[x.current_revision].level)
      )

      if (level > 1) {
        const markerNode = document.createElement('span')

        if (level > 1) {
          const markerNodeSpacer = document.createElement('code')

          markerNodeSpacer.innerText = Array(Math.min(5, level - 0)).join('-')
          markerNodeSpacer.classList.add('ent-change-marker__spacer')

          markerNode.classList.add('ent-change-marker')
          markerNode.appendChild(markerNodeSpacer)

          linkNode.prepend(
            markerNode
          )
        }
      }
    })

    const orderedChanges = changes.sort((a, b) => {
      return hierarchy[a.current_revision].level > hierarchy[b.current_revision] ? 1 : -1
    })

    orderedChanges.forEach((change, index) => {
      const parentChange = hierarchy[change.current_revision].parents[0]

      if (parentChange) {
        const changeDOMNode = changeDOMNodes[change.current_revision]
        const parentChangeDOMNode = changeDOMNodes[parentChange]

        if (parentChangeDOMNode) {
          changeDOMNode.parentNode.insertBefore(
            changeDOMNode,
            parentChangeDOMNode.nextSibling
          )
        }
        else {
          console.warn("Unable to find the DOM node for change:", parentChange)
        }
      }
    })
  })
});

