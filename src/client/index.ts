/** Browser plugin registering the WeChat Assistant entry and app-level workspace. */

import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { AssistantSettingsSection, type AssistantSettingsSectionInjected } from './AssistantSettingsSection.tsx'
import { WechatAssistantEntry, type WechatAssistantEntryInjected } from './WechatAssistantEntry.tsx'
import {
  WechatAssistantWorkspace, type ConversationId, type WechatAssistantWorkspaceInjected,
} from './WechatAssistantWorkspace.tsx'
import { WechatAssistantWorkspaceStore } from './workspace-store.ts'
import { en, zh, type A2aAssistantLocaleKey } from './locales.ts'
import { A2A_ASSISTANT_SETTINGS_NAMESPACE, type AssistantSettings } from '../settings-contract.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Copy owned by the WeChat Assistant workspace. */
    'a2a-assistant': A2aAssistantLocaleKey
  }
}

const NS = 'a2a-assistant'

/** Required browser services. */
export const inject = ['slots', 'sessions', 'locale', 'connection', 'settingsScope']

function promptFor(conversation: ConversationId, text: string): string {
  if (conversation === 'self') return text
  if (conversation === 'teacher') {
    return `[A2A channel: teacher]\nRespond as a patient teacher. Explain assumptions and check understanding.\n\n${text}`
  }
  if (conversation === 'chatgpt') {
    return `[A2A channel: chatgpt]\nRespond as an OpenAI assistant.\n\n${text}`
  }
  return `[A2A channel: claude]\nRespond as a coding assistant for code and computer tasks.\n\n${text}`
}

/**
 * Register the root-scoped sidebar entry and independent application page.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-a2a-assistant: dictionaries')
  const workspace = new WechatAssistantWorkspaceStore()
  const settingsScope = ctx.settingsScope.bind<AssistantSettings>({
    namespace: A2A_ASSISTANT_SETTINGS_NAMESPACE,
  })
  const { api } = ctx.get('connection') as ConnectionHandle
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'wechat-assistant',
    order: 12,
    label: () => ctx.locale.bind(NS)('settings.nav'),
    locale: NS,
    inject: (): AssistantSettingsSectionInjected => ({ scope: settingsScope, api }),
  }, AssistantSettingsSection))
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'wechat-assistant-beta',
    order: -100,
    locale: NS,
    label: 'WeChat Assistant (beta)',
    inject: (): WechatAssistantEntryInjected => ({ workspace }),
  }, WechatAssistantEntry))
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'wechat-assistant-workspace',
    order: 10,
    locale: NS,
    inject: (): WechatAssistantWorkspaceInjected => ({
      workspace,
      settings: settingsScope,
      resolveSession: sessionId => sessionId === undefined ? undefined : ctx.sessions.binding(sessionId)?.session,
      send: async (sessionId, conversation, text) => {
        if (sessionId === undefined) return ctx.locale.bind(NS)('status.noSessionError')
        const session = ctx.sessions.binding(sessionId)?.session
        if (session === undefined) return ctx.locale.bind(NS)('status.noSessionError')
        const result = await session.prompt([{ type: 'text', text: promptFor(conversation, text) }], 'queue')
        return result.ok ? null : `${result.error.message} (${result.error.code})`
      },
    }),
  }, WechatAssistantWorkspace))
}
