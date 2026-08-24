import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const STORAGE_KEY = 'voice-assistant-dsh.origin'
const DEFAULT_LOCAL_ORIGIN = 'http://127.0.0.1:3080'

function initialOrigin(): string {
  const params = new URLSearchParams(window.location.search)
  const queryOrigin = params.get('dsh')?.trim()
  if (queryOrigin !== undefined && queryOrigin !== '') return queryOrigin
  const envOrigin = import.meta.env.VITE_DSH_ORIGIN as string | undefined
  if (envOrigin !== undefined && envOrigin.trim() !== '') return envOrigin.trim()
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_LOCAL_ORIGIN
}

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/u, '')
}

function dashboardHref(origin: string): string {
  try {
    const url = new URL(origin)
    url.searchParams.set('wechatAssistant', '1')
    return url.toString()
  } catch {
    return 'about:blank'
  }
}

function App(): JSX.Element {
  const [draft, setDraft] = useState(initialOrigin)
  const [origin, setOrigin] = useState(() => normalizeOrigin(initialOrigin()))
  const dashboardUrl = useMemo(() => dashboardHref(origin), [origin])
  const connected = dashboardUrl !== 'about:blank'

  const connect = (): void => {
    const next = normalizeOrigin(draft)
    if (next === '') return
    localStorage.setItem(STORAGE_KEY, next)
    setOrigin(next)
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">Voice Assistant DSH</p>
          <h1>远程 DSH 看板</h1>
        </div>
        <form
          className="connect"
          onSubmit={(event) => {
            event.preventDefault()
            connect()
          }}
        >
          <label>
            <span>DSH 地址</span>
            <input
              value={draft}
              placeholder="https://your-dsh.example.com"
              onChange={event => { setDraft(event.target.value) }}
            />
          </label>
          <button type="submit">连接</button>
        </form>
      </header>
      <section className="notice">
        <strong>当前嵌入：</strong>
        <span>{origin}</span>
        <a href={dashboardUrl} target="_blank" rel="noreferrer">新窗口打开</a>
      </section>
      {connected
        ? (
            <iframe
              title="DeepSeek Harness"
              className="frame"
              src={dashboardUrl}
              allow="clipboard-read; clipboard-write; microphone; camera; autoplay"
            />
          )
        : <section className="empty">请输入完整的 DSH 地址，例如 https://your-dsh.example.com</section>}
    </main>
  )
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />)
