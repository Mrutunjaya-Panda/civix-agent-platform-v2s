import { useState } from 'react';

export default function PersonaSwitcher({ persona, setPersona }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const expectedPassphrase = import.meta.env.VITE_MUNICIPAL_WORKER_PASSPHRASE || 'civix2026';

  const handleSwitch = (role) => {
    if (role === 'worker' && persona !== 'worker') {
      setShowPrompt(true);
      setError('');
      setPassphrase('');
    } else {
      setPersona(role);
      setShowPrompt(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passphrase === expectedPassphrase) {
      setPersona('worker');
      setShowPrompt(false);
    } else {
      setError('Incorrect passphrase');
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset-demo', {
        method: 'POST',
        headers: {
          'x-worker-passphrase': expectedPassphrase
        }
      });
      if (!res.ok) {
        throw new Error('Reset failed');
      }
      setShowResetConfirm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to reset demo data: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
      <div className="flex gap-1 bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 shadow-2xl rounded-2xl p-1.5">
        <button
          onClick={() => handleSwitch('citizen')}
          className={`px-5 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
            persona === 'citizen'
              ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          Citizen
        </button>
        <button
          onClick={() => handleSwitch('worker')}
          className={`px-5 py-2 text-sm font-medium rounded-xl transition-all duration-300 flex items-center gap-2 ${
            persona === 'worker'
              ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          Worker
          {persona === 'worker' && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )}
        </button>
      </div>

      {persona === 'worker' && !showPrompt && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-rose-500/20 shadow-lg rounded-xl p-3 w-64 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Admin Controls</span>
          </div>
          
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-1.5 px-3 text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Demo Data
            </button>
          ) : (
            <div className="bg-rose-950/50 p-2 rounded-lg border border-rose-500/30">
              <p className="text-[10px] text-rose-200 mb-2 leading-tight">
                This will clear all current tickets and restore the original demo dataset. Continue?
              </p>
              <div className="flex gap-2">
                <button
                  disabled={isResetting}
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-1 px-2 text-[10px] bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isResetting}
                  onClick={handleResetDemo}
                  className="flex-1 py-1 px-2 text-[10px] bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isResetting ? 'Resetting...' : 'Confirm Reset'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showPrompt && (
        <form 
          onSubmit={handleSubmit}
          className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-xl w-64"
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Enter Worker Passphrase
          </label>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-amber-500 mb-2"
            placeholder="Passphrase"
            autoFocus
          />
          {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowPrompt(false)}
              className="px-3 py-1 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-amber-500 text-slate-900 rounded-md hover:bg-amber-400 font-medium"
            >
              Unlock
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
