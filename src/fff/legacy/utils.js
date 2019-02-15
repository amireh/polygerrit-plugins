export function TreeView(fileList) {
  var tree = {
    items: [],
    children: {}
  };

  function getBranch(path) {
    var fragments = path.split('/').filter(function(x) { return x.length > 0; });
    var branch = tree;

    fragments.forEach(function(fragment) {
      if (!branch.children[fragment]) {
        branch.children[fragment] = { items: [], children: {} };
      }

      branch = branch.children[fragment];
    });

    return branch;
  }

  fileList.forEach(function(file) {
    getBranch(file.filePath.split('/').slice(0, -1).join('/')).items.push(file);
  });

  return tree;
}

export function classSet(classNames) {
  return Object.keys(classNames).reduce(function(className, key) {
    return !!classNames[key] ? (className + ' ' + key) : className;
  }, '');
}

export function discardLeadingSlash(s) {
  return s.replace(/^\//, '');
}

export function copyToClipboard(string) {
  // GreaseMonkey sandbox:
  if (typeof GM_setClipboard !== 'undefined') {
    GM_setClipboard(string);
  }
}