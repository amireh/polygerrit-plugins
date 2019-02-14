import { TreeView, classSet, copyToClipboard } from './utils';
import LinkedList from './utils/linked_list';

export default function GerritFButtonUI($) {
  var HAS_SCROLL_INTO_VIEW = (
    typeof window !== 'undefined' &&
    typeof HTMLElement.prototype.scrollIntoViewIfNeeded === 'function'
  );

  var $frame = $('<div />', { 'class': 'f-button__frame' });
  var $container;

  return {
    node: $frame[0],

    state: {
      /**
       * @property {Boolean}
       * Whether to list only the files that have comments.
       */
      commentedOnly: false,

      /**
       * @property {String}
       *
       * ID of the "selected" file so that we can highlight during keyboard
       * navigation.
       *
       * Defaults to: @props.activeFile
       */
      selectedFile: null,
    },

    props: {
      files: [],
      activeFile: null,
      hideInUnifiedMode: false,
      displayAsOverlay: false,
      displayAsTree: true,
      onToggleHideInUnifiedMode: Function.prototype,
      onToggleDisplayAsOverlay: Function.prototype,
      onToggleDisplayAsTree: Function.prototype,
    },

    /**
     * @public
     */
    mount: function(_container) {
      $container = $(_container || document.body);

      $container.addClass('gerrit--with-f-button');
      $container.append($frame);

      this.componentDidRender();
    },

    /**
     * @public
     */
    isMounted: function() {
      return $frame.parent().length === 1;
    },

    /**
     * Show or hide the F button frame.
     *
     * @param {?HTMLElement} [container=document.body]
     * @param {?Object} options
     * @param {Boolean} options.stealFocus
     */
    toggle: function(container, options) {
      if (this.isMounted()) {
        this.unmount(container);
      }
      else {
        this.mount(container);

        if (options && options.stealFocus) {
          this.stealFocus();
        }
      }
    },

    stealFocus: function() {
      if (document.activeElement) {
        document.activeElement.blur();
      }

      $frame.focus();
    },

    /**
     * @public
     */
    unmount: function() {
      $frame.detach();

      $container.removeClass('gerrit--with-f-button');
      $container.removeClass('gerrit--with-f-button-overlay');
      $container = null;
    },

    /**
     * @public
     *
     * Update the F button with new parameters.
     *
     * @param {Object} props
     *
     * @param {Object[]} props.files
     *        The list of patch-set files with or without comment data.
     *
     * @param {String} props.activeFile
     *        File path of the file being currently browsed in gerrit.
     */
    setProps: function(props) {
      Object.keys(props).forEach(function(key) {
        this.props[key] = props[key];
      }.bind(this));

      this.render();
    },

    /**
     * @public
     *
     * Highlight the file following the currently selected file.
     */
    selectNextFile: function() {
      var list = new LinkedList($, $frame.find('.f-button-file'));
      var $selectedFile = $(this.getSelectedFileDOMNode());

      if ($selectedFile) {
        list.setCursor($selectedFile);
      }

      var $next = list.getNext();

      if ($next.length) {
        this.selectFile($next[0].getAttribute('data-id'));
      }
    },

    /**
     * @public
     *
     * Highlight the file preceding the currently selected file.
     */
    selectPreviousFile: function() {
      var list = new LinkedList($, $frame.find('.f-button-file'));
      var $selectedFile = $(this.getSelectedFileDOMNode());

      if ($selectedFile) {
        list.setCursor($selectedFile);
      }

      var $prev = list.getPrevious();

      if ($prev.length) {
        this.selectFile($prev[0].getAttribute('data-id'));
      }
    },

    /**
     * @public
     *
     * Activate the link of the selected file.
     */
    activateSelectedFile: function() {
      if (this.state.selectedFile) {
        this.getSelectedFileDOMNode().querySelector('a').click();
      }
    },

    /**
     * @private
     */
    componentDidRender: function() {
      var activeFileDOMNode = this.getActiveFileDOMNode();

      // Scroll the active row into view, very handy when the PS has many files.
      if (activeFileDOMNode && HAS_SCROLL_INTO_VIEW) {
        activeFileDOMNode.scrollIntoViewIfNeeded();
      }

      $frame.toggleClass('f-button__frame--list-view', !this.props.displayAsTree);

      if ($container) {
        $container.toggleClass('gerrit--with-f-button-overlay', this.props.displayAsOverlay);
      }
    },

    /**
     * @private
     */
    render: function() {
      var $files = this.renderFiles();
      var $controls = this.renderControls();

      $frame
        .empty()
        .append($files)
        .append($controls)
        .toggleClass('f-button__frame--commented-only', this.state.commentedOnly)
      ;

      this.componentDidRender();
    },

    /**
     * @private
     */
    renderFiles: function() {
      var $list = $('<div />', { 'class': 'f-button__table' });
      var fileTree = TreeView(this.props.files);

      $list.append(this.renderFileTree(fileTree, true));

      return $list;
    },

    /**
     * @private
     */
    renderFileTree: function(tree, isRoot) {
      var $list = $('<ol />', {
        class: classSet({
          'f-button-file__folder': true,
          'f-button-file__folder--root': isRoot === true
        })
      });

      // folders:
      Object.keys(tree.children).sort().forEach(function(branch) {
        var $children = this.renderFileTree(tree.children[branch]);

        if (!$children) {
          return null;
        }

        var $folderHeader = $('<header />', { class: 'f-button-file__folder-header' });

        $folderHeader.append(
          $('<span />', { class: 'f-button-file__icon f-button-icon__folder' })
        );

        $folderHeader.append($('<span />').text(branch + '/'));

        return (
          $('<li />')
            .append($folderHeader)
            .append($children)
            .appendTo($list)
        );
      }.bind(this));

      // files:
      tree.items.forEach(function(file) {
        if (this.state.commentedOnly && (!file.comments || !file.comments.length)) {
          return null;
        }

        $list.append(this.renderFile(file));
      }.bind(this));

      return $list.children().length === 0 ? null : $list;
    },

    /**
     * @private
     */
    renderFile: function(file) {
      var filePath = file.filePath;
      var fileName = this.props.displayAsTree ?
        file.filePath.split('/').slice(-1)[0] :
        file.filePath
      ;

      var hasComments = file.comments && file.comments.length > 0;
      var $row = $('<li />', {
        'data-id': file.filePath,
        class: classSet({
          'f-button-file': true,
          'f-button-file--active': this.props.activeFile === filePath,
          'f-button-file--selected': this.state.selectedFile === filePath,
          'f-button-file--commented': hasComments
        })
      });

      $row.append(
        $('<span />', {
          class: 'f-button-file__comment-count'
        }).text(hasComments ? file.comments.length : '')
      );

      $row.append(
        $('<span />', {
          class: 'f-button-icon__file f-button-file__icon',
          title: 'Copy filepath to clipboard'
        }).bind('click', this.copyToClipboard.bind(this, filePath))
      );

      $row.append(
        $('<a />', {
          href: file.url,
          class: 'f-button-file__link'
        }).text(fileName)
      );

      return $row;
    },

    /**
     * @private
     */
    renderControls: function() {
      var $controls = $('<div />', {
        class: 'f-button__controls'
      });

      $('<label />')
        .append($('<input />', { type: 'checkbox', checked: this.state.commentedOnly }))
        .append($('<span />').text('Hide files with no comments'))
        .appendTo($controls)
        .bind('click', this.toggleCommented.bind(this))
      ;

      $('<label />')
        .append(
          $('<input />', { type: 'checkbox', checked: this.props.hideInUnifiedMode })
          .bind('change', this.toggleHideInUnifiedMode.bind(this))
        )
        .append($('<span />').text('Disable in Unified Diff view'))
        .appendTo($controls)
      ;

      $('<label />')
        .append(
          $('<input />', { type: 'checkbox', checked: this.props.displayAsOverlay })
          .bind('change', this.toggleDisplayAsOverlay.bind(this))
        )
        .append($('<span />').text('Display as overlay'))
        .appendTo($controls)
      ;

      $('<label />')
        .append(
          $('<input />', { type: 'checkbox', checked: this.props.displayAsTree })
          .bind('change', this.toggleDisplayAsTree.bind(this))
        )
        .append($('<span />').text('Display files as a tree'))
        .appendTo($controls)
      ;

      return $controls;
    },

    /** @private */
    setState: function(nextState) {
      Object.keys(nextState).forEach(function(key) {
        this.state[key] = nextState[key];
      }.bind(this));

      this.render();
    },

    /** @private */
    selectFile: function(filePath) {
      if (this.props.activeFile === filePath) {
        this.setState({ selectedFile: null });
      }
      else {
        this.setState({ selectedFile: filePath });
      }
    },

    /** @private */
    getSelectedFile: function() {
      return this.state.selectedFile || this.props.activeFile;
    },

    /** @private */
    getSelectedFileDOMNode: function() {
      var selectedFile = this.getSelectedFile();

      return [].filter.call($frame.find('.f-button-file'), function(el) {
        return el.getAttribute('data-id') === selectedFile;
      })[0];
    },

    /** @private */
    getActiveFileDOMNode: function() {
      var activeFile = this.props.activeFile;

      return [].filter.call($frame.find('.f-button-file'), function(el) {
        return el.getAttribute('data-id') === activeFile;
      })[0];
    },

    /**
     * @private
     *
     * Copy a filepath to the clipboard.
     */
    copyToClipboard: function(filePath/*, e*/) {
      copyToClipboard(filePath);
    },

    /** @private */
    toggleCommented: function() {
      this.setState({ commentedOnly: !this.state.commentedOnly });
    },

    /** @private */
    toggleHideInUnifiedMode: function(e) {
      this.props.onToggleHideInUnifiedMode(e.target.checked);
    },

    /** @private */
    toggleDisplayAsOverlay: function(e) {
      this.props.onToggleDisplayAsOverlay(e.target.checked);
    },

    /** @private */
    toggleDisplayAsTree: function(e) {
      this.props.onToggleDisplayAsTree(e.target.checked);
    },
  };
}