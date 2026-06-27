import { useState, useEffect } from 'react'
import { silentSignIn } from './firebase'
import './index.css'

function App() {
  const [health, setHealth] = useState(null)
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [authStatus, setAuthStatus] = useState('connecting')

  useEffect(() => {
    // Verify API proxy
    fetch('/api/health')
      .then(r => r.json())
      .then(data => setHealth(data))
      .catch(() => setHealth({ status: 'error' }))

    // Silent Firebase Anonymous Auth
    silentSignIn().then(user => {
      if (user) {
        setFirebaseUser(user)
        setAuthStatus('ok')
        console.log('[CivixAgent] Anonymous UID:', user.uid)
      } else {
        setAuthStatus('error')
      }
    })
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

      {/* Status Badges */}
      <div className="flex flex-col gap-3 items-center">

        {/* API Health */}
        <StatusBadge
          ok={health?.status === 'ok'}
          loading={health === null}
          label={health?.status === 'ok' ? `API Online — ${health.service}` : 'API Offline'}
          icon="⚡"
        />

        {/* Firebase Auth */}
        <StatusBadge
          ok={authStatus === 'ok'}
          loading={authStatus === 'connecting'}
          label={authStatus === 'ok'
            ? `Firebase Auth — ${firebaseUser?.uid?.slice(0, 12)}...`
            : authStatus === 'connecting' ? 'Connecting to Firebase...' : 'Firebase Auth Failed'}
          icon="🔥"
        />
      </div>

      {/* Phase indicator */}
      <div className="flex gap-3 flex-wrap justify-center">
        <Chip color="accent">Phase 1 — Foundation</Chip>
        <Chip color="muted">Tailwind ✓</Chip>
        <Chip color="muted">Firebase SDK ✓</Chip>
        <Chip color="muted">Express Proxy ✓</Chip>
      </div>
    </div>
  )
}

function StatusBadge({ ok, loading, label, icon }) {
  const color = loading ? 'var(--color-muted)' : ok ? 'var(--color-success)' : 'var(--color-danger)'
  return (
    <div className="px-4 py-2 rounded-full text-sm font-medium border"
         style={{
           background: loading ? 'rgba(148,163,184,0.1)' : ok ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
           borderColor: color,
           color,
         }}>
      {icon} {loading ? '⏳ ' : ok ? '✅ ' : '❌ '}{label}
    </div>
  )
}

function Chip({ children, color }) {
  return (
    <span className="px-3 py-1 rounded-md text-xs font-mono"
          style={{ background: 'var(--color-surface)', color: `var(--color-${color})`, border: '1px solid var(--color-border)' }}>
      {children}
    </span>
  )
}

export default App
