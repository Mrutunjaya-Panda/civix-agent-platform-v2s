import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [health, setHealth] = useState(null)

  // Verify API proxy works on mount
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => setHealth(data))
      .catch(() => setHealth({ status: 'error' }))
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8"
         style={{ background: 'var(--color-bg)' }}>

      {/* Logo / Title */}
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight"
            style={{ color: 'var(--color-primary)' }}>
          CivixAgent
        </h1>
        <p className="mt-2 text-lg" style={{ color: 'var(--color-muted)' }}>
          Autonomous Hyperlocal Civic Issue Manager
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
          Bhubaneswar, Odisha — Vibe2Ship Hackathon
        </p>
      </div>

      {/* API Health Badge */}
      <div className="px-4 py-2 rounded-full text-sm font-medium border"
           style={{
             background: health?.status === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
             borderColor: health?.status === 'ok' ? 'var(--color-success)' : 'var(--color-danger)',
             color: health?.status === 'ok' ? 'var(--color-success)' : 'var(--color-danger)',
           }}>
        {health === null
          ? '⏳ Connecting to API...'
          : health.status === 'ok'
          ? `✅ API Online — ${health.service}`
          : '❌ API Offline'}
      </div>

      {/* Tailwind test */}
      <div className="flex gap-3">
        <span className="px-3 py-1 rounded-md text-xs font-mono"
              style={{ background: 'var(--color-surface)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}>
          Phase 1 — Foundation
        </span>
        <span className="px-3 py-1 rounded-md text-xs font-mono"
              style={{ background: 'var(--color-surface)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
          Tailwind ✓
        </span>
      </div>
    </div>
  )
}

export default App
