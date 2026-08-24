/** Shared application-page state for the sidebar entry and shell surface. */
export interface WechatAssistantWorkspaceSnapshot {
  readonly open: boolean
}

/** Root-scoped workspace selection shared by the two browser registrations. */
export class WechatAssistantWorkspaceStore {
  private snapshot: WechatAssistantWorkspaceSnapshot = { open: false }
  private readonly listeners = new Set<() => void>()

  /** Return the current page selection. */
  getSnapshot = (): WechatAssistantWorkspaceSnapshot => this.snapshot

  /** Observe page selection changes. */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /** Select or leave the WeChat Assistant page.
   * @param open Whether the application page is selected.
   */
  setOpen(open: boolean): void {
    if (this.snapshot.open === open) return
    this.snapshot = { open }
    for (const listener of this.listeners) listener()
  }
}
