import { useState } from 'react';

export default function TicketDetail({ ticket, onClose }) {
  const [activeTab, setActiveTab] = useState('card'); // 'card' | 'email'

  if (!ticket) return null;

  return (
    <div className="absolute top-4 left-4 bottom-4 w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[1000] flex flex-col overflow-hidden">
      {/* Header */}
      <div className={`flex justify-between items-center p-4 border-b ${ticket.status === 'escalated' ? 'bg-red-900/30 border-red-500/30' : 'bg-slate-800/50 border-slate-800'}`}>
        <div>
          <span className="text-xs font-mono text-slate-400">TICKET ID</span>
          <h2 className="text-lg font-semibold text-slate-100 truncate w-64" title={ticket.id}>
            #{ticket.id.slice(0, 8).toUpperCase()}
          </h2>
          {ticket.simulatedAge > 0 && (
            <div className="text-xs font-mono text-slate-500 mt-0.5">
              AGE: {ticket.simulatedAge}h
            </div>
          )}
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Main Badges */}
        <div className="flex gap-2 flex-wrap">
          <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
            {ticket.category || 'Uncategorized'}
          </span>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
            ticket.status === 'resolved' ? 'bg-slate-500/20 text-slate-300 border-slate-500/30' :
            ticket.status === 'escalated' ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' :
            ticket.status === 'stalled' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
            'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }`}>
            {(ticket.status || 'NEW').toUpperCase()}
          </span>
          {ticket.severity && (
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
              ticket.severity >= 7 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              ticket.severity >= 4 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              SEV {ticket.severity}/10
            </span>
          )}
        </div>

        {/* Photo */}
        {ticket.imageUrl && (
          <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
            <img src={ticket.imageUrl} alt="Issue" className="w-full h-48 object-cover" />
          </div>
        )}

        {/* Agent 2 Brief */}
        {ticket.brief && (
          <div className="bg-slate-800 rounded-lg border border-indigo-500/30 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-indigo-500/10 border-b border-indigo-500/30">
              <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Grievance Brief
              </h3>
              <div className="flex gap-1 bg-slate-900 rounded p-0.5">
                <button 
                  onClick={() => setActiveTab('card')}
                  className={`text-[10px] px-2 py-1 rounded font-medium ${activeTab === 'card' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  CARD
                </button>
                <button 
                  onClick={() => setActiveTab('email')}
                  className={`text-[10px] px-2 py-1 rounded font-medium ${activeTab === 'email' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  EMAIL
                </button>
              </div>
            </div>
            
            <div className="p-3">
              {activeTab === 'card' ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-100">{ticket.brief.card.title}</h4>
                  <p className="text-xs text-slate-300">{ticket.brief.card.summary}</p>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Priority Actions:</span>
                    <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc marker:text-indigo-400">
                      {ticket.brief.card.priority_actions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap bg-slate-900 p-2 rounded">
                  {ticket.brief.email}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reasoning (Agent 1) */}
        {ticket.reasoning && (
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Triage AI Analysis
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {ticket.reasoning}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
