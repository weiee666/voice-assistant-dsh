import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

function App(): JSX.Element {
  return (
    <main className="page">
      <section className="panel">
        <p className="eyebrow">Voice Assistant DSH</p>
        <h1>公网看板准备中</h1>
        <p>
          这个页面会作为 Vercel 上的远程入口。模型密钥、本地文件和 Telegram 轮询仍由你本机运行的 DSH 插件负责。
        </p>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />)
