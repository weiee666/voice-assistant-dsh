/** Browser plugin registering the WeChat Assistant entry and app-level workspace. */
import { AssistantSettingsSection } from "./AssistantSettingsSection.js";
import { WechatAssistantEntry } from "./WechatAssistantEntry.js";
import { WechatAssistantWorkspace, } from "./WechatAssistantWorkspace.js";
import { WechatAssistantWorkspaceStore } from "./workspace-store.js";
import { en, zh } from "./locales.js";
import { A2A_ASSISTANT_SETTINGS_NAMESPACE } from "../settings-contract.js";
const NS = 'a2a-assistant';
/** Required browser services. */
export const inject = ['slots', 'sessions', 'locale', 'connection', 'settingsScope'];
function promptFor(conversation, text) {
    if (conversation === 'self')
        return text;
    if (conversation === 'teacher') {
        return `[A2A channel: teacher]\nRespond as a patient teacher. Explain assumptions and check understanding.\n\n${text}`;
    }
    if (conversation === 'chatgpt') {
        return `[A2A channel: chatgpt]\nRespond as an OpenAI assistant.\n\n${text}`;
    }
    return `[A2A channel: claude]\nRespond as a coding assistant for code and computer tasks.\n\n${text}`;
}
/**
 * Register the root-scoped sidebar entry and independent application page.
 * @param ctx - client root context.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-a2a-assistant: dictionaries');
    const workspace = new WechatAssistantWorkspaceStore();
    const settingsScope = ctx.settingsScope.bind({
        namespace: A2A_ASSISTANT_SETTINGS_NAMESPACE,
    });
    const { api } = ctx.get('connection');
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'wechat-assistant',
        order: 12,
        label: () => ctx.locale.bind(NS)('settings.nav'),
        locale: NS,
        inject: () => ({ scope: settingsScope, api }),
    }, AssistantSettingsSection));
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'wechat-assistant-beta',
        order: -100,
        locale: NS,
        label: 'WeChat Assistant (beta)',
        inject: () => ({ workspace }),
    }, WechatAssistantEntry));
    ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'wechat-assistant-workspace',
        order: 10,
        locale: NS,
        inject: () => ({
            workspace,
            settings: settingsScope,
            resolveSession: sessionId => sessionId === undefined ? undefined : ctx.sessions.binding(sessionId)?.session,
            send: async (sessionId, conversation, text) => {
                if (sessionId === undefined)
                    return ctx.locale.bind(NS)('status.noSessionError');
                const session = ctx.sessions.binding(sessionId)?.session;
                if (session === undefined)
                    return ctx.locale.bind(NS)('status.noSessionError');
                const result = await session.prompt([{ type: 'text', text: promptFor(conversation, text) }], 'queue');
                return result.ok ? null : `${result.error.message} (${result.error.code})`;
            },
        }),
    }, WechatAssistantWorkspace));
}
//# sourceMappingURL=index.js.map