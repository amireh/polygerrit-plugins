import GerritFButtonUI from './ui';

var KC_F = 70;
var KC_J = 74;
var KC_K = 75;
var KC_RETURN = 13;

export default function GerritFButtonUIController($, core) {
  var ui;

  window.addEventListener('keydown', function(e) {
    var megaKey = e.shiftKey && e.ctrlKey && e.metaKey;

    if (!megaKey) {
      // don't show if we're not inspecting a patchset (or asked not to)
      if (!core.isViewingPatchset() || (isInUnifiedMode() && shouldHideInUnifiedMode())) {
        if (ui.isMounted()) {
          ui.unmount();
        }

        return;
      }
      // don't steal focus from input widgets
      else if (!shouldIntercept($, e.target)) {
        return;
      }
    }

    switch (e.keyCode || e.which) {
      case KC_F:
        // Some really pesky tuning here... the case is when we're focusing
        // the editor node while the panel is already shown, we want to press
        // MEGAKEY+f only to grant focus to the panel so that we can navigate
        // to other files using the keyboard and do _not_ want to hide the panel
        // as would've been done without this guard.
        //
        // So the formula is:
        //
        //   [panel is visible] + [megakey] + [we're focusing editor]
        //
        // Double-pressing this combination _should_ hide the panel.
        if (megaKey && ui.isMounted() && !shouldIntercept($, e.target)) {
          ui.stealFocus();
        }
        // Allow cmd+f and ctrl+f through to permit search.
        else if (e.ctrlKey || e.metaKey) {
          return;
        }
        else {
          ui.toggle(null, { stealFocus: megaKey });
        }

        break;
      case KC_J:
        if (ui.isMounted()) {
          ui.selectNextFile();
        }

        break;

      case KC_K:
        if (ui.isMounted()) {
          ui.selectPreviousFile();
        }

        break;

      case KC_RETURN:
        if (ui.isMounted()) {
          ui.activateSelectedFile();
        }

        break;
    }
  }, false);

  ui = GerritFButtonUI($);
  ui.setProps({
    hideInUnifiedMode: shouldHideInUnifiedMode(),
    displayAsOverlay: shouldDisplayAsOverlay(),
    displayAsTree: shouldDisplayAsTree(),

    onToggleHideInUnifiedMode: function(checked) {
      setSetting('GERRIT_F_BUTTON/HIDE_IN_UNIFIED_MODE', checked);
      ui.setProps({ hideInUnifiedMode: shouldHideInUnifiedMode() });
    },

    onToggleDisplayAsTree: function(checked) {
      setSetting('GERRIT_F_BUTTON/DISPLAY_AS_LIST', !checked);
      ui.setProps({ displayAsTree: shouldDisplayAsTree() });
    },

    onToggleDisplayAsOverlay: function(checked) {
      setSetting('GERRIT_F_BUTTON/DISPLAY_AS_OVERLAY', checked);
      ui.setProps({ displayAsOverlay: shouldDisplayAsOverlay() });
    }
  });

  return {
    render: function(files, activeFile) {
      ui.setProps({ files: files, activeFile: activeFile });
    }
  };
}

function setSetting(key, isOn) {
  if (isOn) {
    localStorage.setItem(key, '1');
  }
  else {
    localStorage.removeItem(key);
  }
}

function isInUnifiedMode() {
  return !!document.querySelector('.gerritBody .unifiedTable');
}

function shouldHideInUnifiedMode() {
  return localStorage.getItem('GERRIT_F_BUTTON/HIDE_IN_UNIFIED_MODE') === '1';
}

function shouldDisplayAsOverlay() {
  return localStorage.getItem('GERRIT_F_BUTTON/DISPLAY_AS_OVERLAY') === '1';
}

function shouldDisplayAsTree() {
  return localStorage.getItem('GERRIT_F_BUTTON/DISPLAY_AS_LIST') !== '1';
}

function shouldIntercept($, node) {
  return !$(node).is('input, textarea');
}