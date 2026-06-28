import React from 'react';

export default function ProjectOverview({ onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#1e2336] rounded-2xl shadow-2xl overflow-y-auto border border-slate-700/50 flex flex-col animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-blue-500 text-white shadow-sm">
              <span className="font-serif italic font-bold text-[15px] leading-none mb-0.5">i</span>
            </div>
            <h2 className="text-xl font-display font-medium text-slate-100 tracking-wide">
              Project Overview
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          
          {/* PROBLEM */}
          <div className="bg-[#0b0f19] p-6 rounded-xl border border-slate-800/80 shadow-md">
            <h3 className="flex items-center gap-2 text-rose-500 font-sans font-medium text-sm tracking-widest uppercase mb-4">
              <span className="text-base filter saturate-150 drop-shadow-md">🛑</span> THE PROBLEM
            </h3>
            <p className="text-slate-300 leading-relaxed text-[15px]">
              Municipal authorities are overwhelmed by fragmented, duplicate civic issue reports. Critical infrastructure failures get buried in the noise, leaving citizens frustrated with a lack of transparency, follow-through, and accountability.
            </p>
          </div>

          {/* SOLUTION */}
          <div className="bg-[#0b0f19] p-6 rounded-xl border border-slate-800/80 shadow-md">
            <h3 className="flex items-center gap-2 text-blue-500 font-sans font-medium text-sm tracking-widest uppercase mb-4">
              <span className="text-base filter saturate-150 drop-shadow-md">💡</span> THE SOLUTION
            </h3>
            <p className="text-slate-300 leading-relaxed text-[15px]">
              CivixAgent is a 3-agent swarm system (Triage, Escalation, and Verification) that acts as an autonomous middle-layer. It uses Gemini Vision to classify issue severity from photos, detects duplicate reports within 50 meters, and autonomously escalates unresolved tickets to higher tiers.
            </p>
          </div>

          {/* KEY FEATURES */}
          <div className="bg-[#0b0f19] p-6 rounded-xl border border-slate-800/80 shadow-md">
            <h3 className="flex items-center gap-2 text-fuchsia-400 font-sans font-medium text-sm tracking-widest uppercase mb-4">
              <span className="text-base filter saturate-150 drop-shadow-md">✨</span> KEY FEATURES
            </h3>
            <ul className="text-slate-300 leading-relaxed text-[15px] space-y-3">
              <li className="flex gap-3">
                <span className="text-slate-600 mt-1 text-xs">◆</span>
                <span><strong>AI-Powered Triage & Scoring:</strong> Gemini Vision instantly analyzes photos to assign priority and routing.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-600 mt-1 text-xs">◆</span>
                <span><strong>Spatial Deduplication:</strong> Automatically clusters similar reports within a 50m radius, reinforcing severity.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-600 mt-1 text-xs">◆</span>
                <span><strong>Autonomous SLA Escalation:</strong> Time-based simulation automatically escalates stalled tickets to Tier-2.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-600 mt-1 text-xs">◆</span>
                <span><strong>AI-Drafted Grievance Briefs:</strong> Generates structured action plans for municipal workers.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-600 mt-1 text-xs">◆</span>
                <span><strong>Visual Repair Verification:</strong> Agent 3 analyzes post-repair photos to verify the fix.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-600 mt-1 text-xs">◆</span>
                <span><strong>Closed-Loop Citizen Confirmation:</strong> Ensures accountability by requiring citizen sign-off.</span>
              </li>
            </ul>
          </div>

          {/* TECH STACK */}
          <div className="bg-[#0b0f19] p-6 rounded-xl border border-slate-800/80 shadow-md">
            <h3 className="flex items-center gap-2 text-emerald-400 font-sans font-medium text-sm tracking-widest uppercase mb-4">
              <span className="text-base filter saturate-150 drop-shadow-md">🛠️</span> TECH STACK
            </h3>
            <ul className="text-slate-300 leading-relaxed text-[15px] space-y-2">
              <li className="flex gap-3"><span className="text-slate-600 mt-1 text-xs">◆</span> <strong>AI:</strong> Google Gemini API (Vision & Pro)</li>
              <li className="flex gap-3"><span className="text-slate-600 mt-1 text-xs">◆</span> <strong>Database & Auth:</strong> Firebase (Firestore + Authentication)</li>
              <li className="flex gap-3"><span className="text-slate-600 mt-1 text-xs">◆</span> <strong>Frontend/Backend:</strong> React (Vite), Express.js, Node.js</li>
              <li className="flex gap-3"><span className="text-slate-600 mt-1 text-xs">◆</span> <strong>Media & Mapping:</strong> Cloudinary, Leaflet (OpenStreetMap)</li>
            </ul>
          </div>

          {/* TRY THE DEMO */}
          <div className="bg-[#0b0f19] p-6 rounded-xl border border-slate-800/80 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50"></div>
            <h3 className="flex items-center gap-2 text-indigo-400 font-sans font-medium text-sm tracking-widest uppercase mb-4">
              <span className="text-base filter saturate-150 drop-shadow-md">🚀</span> TRY THE DEMO
            </h3>
            <p className="text-slate-300 mb-4 text-[15px]">To see the Agent Swarm in action:</p>
            <ol className="text-slate-300 leading-relaxed text-[15px] space-y-3">
              <li className="flex gap-3">
                <span className="text-slate-600 mt-1 text-xs">1.</span>
                <span>Switch to <strong>Worker Mode</strong> (passphrase: <code className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700">civix2026</code>).</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-600 mt-1 text-xs">2.</span>
                <span>Click <strong>"Simulate Time (+6h)"</strong> at the bottom to watch tickets automatically escalate based on SLA breaches.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-600 mt-1 text-xs">3.</span>
                <span>Open the <strong>Agent Activity Feed</strong> (bottom right) to see real-time, autonomous agent decisions.</span>
              </li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  );
}
