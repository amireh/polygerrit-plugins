const getCurrentRevision = change => change.revisions[change.current_revision]


exports.analyze = function(changes) {
  const cache = {}
  const once = (id, f) => {
    if (cache[id]) {
      return cache[id]
    }

    cache[id] = f()

    return cache[id]
  }

  const ancestorsOf = sha => {
    if (cache[sha]) {
      return cache[sha]
    }

    return parentsOf(sha).reduce((acc, parentSha) => {
      return acc.concat(ancestorsOf(parentSha))
    }, [ sha ])
  }

  const parentsOf = sha => {
    const change = changes.find(change => change.current_revision === sha)

    if (!change) {
      return []
    }

    return getCurrentRevision(change).commit.parents.map(x => x.commit)
  }

  return changes.reduce((tree, change) => {
    const sha = change.current_revision
    const ancestry = once(sha, () => ancestorsOf(sha))

    ancestry.forEach(ancestorSha => {
      if (ancestorSha !== sha && !tree[ancestorSha]) {
        tree[ancestorSha] = { children: 0 }
        tree[ancestorSha]['children'] += 1
      }
    })

    if (!tree[sha]) {
      tree[sha] = { children: 0 }
    }

    tree[sha].parents = parentsOf(sha),
    tree[sha].ancestry = ancestry,
    tree[sha].level = ancestry.length - 1

    return tree
  }, {})
}

