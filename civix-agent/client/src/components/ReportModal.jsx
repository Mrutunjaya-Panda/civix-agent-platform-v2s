import { useState, useRef } from 'react';
import { uploadImage } from '../lib/cloudinary';

const LOCATION_TIMEOUT_MS = 10000;

export default function ReportModal({ onClose, onSuccess }) {
  const [step, setStep] = useState('form'); // 'form' | 'uploading' | 'locating' | 'submitting' | 'done' | 'error'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [note, setNote] = useState('');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // ── Photo selection & Cloudinary upload ───────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep('uploading');

    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      setStep('form');
    } catch (err) {
      setErrorMsg(`Upload failed: ${err.message}`);
      setStep('error');
    }
  };

  // ── Geolocation ───────────────────────────────────────────────────────────────
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.');
      return;
    }
    setStep('locating');
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStep('form');
      },
      (err) => {
        setLocationError(`Location denied — ${err.message}. Drop a pin on the map instead.`);
        setStep('form');
      },
      { timeout: LOCATION_TIMEOUT_MS }
    );
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl) { setErrorMsg('Please upload a photo first.'); return; }
    if (!location) { setErrorMsg('Please share your location first.'); return; }

    setStep('submitting');
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, location, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      setResult(data);
      setStep('done');
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setErrorMsg(err.message);
      setStep('error');
    }
  };

  const isLoading = ['uploading', 'locating', 'submitting'].includes(step);
  const canSubmit = imageUrl && location && !isLoading;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Report a Civic Issue</h2>
            <p className="text-xs text-slate-400 mt-0.5">Bhubaneswar, Odisha</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              📷 Photo <span className="text-red-400">*</span>
            </label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                {step === 'uploading' && (
                  <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                    <div className="text-indigo-400 text-sm flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Uploading…
                    </div>
                  </div>
                )}
                {imageUrl && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    ✓ Uploaded
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); setImageUrl(null); }}
                  className="absolute top-2 left-2 bg-slate-900/80 text-slate-300 text-xs px-2 py-0.5 rounded-full hover:bg-slate-800"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">Tap to upload photo</span>
                <span className="text-xs">Compressed automatically</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              📍 Location <span className="text-red-400">*</span>
            </label>
            {location ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-emerald-400 font-mono">
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </span>
                <button type="button" onClick={() => setLocation(null)} className="ml-auto text-slate-500 hover:text-slate-300 text-xs">Reset</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={step === 'locating'}
                className="w-full px-4 py-2.5 border border-slate-700 rounded-lg text-sm text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {step === 'locating' ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Getting location…
                  </>
                ) : '📍 Use My Current Location'}
              </button>
            )}
            {locationError && <p className="text-xs text-amber-400 mt-1">{locationError}</p>}
          </div>

          {/* Optional note */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              📝 Description <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Brief description of the issue…"
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Error */}
          {step === 'error' && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
              ❌ {errorMsg}
            </div>
          )}

          {/* Done */}
          {step === 'done' && result && (
            <div className="px-3 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-300 space-y-1">
              <div className="font-medium">✅ Report submitted!</div>
              {result.ticketId && <div className="text-xs font-mono text-slate-400">ID: {result.ticketId}</div>}
              {result.category && <div className="text-xs">Category: <span className="text-emerald-400">{result.category}</span></div>}
              {result.severity && <div className="text-xs">Severity: <span className="text-emerald-400">{result.severity}/10</span></div>}
              {result.status === 'clustered' && <div className="text-xs text-amber-400">⚡ Merged into existing cluster</div>}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit || step === 'done'}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canSubmit && step !== 'done'
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : undefined,
              color: 'white',
            }}
          >
            {step === 'submitting' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                AI is analysing your report…
              </span>
            ) : step === 'done' ? '✅ Report submitted — pin will appear on map' : 'Submit Report to AI Triage'}
          </button>
        </form>
      </div>
    </div>
  );
}
