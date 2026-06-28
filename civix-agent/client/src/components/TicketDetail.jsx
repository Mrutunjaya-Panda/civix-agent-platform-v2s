import { useState } from 'react';
import { uploadImage } from '../lib/cloudinary';

export default function TicketDetail({ ticket, onClose, persona, currentUser }) {
  const [activeTab, setActiveTab] = useState('card'); // 'card' | 'email'
  const [repairFile, setRepairFile] = useState(null);
  const [processingRepair, setProcessingRepair] = useState(false);
  const [repairError, setRepairError] = useState('');
  const [processingConfirm, setProcessingConfirm] = useState(false);

  if (!ticket) return null;

  return (
    <div className="absolute top-4 left-4 bottom-4 w-96 bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-2xl z-[1000] flex flex-col overflow-hidden animate-in slide-in-from-left-4 fade-in duration-300">
      {/* Header */}
      <div className={`flex justify-between items-center p-5 border-b ${ticket.status === 'escalated' ? 'bg-rose-900/40 border-rose-500/30' : 'bg-slate-900/40 border-white/5'}`}>
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
          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${
            ticket.status === 'resolved' ? 'bg-slate-500/20 text-slate-300 border-slate-500/30' :
            ticket.status === 'escalated' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' :
            ticket.status === 'stalled' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
            'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }`}>
            {(ticket.status || 'NEW').toUpperCase()}
          </span>
          {ticket.severity && (
            <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${
              ticket.severity >= 7 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
              ticket.severity >= 4 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              SEV {ticket.severity}/10
            </span>
          )}
          {ticket.duplicateCount > 1 && (
            <span className="px-3 py-1.5 text-xs font-bold rounded-full border bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 flex items-center gap-1" title="Cluster Reinforcement (Multiple Reports Merged)">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {ticket.duplicateCount} REPORTS
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

      {/* Closed-Loop Resolution Controls (Footer) */}
      <div className="p-5 border-t border-white/5 bg-slate-900/40 shrink-0">
        
        {/* WORKER FLOW: Mark as Repaired */}
        {persona === 'worker' && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Submit Repair Proof</h3>
            <div className="flex gap-2 items-center">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  setRepairFile(e.target.files[0]);
                  setRepairError('');
                }}
                className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 text-slate-300 w-full"
              />
            </div>
            {repairError && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded">
                {repairError}
              </div>
            )}
            <button
              disabled={!repairFile || processingRepair}
              onClick={async () => {
                setProcessingRepair(true);
                setRepairError('');
                try {
                  const url = await uploadImage(repairFile);
                  const res = await fetch('/api/verify', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'x-worker-passphrase': import.meta.env.VITE_MUNICIPAL_WORKER_PASSPHRASE || 'civix2026'
                    },
                    body: JSON.stringify({ ticketId: ticket.id, repairImageUrl: url })
                  });
                  const data = await res.json();
                  if (!data.success) {
                    throw new Error(data.error || 'Verification failed');
                  }
                  if (!data.isRepaired) {
                    setRepairError('Agent 3 rejected the proof. ' + data.recap);
                  } else {
                    setRepairFile(null); // success
                  }
                } catch (err) {
                  setRepairError(err.message);
                } finally {
                  setProcessingRepair(false);
                }
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-semibold text-sm transition-colors flex justify-center items-center gap-2"
            >
              {processingRepair ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                  Agent 3 Verifying...
                </>
              ) : 'Submit for Verification'}
            </button>
          </div>
        )}

        {/* CITIZEN FLOW: Confirm Resolution */}
        {ticket.status === 'resolved' && (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3">
              <h3 className="text-xs font-semibold text-emerald-400 uppercase mb-2">Repair Recap (Agent 3)</h3>
              {ticket.repairImageUrl && (
                <img src={ticket.repairImageUrl} alt="Repair" className="w-full h-32 object-cover rounded mb-2 border border-emerald-500/30" />
              )}
              <p className="text-xs text-slate-300">{ticket.agentRecap}</p>
            </div>
            
            {persona === 'citizen' && currentUser?.uid === ticket.reportedBy && (
              <button
                disabled={processingConfirm}
                onClick={async () => {
                  setProcessingConfirm(true);
                  try {
                    await fetch('/api/confirm', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ticketId: ticket.id })
                    });
                    onClose(); // Close on success
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setProcessingConfirm(false);
                  }
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-semibold text-sm transition-colors flex justify-center"
              >
                {processingConfirm ? 'Closing...' : 'Confirm Resolution'}
              </button>
            )}
          </div>
        )}

        {/* CLOSED STATE */}
        {ticket.status === 'closed' && (
          <div className="text-center p-2 bg-slate-800 rounded border border-slate-700">
            <span className="text-sm font-semibold text-slate-400">This issue has been closed.</span>
          </div>
        )}
      </div>
    </div>
  );
}
