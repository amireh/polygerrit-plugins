import GerritFButton from './core';
import GerritFButtonUI from './ui';
import { TreeView } from './utils';

// HTML tests
if (typeof window !== 'undefined' && typeof window.GerritFButton !== 'undefined') {
  window.GerritFButton.Core = GerritFButton;
  window.GerritFButton.UI = GerritFButtonUI;
}
// mocha tests
else if (typeof module !== 'undefined') {
  /* eslint-disable */
  exports.Core = GerritFButton;
  exports.UI = GerritFButtonUI;
  exports.TreeView = TreeView;
  /* eslint-enable */
}
// Gerrit env
else {
  var gerritFButton = new GerritFButton();
  var poller, timeout;

  timeout = setTimeout(function() {
    // note: this guard is not necessary outside of grease-monkey's context since
    // the timeout will be cleared if the poller's test succeeds.
    if (!gerritFButton.installed) {
      console.error(
        'gerrit-f-button: one of window.Gerrit or window.jQuery is not present;',
        'plugin will not work.'
      );
    }

    // for some reason, this isn't working in Greasemonkey
    poller = clearInterval(poller);
  }, 30000);

  poller = setInterval(function() {
    if (window.Gerrit && window.jQuery) {
      gerritFButton.install(window.Gerrit, window.jQuery);

      // for some reason, this isn't working in Greasemonkey
      poller = clearInterval(poller);
      timeout = clearTimeout(timeout);
    }
  }, 250);
}