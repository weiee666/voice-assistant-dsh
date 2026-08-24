/** Settings page for the WeChat Assistant's write-only OpenAI credential and voice options. */

import { useEffect, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import type { IApiClient } from '@deepseek-ai/dsh-api-remotes/client'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import {
  Button, IconCheckOutline16, StateDot,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { AssistantSettings } from '../settings-contract.ts'
import css from './AssistantSettingsSection.module.css'

/** Settings and credential operations supplied by the browser plugin. */
export interface AssistantSettingsSectionInjected {
  readonly scope: SettingsScope<AssistantSettings>
  readonly api: Pick<IApiClient, 'credentials'>
}

/** Props composed by the settings section slot. */
export type AssistantSettingsSectionProps = PropsRuntime<'settings.section'>
  & PropsLocale<'a2a-assistant'>
  & Partial<InjectFace<AssistantSettingsSectionInjected>>

interface Draft {
  readonly key: string
  readonly minimaxKey: string
  readonly telegramKey: string
  readonly model: string
  readonly voice: string
  readonly transcriptionModel: string
  readonly instructions: string
  readonly voiceSilenceMs: string
  readonly minimaxApiKeyEnv: string
  readonly minimaxBaseURL: string
  readonly minimaxModel: string
  readonly minimaxVoice: string
  readonly minimaxFormat: string
  readonly publicDashboardUrl: string
  readonly bridgeDeviceName: string
  readonly bridgePollIntervalMs: string
  readonly telegramBotTokenEnv: string
  readonly telegramAllowedUserIds: string
}

const EMPTY_DRAFT: Draft = {
  key: '', minimaxKey: '', telegramKey: '', model: '', voice: '', transcriptionModel: '', instructions: '', voiceSilenceMs: '',
  minimaxApiKeyEnv: '', minimaxBaseURL: '', minimaxModel: '', minimaxVoice: '', minimaxFormat: '',
  publicDashboardUrl: '', bridgeDeviceName: '', bridgePollIntervalMs: '', telegramBotTokenEnv: '',
  telegramAllowedUserIds: '',
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** Render the WeChat Assistant settings page. */
export function AssistantSettingsSection(props: AssistantSettingsSectionProps): ReactNode {
  const { scope, api, t } = props
  if (scope === undefined || api === undefined) return null
  const snapshot = useSyncExternalStore(
    listener => scope.subscribe(listener),
    () => scope.getSnapshot(),
  )
  const current = snapshot.value
  const credentialRef = current?.apiKeyEnv ?? 'OPENAI_API_KEY'
  const minimaxCredentialRef = current?.minimaxApiKeyEnv ?? 'MINIMAX_API_KEY'
  const telegramCredentialRef = current?.telegramBotTokenEnv ?? 'TELEGRAM_BOT_TOKEN'
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [configured, setConfigured] = useState(false)
  const [minimaxConfigured, setMinimaxConfigured] = useState(false)
  const [telegramConfigured, setTelegramConfigured] = useState(false)
  const [credentialWritable, setCredentialWritable] = useState(true)
  const [minimaxCredentialWritable, setMinimaxCredentialWritable] = useState(true)
  const [telegramCredentialWritable, setTelegramCredentialWritable] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | undefined>()

  useEffect(() => {
    if (current === undefined || dirty) return
    setDraft({
      key: '',
      minimaxKey: '',
      telegramKey: '',
      model: current.model,
      voice: current.voice,
      transcriptionModel: current.transcriptionModel,
      instructions: current.instructions,
      voiceSilenceMs: String(current.voiceSilenceMs),
      minimaxApiKeyEnv: current.minimaxApiKeyEnv,
      minimaxBaseURL: current.minimaxBaseURL,
      minimaxModel: current.minimaxModel,
      minimaxVoice: current.minimaxVoice,
      minimaxFormat: current.minimaxFormat,
      publicDashboardUrl: current.publicDashboardUrl,
      bridgeDeviceName: current.bridgeDeviceName,
      bridgePollIntervalMs: String(current.bridgePollIntervalMs),
      telegramBotTokenEnv: current.telegramBotTokenEnv,
      telegramAllowedUserIds: current.telegramAllowedUserIds,
    })
  }, [current, dirty])

  useEffect(() => {
    let active = true
    void api.credentials.describe({ refs: [credentialRef, minimaxCredentialRef, telegramCredentialRef] }).then((response) => {
      if (!active || !response.result.ok) return
      const openaiView = response.result.value.credentials[credentialRef]
      const minimaxView = response.result.value.credentials[minimaxCredentialRef]
      const telegramView = response.result.value.credentials[telegramCredentialRef]
      setConfigured(openaiView?.configured ?? false)
      setCredentialWritable(openaiView?.writable ?? true)
      setMinimaxConfigured(minimaxView?.configured ?? false)
      setMinimaxCredentialWritable(minimaxView?.writable ?? true)
      setTelegramConfigured(telegramView?.configured ?? false)
      setTelegramCredentialWritable(telegramView?.writable ?? true)
    }).catch(() => {})
    return () => { active = false }
  }, [api, credentialRef, minimaxCredentialRef, telegramCredentialRef])

  const edit = (field: keyof Draft, value: string): void => {
    setDraft(previous => ({ ...previous, [field]: value }))
    setDirty(true)
    setNotice(undefined)
  }

  const save = async (): Promise<void> => {
    if (current === undefined) return
    setBusy(true)
    setNotice(undefined)
    try {
      const key = draft.key.trim()
      if (key !== '') {
        const response = await api.credentials.set({ ref: credentialRef, value: key })
        if (!response.result.ok) throw new Error(response.result.error.message)
        setConfigured(true)
      }
      const minimaxKey = draft.minimaxKey.trim()
      if (minimaxKey !== '') {
        const response = await api.credentials.set({ ref: draft.minimaxApiKeyEnv.trim(), value: minimaxKey })
        if (!response.result.ok) throw new Error(response.result.error.message)
        setMinimaxConfigured(true)
      }
      const telegramKey = draft.telegramKey.trim()
      if (telegramKey !== '') {
        const response = await api.credentials.set({ ref: draft.telegramBotTokenEnv.trim(), value: telegramKey })
        if (!response.result.ok) throw new Error(response.result.error.message)
        setTelegramConfigured(true)
      }
      const fields = [
        'model',
        'voice',
        'transcriptionModel',
        'instructions',
        'minimaxApiKeyEnv',
        'minimaxBaseURL',
        'minimaxModel',
        'minimaxVoice',
        'minimaxFormat',
        'bridgeDeviceName',
        'telegramBotTokenEnv',
      ] as const
      for (const field of fields) {
        const value = draft[field].trim()
        if (value === '') throw new Error(t(`settings.${field}.required`))
        if (value !== current[field]) await scope.set(field, value)
      }
      const optionalFields = ['publicDashboardUrl', 'telegramAllowedUserIds'] as const
      for (const field of optionalFields) {
        const value = draft[field].trim()
        if (value !== current[field]) await scope.set(field, value)
      }
      const bridgePollIntervalMs = Number.parseInt(draft.bridgePollIntervalMs.trim(), 10)
      if (!Number.isSafeInteger(bridgePollIntervalMs) || bridgePollIntervalMs < 500) {
        throw new Error(t('settings.bridgePollIntervalMs.required'))
      }
      if (bridgePollIntervalMs !== current.bridgePollIntervalMs) {
        await scope.set('bridgePollIntervalMs', bridgePollIntervalMs)
      }
      const voiceSilenceMs = Number.parseInt(draft.voiceSilenceMs.trim(), 10)
      if (!Number.isSafeInteger(voiceSilenceMs) || voiceSilenceMs < 250) {
        throw new Error(t('settings.voiceSilenceMs.required'))
      }
      if (voiceSilenceMs !== current.voiceSilenceMs) {
        await scope.set('voiceSilenceMs', voiceSilenceMs)
      }
      setDraft(previous => ({ ...previous, key: '', minimaxKey: '', telegramKey: '' }))
      setDirty(false)
      setNotice({ kind: 'ok', text: t('settings.saved') })
    } catch (error) {
      setNotice({ kind: 'error', text: messageOf(error) })
    } finally {
      setBusy(false)
    }
  }

  const removeKey = async (ref: string, kind: 'openai' | 'minimax' | 'telegram'): Promise<void> => {
    setBusy(true)
    setNotice(undefined)
    try {
      const response = await api.credentials.unset({ ref })
      if (!response.result.ok) throw new Error(response.result.error.message)
      if (kind === 'openai') {
        setConfigured(false)
        setDraft(previous => ({ ...previous, key: '' }))
      } else if (kind === 'minimax') {
        setMinimaxConfigured(false)
        setDraft(previous => ({ ...previous, minimaxKey: '' }))
      } else {
        setTelegramConfigured(false)
        setDraft(previous => ({ ...previous, telegramKey: '' }))
      }
      setNotice({ kind: 'ok', text: t('settings.key.removed') })
    } catch (error) {
      setNotice({ kind: 'error', text: messageOf(error) })
    } finally {
      setBusy(false)
    }
  }

  const unavailable = snapshot.status !== 'ready'
  const disabled = busy || unavailable || !snapshot.writable
  return (
    <div className={css.page}>
      <header className={css.header}>
        <h2>{t('settings.title')}</h2>
        <p>{t('settings.description')}</p>
      </header>

      <section className={css.section}>
        <div className={css.sectionHead}>
          <div>
            <h3>{t('settings.realtime.title')}</h3>
            <p>{t('settings.realtime.description')}</p>
          </div>
          <span className={css.status}>
            <StateDot state={configured ? 'done' : 'warning'} />
            {configured ? t('settings.key.configured') : t('settings.key.missing')}
          </span>
        </div>

        <div className={css.form}>
          <label className={css.field}>
            <span>{t('settings.key.label')}</span>
            <input
              type="password"
              autoComplete="off"
              value={draft.key}
              placeholder={configured ? t('settings.key.placeholderConfigured') : t('settings.key.placeholder')}
              disabled={busy || !credentialWritable}
              onChange={event => { edit('key', event.target.value) }}
            />
            <small>{t('settings.key.hint')}</small>
          </label>

          <div className={css.grid}>
            <label className={css.field}>
              <span>{t('settings.model.label')}</span>
              <input
                type="text"
                value={draft.model}
                disabled={disabled}
                onChange={event => { edit('model', event.target.value) }}
              />
            </label>
            <label className={css.field}>
              <span>{t('settings.voice.label')}</span>
              <select
                value={draft.voice}
                disabled={disabled}
                onChange={event => { edit('voice', event.target.value) }}
              >
                {['marin', 'cedar', 'coral', 'sage', 'verse', 'alloy'].map(voice => (
                  <option key={voice} value={voice}>{voice}</option>
                ))}
              </select>
            </label>
          </div>

          <label className={css.field}>
            <span>{t('settings.transcriptionModel.label')}</span>
            <input
              type="text"
              value={draft.transcriptionModel}
              disabled={disabled}
              onChange={event => { edit('transcriptionModel', event.target.value) }}
            />
          </label>

          <label className={css.field}>
            <span>{t('settings.instructions.label')}</span>
            <textarea
              rows={4}
              value={draft.instructions}
              disabled={disabled}
              onChange={event => { edit('instructions', event.target.value) }}
            />
          </label>

          <label className={css.field}>
            <span>{t('settings.voiceSilenceMs.label')}</span>
            <input
              type="number"
              min={250}
              step={100}
              value={draft.voiceSilenceMs}
              disabled={disabled}
              onChange={event => { edit('voiceSilenceMs', event.target.value) }}
            />
            <small>{t('settings.voiceSilenceMs.hint')}</small>
          </label>
        </div>

        <div className={css.sectionHead}>
          <div>
            <h3>{t('settings.minimax.title')}</h3>
            <p>{t('settings.minimax.description')}</p>
          </div>
          <span className={css.status}>
            <StateDot state={minimaxConfigured ? 'done' : 'warning'} />
            {minimaxConfigured ? t('settings.key.configured') : t('settings.key.missing')}
          </span>
        </div>

        <div className={css.form}>
          <label className={css.field}>
            <span>{t('settings.minimaxKey.label')}</span>
            <input
              type="password"
              autoComplete="off"
              value={draft.minimaxKey}
              placeholder={minimaxConfigured ? t('settings.key.placeholderConfigured') : t('settings.key.placeholder')}
              disabled={busy || !minimaxCredentialWritable}
              onChange={event => { edit('minimaxKey', event.target.value) }}
            />
            <small>{t('settings.minimaxKey.hint')}</small>
          </label>

          <label className={css.field}>
            <span>{t('settings.minimaxApiKeyEnv.label')}</span>
            <input
              type="text"
              value={draft.minimaxApiKeyEnv}
              disabled={disabled}
              onChange={event => { edit('minimaxApiKeyEnv', event.target.value) }}
            />
          </label>

          <label className={css.field}>
            <span>{t('settings.minimaxBaseURL.label')}</span>
            <input
              type="text"
              value={draft.minimaxBaseURL}
              disabled={disabled}
              onChange={event => { edit('minimaxBaseURL', event.target.value) }}
            />
          </label>

          <div className={css.grid}>
            <label className={css.field}>
              <span>{t('settings.minimaxModel.label')}</span>
              <input
                type="text"
                value={draft.minimaxModel}
                disabled={disabled}
                onChange={event => { edit('minimaxModel', event.target.value) }}
              />
            </label>
            <label className={css.field}>
              <span>{t('settings.minimaxVoice.label')}</span>
              <input
                type="text"
                value={draft.minimaxVoice}
                disabled={disabled}
                onChange={event => { edit('minimaxVoice', event.target.value) }}
              />
            </label>
          </div>

          <label className={css.field}>
            <span>{t('settings.minimaxFormat.label')}</span>
            <select
              value={draft.minimaxFormat}
              disabled={disabled}
              onChange={event => { edit('minimaxFormat', event.target.value) }}
            >
              {['mp3', 'wav', 'flac', 'pcm'].map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </label>
        </div>

        <div className={css.sectionHead}>
          <div>
            <h3>{t('settings.public.title')}</h3>
            <p>{t('settings.public.description')}</p>
          </div>
        </div>

        <div className={css.form}>
          <label className={css.field}>
            <span>{t('settings.publicDashboardUrl.label')}</span>
            <input
              type="url"
              value={draft.publicDashboardUrl}
              placeholder="https://your-assistant.vercel.app"
              disabled={disabled}
              onChange={event => { edit('publicDashboardUrl', event.target.value) }}
            />
            <small>{t('settings.publicDashboardUrl.hint')}</small>
          </label>

          <div className={css.grid}>
            <label className={css.field}>
              <span>{t('settings.bridgeDeviceName.label')}</span>
              <input
                type="text"
                value={draft.bridgeDeviceName}
                disabled={disabled}
                onChange={event => { edit('bridgeDeviceName', event.target.value) }}
              />
            </label>
            <label className={css.field}>
              <span>{t('settings.bridgePollIntervalMs.label')}</span>
              <input
                type="number"
                min={500}
                step={100}
                value={draft.bridgePollIntervalMs}
                disabled={disabled}
                onChange={event => { edit('bridgePollIntervalMs', event.target.value) }}
              />
            </label>
          </div>
        </div>

        <div className={css.sectionHead}>
          <div>
            <h3>{t('settings.telegram.title')}</h3>
            <p>{t('settings.telegram.description')}</p>
          </div>
          <span className={css.status}>
            <StateDot state={telegramConfigured ? 'done' : 'warning'} />
            {telegramConfigured ? t('settings.key.configured') : t('settings.key.missing')}
          </span>
        </div>

        <div className={css.form}>
          <label className={css.field}>
            <span>{t('settings.telegramKey.label')}</span>
            <input
              type="password"
              autoComplete="off"
              value={draft.telegramKey}
              placeholder={telegramConfigured ? t('settings.key.placeholderConfigured') : t('settings.key.placeholder')}
              disabled={busy || !telegramCredentialWritable}
              onChange={event => { edit('telegramKey', event.target.value) }}
            />
            <small>{t('settings.telegramKey.hint')}</small>
          </label>

          <div className={css.grid}>
            <label className={css.field}>
              <span>{t('settings.telegramBotTokenEnv.label')}</span>
              <input
                type="text"
                value={draft.telegramBotTokenEnv}
                disabled={disabled}
                onChange={event => { edit('telegramBotTokenEnv', event.target.value) }}
              />
            </label>
            <label className={css.field}>
              <span>{t('settings.telegramAllowedUserIds.label')}</span>
              <input
                type="text"
                value={draft.telegramAllowedUserIds}
                placeholder="123456789, 987654321"
                disabled={disabled}
                onChange={event => { edit('telegramAllowedUserIds', event.target.value) }}
              />
            </label>
          </div>
        </div>

        <footer className={css.actions}>
          {notice === undefined ? <span /> : (
            <span className={notice.kind === 'ok' ? css.success : css.failure}>{notice.text}</span>
          )}
          <div>
            {configured ? (
              <Button variant="ghost" disabled={busy || !credentialWritable} onClick={() => { void removeKey(credentialRef, 'openai') }}>
                {t('settings.key.remove')}
              </Button>
            ) : null}
            {minimaxConfigured ? (
              <Button variant="ghost" disabled={busy || !minimaxCredentialWritable} onClick={() => { void removeKey(minimaxCredentialRef, 'minimax') }}>
                {t('settings.key.remove')}
              </Button>
            ) : null}
            {telegramConfigured ? (
              <Button variant="ghost" disabled={busy || !telegramCredentialWritable} onClick={() => { void removeKey(telegramCredentialRef, 'telegram') }}>
                {t('settings.telegramKey.remove')}
              </Button>
            ) : null}
            <Button
              variant="primary"
              icon={<IconCheckOutline16 />}
              disabled={disabled || !dirty}
              onClick={() => { void save() }}
            >
              {busy ? t('settings.saving') : t('settings.save')}
            </Button>
          </div>
        </footer>
      </section>
    </div>
  )
}
