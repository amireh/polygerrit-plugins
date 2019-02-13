let enabled = false

const GrDashboardView = document.createElement('gr-dashboard-view').constructor.prototype
const { options } = GrDashboardView

Object.defineProperty(GrDashboardView, 'options', {
  get() {
    if (!enabled) {
      return options
    }

    return GrDashboardView.listChangesOptionsToHex(
      GrDashboardView.ListChangesOption.CURRENT_COMMIT,
      GrDashboardView.ListChangesOption.CURRENT_REVISION,
      GrDashboardView.ListChangesOption.DETAILED_ACCOUNTS,
      GrDashboardView.ListChangesOption.LABELS,
      GrDashboardView.ListChangesOption.REVIEWED,
    )
  }
})

export default () => {
  enabled = true
}
