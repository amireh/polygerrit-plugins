'use strict';

const assert = require('chai').assert;
const Package = require('../../gerrit-f-button');
const TreeView = Package.TreeView;

describe('Utils', function() {
  describe('TreeView', function() {
    it('should group files by their paths', function() {
      var tree = TreeView([
        { filePath: '/lib/foo/a.js' },
        { filePath: '/lib/foo/b.js' },
        { filePath: '/lib/bar.js' },
      ]);

      assert.include(Object.keys(tree.children), 'lib');
      assert.include(Object.keys(tree.children.lib.children), 'foo');
      assert.include(tree.children.lib.children.foo.items[0], { filePath: '/lib/foo/a.js' });
      assert.include(tree.children.lib.children.foo.items[1], { filePath: '/lib/foo/b.js' });
    });
  });
});