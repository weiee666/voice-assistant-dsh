import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { WechatAssistantWorkspaceStore } from './workspace-store.ts';
/** Injected state shared with the application-level workspace surface. */
export interface WechatAssistantEntryInjected {
    readonly workspace: WechatAssistantWorkspaceStore;
}
type Props = PropsRuntime<'sidebar.footer.action'> & InjectFace<WechatAssistantEntryInjected> & PropsLocale<'a2a-assistant'>;
/** Sidebar footer entry displayed immediately above Settings. */
export declare function WechatAssistantEntry({ wide, workspace, t }: Props): import("react").JSX.Element;
export {};
//# sourceMappingURL=WechatAssistantEntry.d.ts.map