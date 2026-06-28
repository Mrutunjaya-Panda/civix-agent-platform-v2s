import { useState, useRef, useEffect } from 'react';
import { useActivityFeed } from '../hooks/useActivityFeed';

export default function ActivityFeed() {
  const [isOpen, setIsOpen] = useState(true);
  const { feed } = useActivityFeed(20);
  const feedEndRef = useRef(null);

  // Auto-scroll to top when new items arrive
  useEffect(() => {
    if (feedEndRef.current) {
      feedEndRef.current.scrollTop = 0;
    }
  }, [feed]);

  return (
    <div className={`absolute bottom-4 right-4 w-96 bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl shadow-2xl z-[1000] overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'h-[28rem]' : 'h-14'}`}>
      
      {/* Header */}
      <div 
        className="flex justify-between items-center px-5 py-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors shrink-0 bg-slate-900/40"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className={`absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ${isOpen ? 'animate-ping opacity-75' : 'opacity-0'}`}></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="text-sm font-display font-semibold text-slate-100 tracking-wide">Swarm Activity Feed</span>
          <span 
            className="ml-2 text-[10px] text-slate-400 cursor-help border border-slate-600/50 rounded-full w-4 h-4 flex items-center justify-center hover:text-white hover:border-slate-400 transition-colors"
            title="Live log of autonomous decisions made by our 3 AI agents"
          >
            ?
          </span>
        </div>
        <button className="text-slate-500 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors">
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Feed Content */}
      <div 
        ref={feedEndRef}
        className={`flex-1 overflow-y-auto p-5 space-y-5 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {feed.map(entry => (
          <div key={entry.id} className="text-sm border-l border-slate-700 pl-4 pb-2 relative group hover:border-emerald-500/50 transition-colors">
            <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-600 group-hover:bg-emerald-500 transition-colors"></div>
            
            <div className="flex justify-between items-start gap-4 mb-2">
              <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 leading-tight">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                {entry.type === 'SYSTEM' ? 'System' : `Agent (${entry.type})`}
              </span>
              <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                {new Date(entry.createdAt || entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            
            <p className="text-slate-300 text-xs leading-relaxed opacity-90">
              {entry.message}
            </p>
            
            {entry.ticketId && (
              <span className="inline-block mt-2 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                Ref: #{entry.ticketId.slice(0, 8)}
              </span>
            )}
          </div>
        ))}
        {feed.length === 0 && (
          <div className="text-center text-slate-500 text-xs italic mt-10">
            Awaiting agent activity...
          </div>
        )}
      </div>
    </div>
  );
}
