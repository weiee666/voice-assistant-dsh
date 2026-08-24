import { useSyncExternalStore } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import { Avatar } from './avatars.tsx'
import type { WechatAssistantWorkspaceStore } from './workspace-store.ts'
import css from './WechatAssistantWorkspace.module.css'

/** Injected state shared with the application-level workspace surface. */
export interface WechatAssistantEntryInjected {
  readonly workspace: WechatAssistantWorkspaceStore
}

type Props = PropsRuntime<'sidebar.footer.action'>
  & InjectFace<WechatAssistantEntryInjected>
  & PropsLocale<'a2a-assistant'>

/** Sidebar footer entry displayed immediately above Settings. */
export function WechatAssistantEntry({ wide, workspace, t }: Props) {
  const open = useSyncExternalStore(workspace.subscribe, workspace.getSnapshot).open
  return (
    <Tooltip label={t('entry.label')} delayMs={500} disabled={wide}>
      <button
        type="button"
        className={`${css.entry}${wide ? '' : ` ${css.entryRail}`}${open ? ` ${css.entryActive}` : ''}`}
        aria-label={t('entry.label')}
        aria-pressed={open}
        onClick={() => { workspace.setOpen(!open) }}
      >
        <span className={css.entryAvatar}><Avatar role="bot" size={wide ? 20 : 22} /></span>
        {wide && <span className={css.entryLabel}>{t('entry.name')}</span>}
        {wide && <span className={css.beta}>beta</span>}
      </button>
    </Tooltip>
  )
}
