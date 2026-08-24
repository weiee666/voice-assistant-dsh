import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const DEFAULT_LOCAL_ORIGIN = 'http://127.0.0.1:3080'

function targetUrl(): string {
  const params = new URLSearchParams(window.location.search)
  const queryOrigin = params.get('dsh')?.trim()
  const envOrigin = import.meta.env.VITE_DSH_ORIGIN as string | undefined
  const origin = (queryOrigin !== undefined && queryOrigin !== '')
    ? queryOrigin
    : envOrigin !== undefined && envOrigin.trim() !== ''
      ? envOrigin.trim()
      : DEFAULT_LOCAL_ORIGIN
  const url = new URL(origin.replace(/\/+$/u, ''))
  url.searchParams.set('wechatAssistant', '1')
  return url.toString()
}

function App(): JSX.Element {
  return (
    <iframe
      title="DeepSeek Harness"
      className="frame"
      src={targetUrl()}
      allow="clipboard-read; clipboard-write; microphone; camera; autoplay"
    />
  )
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />)
