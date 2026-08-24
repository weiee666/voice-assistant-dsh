/** Root-scoped workspace selection shared by the two browser registrations. */
export class WechatAssistantWorkspaceStore {
    snapshot = { open: false };
    listeners = new Set();
    /** Return the current page selection. */
    getSnapshot = () => this.snapshot;
    /** Observe page selection changes. */
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };
    /** Select or leave the WeChat Assistant page.
     * @param open Whether the application page is selected.
     */
    setOpen(open) {
        if (this.snapshot.open === open)
            return;
        this.snapshot = { open };
        for (const listener of this.listeners)
            listener();
    }
}
//# sourceMappingURL=workspace-store.js.map