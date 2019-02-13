let enabled = false

export default () => {
  enabled = true
}

const GrChangeListView = document.createElement('gr-change-list-view').constructor.prototype
const { _getChanges } = GrChangeListView

GrChangeListView._getChanges = function() {
  if (!enabled) {
    return _getChanges.apply(this, arguments)
  }

  const { restAPI } = this.$;
  const options = restAPI.listChangesOptionsToHex(
    restAPI.ListChangesOption.LABELS,
    restAPI.ListChangesOption.DETAILED_ACCOUNTS,
    restAPI.ListChangesOption.CURRENT_COMMIT,
    restAPI.ListChangesOption.CURRENT_REVISION,
  )

  return restAPI.getChanges(
    this._changesPerPage,
    this._query,
    this._offset,
    options
  );
}
