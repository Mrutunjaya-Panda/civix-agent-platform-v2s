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
    <div className={`absolute bottom-4 right-4 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[1000] flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'h-96' : 'h-12'}`}>
      
      {/* Header */}
      <div 
        className="flex justify-between items-center px-4 py-3 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors shrink-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <svg className={`w-4 h-4 text-emerald-400 ${isOpen ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-semibold text-slate-200">Agent Activity Feed</span>
        </div>
        <button className="text-slate-400 hover:text-white">
          <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Feed Content */}
      <div 
        ref={feedEndRef}
        className={`flex-1 overflow-y-auto p-4 space-y-3 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {feed.map(entry => (
          <div key={entry.id} className="text-sm border-l-2 pl-3 pb-1 border-indigo-500/50 relative group">
            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-indigo-500"></div>
            
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">
                {entry.type}
              </span>
              <span className="text-[10px] text-slate-600 font-mono">
                {new Date(entry.createdAt || entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            
            <p className="text-slate-300 text-xs leading-relaxed">
              {entry.message}
            </p>
            
            {entry.ticketId && (
              <span className="inline-block mt-1 text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
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
