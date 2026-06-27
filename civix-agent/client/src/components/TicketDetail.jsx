export default function TicketDetail({ ticket, onClose }) {
  if (!ticket) return null;

  return (
    <div className="absolute top-4 left-4 bottom-4 w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[1000] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-800/50">
        <div>
          <span className="text-xs font-mono text-slate-400">TICKET ID</span>
          <h2 className="text-lg font-semibold text-slate-100 truncate w-64" title={ticket.id}>
            #{ticket.id.slice(0, 8).toUpperCase()}
          </h2>
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
            ticket.status === 'escalated' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
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

        {/* Reasoning */}
        {ticket.reasoning && (
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Analysis
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
