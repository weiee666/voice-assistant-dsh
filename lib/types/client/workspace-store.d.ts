/** Shared application-page state for the sidebar entry and shell surface. */
export interface WechatAssistantWorkspaceSnapshot {
    readonly open: boolean;
}
/** Root-scoped workspace selection shared by the two browser registrations. */
export declare class WechatAssistantWorkspaceStore {
    private snapshot;
    private readonly listeners;
    /** Return the current page selection. */
    getSnapshot: () => WechatAssistantWorkspaceSnapshot;
    /** Observe page selection changes. */
    subscribe: (listener: () => void) => (() => void);
    /** Select or leave the WeChat Assistant page.
     * @param open Whether the application page is selected.
     */
    setOpen(open: boolean): void;
}
//# sourceMappingURL=workspace-store.d.ts.map