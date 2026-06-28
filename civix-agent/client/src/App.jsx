import { useState, useEffect, useRef } from 'react'
import { silentSignIn } from './firebase'
import './index.css'
import Map from './components/Map'
import PersonaSwitcher from './components/PersonaSwitcher'
import TicketDetail from './components/TicketDetail'
import ReportModal from './components/ReportModal'
import { useTickets } from './hooks/useTickets'

function App() {
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [persona, setPersona] = useState('citizen')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [simulatingTime, setSimulatingTime] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  
  // Ref to track previous tickets for transition detection
  const prevTicketsRef = useRef([]);

  const { tickets, loading, error } = useTickets()

  useEffect(() => {
    silentSignIn().then(user => {
      if (user) setFirebaseUser(user)
    })
  }, [])

  // Detect status transitions for the toast notification
  useEffect(() => {
    if (!firebaseUser || !tickets.length) {
      prevTicketsRef.current = tickets;
      return;
    }

    const prevTickets = prevTicketsRef.current;
    
    // Only check if we had tickets before (avoids firing on initial load)
    if (prevTickets.length > 0) {
      tickets.forEach(ticket => {
        // Only care about tickets this user reported
        if (ticket.reportedBy === firebaseUser.uid) {
          const prev = prevTickets.find(t => t.id === ticket.id);
          // If it just transitioned to resolved
          if (prev && prev.status !== 'resolved' && ticket.status === 'resolved') {
            setToastMessage('Your issue has been marked as Repaired! Click the pin to view.');
            setTimeout(() => setToastMessage(null), 8000);
          }
        }
      });
    }

    prevTicketsRef.current = tickets;
  }, [tickets, firebaseUser]);

  return (
    <div className="min-h-screen relative bg-slate-950 text-slate-200">
      {/* Top Bar */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 z-[1000] flex items-center justify-between px-6 shadow-md">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-indigo-400">CivixAgent</h1>
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-400 border border-slate-700">
            {persona.toUpperCase()} MODE
          </span>
          {!firebaseUser && <span className="text-xs text-amber-500">Connecting...</span>}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {loading && <span>Loading tickets…</span>}
          {!loading && <span>{tickets.length} report{tickets.length !== 1 ? 's' : ''} live</span>}
        </div>
      </header>

      {/* Main Map Content */}
      <div className="pt-16 h-screen w-full">
        <Map tickets={tickets} onMarkerClick={(ticket) => setSelectedTicket(ticket)} />
      </div>

      {/* Overlays */}
      <PersonaSwitcher persona={persona} setPersona={setPersona} />

      {selectedTicket && (
        <TicketDetail 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          persona={persona}
          currentUser={firebaseUser}
        />
      )}

      {/* Floating Simulate Time Button — Worker only */}
      {persona === 'worker' && (
        <button
          onClick={async () => {
            setSimulatingTime(true);
            try {
              await fetch('/api/simulate-time', { method: 'POST' });
            } catch (err) {
              console.error(err);
            } finally {
              setSimulatingTime(false);
            }
          }}
          disabled={simulatingTime}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
        >
          {simulatingTime ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {simulatingTime ? 'Simulating...' : 'Simulate Time (+6h)'}
        </button>
      )}

      {/* Floating Report Button — Citizen only */}
      {persona === 'citizen' && !showReportModal && (
        <button
          onClick={() => setShowReportModal(true)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white shadow-2xl transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Report an Issue
        </button>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            setTimeout(() => setShowReportModal(false), 3000)
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[2000] bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl font-semibold text-sm flex items-center gap-2 animate-bounce">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {toastMessage}
        </div>
      )}
    </div>
  )
}

export default App
