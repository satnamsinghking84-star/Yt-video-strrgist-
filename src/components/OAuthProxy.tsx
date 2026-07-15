import React, { useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function OAuthProxy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (token) {
        setSuccess(true);
        if (window.opener) {
          // Send token back to creator-hisaab.ai.studio or any opener
          window.opener.postMessage({ type: 'GOOGLE_SHEETS_OAUTH_SUCCESS', accessToken: token }, '*');
        }
        // Also save to temporary storage in case postMessage communication is blocked
        localStorage.setItem('google_sheets_token_temp', token);
        
        // Close after a brief delay
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        setError('Google Sheets Token nahi mil saka. Kripya dobara koshish karein.');
      }
    } catch (err: any) {
      console.error('Proxy Auth Error:', err);
      // Give a localized helpful message
      let msg = err.message || String(err);
      if (msg.includes('popup-closed-by-user')) {
        msg = 'Sign-In popup window band ho gaya. Kripya dobara click karein.';
      } else if (msg.includes('unauthorized-domain')) {
        msg = 'Unauthorized domain error. Kripya ensure karein ki aap right URL use kar rahe hain.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-slate-100 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-bold mb-2">Google Sheets Authorization</h2>
        <p className="text-sm text-slate-500 mb-6">
          Kripya neeche diye gaye button par click karke apna Google Account connect karein taaki hum Google Sheets se data load kar sakein.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-start text-left gap-2">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Successfully Connected! Closing window...</span>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-emerald-100"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <span>Google Account Connect Karein</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
