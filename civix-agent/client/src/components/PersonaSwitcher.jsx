import { useState } from 'react';

export default function PersonaSwitcher({ persona, setPersona }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');

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
