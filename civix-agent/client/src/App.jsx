import { useState, useEffect, useRef } from 'react'
import { silentSignIn } from './firebase'
import './index.css'
import Map from './components/Map'
import PersonaSwitcher from './components/PersonaSwitcher'
import TicketDetail from './components/TicketDetail'
import ReportModal from './components/ReportModal'
import ActivityFeed from './components/ActivityFeed'
import ProjectOverview from './components/ProjectOverview'
import { useTickets } from './hooks/useTickets'

function App() {
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [persona, setPersona] = useState('citizen')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showProjectOverview, setShowProjectOverview] = useState(false)
  const [simulatingTime, setSimulatingTime] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  
  // Ref to track previous tickets for transition detection
  const prevTicketsRef = useRef([]);

  const { tickets, loading, error } = useTickets()

  // Compute the live active ticket from the tickets array to fix the stale state bug
  const activeTicket = selectedTicket 
    ? tickets.find(t => t.id === selectedTicket.id) || selectedTicket 
    : null;

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
    <div className="min-h-screen relative bg-slate-950 text-slate-200 font-sans">
      {/* Top Bar - Glassmorphism */}
      <header className="absolute top-4 left-4 z-[1000] flex items-center gap-4">
        <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 px-5 py-3 rounded-2xl shadow-2xl">
          {/* Shield Icon */}
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-emerald-400 tracking-tight leading-none">CivixAgent</h1>
              <button
                onClick={() => setShowProjectOverview(true)}
                className="flex items-center justify-center w-5 h-5 rounded bg-blue-500 text-white hover:bg-blue-400 transition-colors shadow-sm cursor-pointer ml-1"
                title="Project Overview"
              >
                <span className="font-serif italic font-bold text-[13px] leading-none mb-0.5">i</span>
              </button>
            </div>
            <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase mt-1">Autonomous Tri-Agent Infrastructure</span>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span className="text-slate-400 font-medium font-mono uppercase">
              {loading ? 'Booting...' : `${tickets.length} Reports`}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-700/50"></div>
          {!firebaseUser ? (
            <span className="text-amber-500 font-medium">Connecting...</span>
          ) : (
            <span className="text-slate-500">Connected</span>
          )}
        </div>
      </header>

      {/* Main Map Content */}
      <div className="h-screen w-full">
        <Map tickets={tickets} onMarkerClick={(ticket) => setSelectedTicket(ticket)} />
      </div>

      {/* Overlays */}
      <PersonaSwitcher persona={persona} setPersona={setPersona} />

      {activeTicket && (
        <TicketDetail 
          ticket={activeTicket} 
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
              await fetch('/api/simulate-time', { 
                method: 'POST',
                headers: {
                  'x-worker-passphrase': import.meta.env.VITE_MUNICIPAL_WORKER_PASSPHRASE || 'civix2026'
                }
              });
            } catch (err) {
              console.error(err);
            } finally {
              setSimulatingTime(false);
            }
          }}
          disabled={simulatingTime}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-8 py-3.5 rounded-full font-medium text-sm text-slate-900 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:scale-100 backdrop-blur-md"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
        >
          {simulatingTime ? (
            <svg className="animate-spin w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {simulatingTime ? 'Simulating SLA Breach...' : 'Fast-Forward Time (+6h)'}
        </button>
      )}

      {/* Floating Report Button — Citizen only */}
      {persona === 'citizen' && !showReportModal && (
        <button
          onClick={() => setShowReportModal(true)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-8 py-3.5 rounded-full font-medium text-sm text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1 active:translate-y-0 backdrop-blur-md bg-emerald-500 hover:bg-emerald-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Report Issue Here
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

      {/* Agent Transparency Panel */}
      <ActivityFeed activeTicketId={activeTicket?.id} />

      {/* Project Overview Modal */}
      {showProjectOverview && (
        <ProjectOverview onClose={() => setShowProjectOverview(false)} />
      )}
    </div>
  )
}

export default App
