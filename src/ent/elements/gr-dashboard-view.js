const GrDashboardView = document.createElement('gr-dashboard-view').constructor.prototype

Object.defineProperty(GrDashboardView, 'options', {
  get() {
    return GrDashboardView.listChangesOptionsToHex(
      GrDashboardView.ListChangesOption.CURRENT_COMMIT,
      GrDashboardView.ListChangesOption.CURRENT_REVISION,
      GrDashboardView.ListChangesOption.DETAILED_ACCOUNTS,
      GrDashboardView.ListChangesOption.LABELS,
      GrDashboardView.ListChangesOption.REVIEWED,
    )
  }
})
