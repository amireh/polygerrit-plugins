const GrChangeListView = document.createElement('gr-change-list-view').constructor.prototype

GrChangeListView._getChanges = function() {
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
