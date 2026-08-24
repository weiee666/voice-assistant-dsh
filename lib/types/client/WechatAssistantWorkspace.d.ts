import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SessionFace, SessionId, SettingsScope } from '@deepseek-ai/dsh-client-runtime/client';
import type { WechatAssistantWorkspaceStore } from './workspace-store.ts';
import type { AssistantSettings } from '../settings-contract.ts';
/** Direct conversation ids retained from the original dashboard. */
export type ConversationId = 'self' | 'teacher' | 'claude' | 'chatgpt';
/** Application-page operations supplied by the browser plugin. */
export interface WechatAssistantWorkspaceInjected {
    readonly workspace: WechatAssistantWorkspaceStore;
    readonly settings: SettingsScope<AssistantSettings>;
    readonly resolveSession: (sessionId: SessionId | undefined) => SessionFace | undefined;
    readonly send: (sessionId: SessionId | undefined, conversation: ConversationId, text: string) => Promise<string | null>;
}
type Props = PropsRuntime<'shell.overlay'> & InjectFace<WechatAssistantWorkspaceInjected> & PropsLocale<'a2a-assistant'>;
/** Independent WeChat Assistant page, preserving the original dashboard layout. */
export declare function WechatAssistantWorkspace({ useSessions, workspace, settings, resolveSession, send, t }: Props): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=WechatAssistantWorkspace.d.ts.map