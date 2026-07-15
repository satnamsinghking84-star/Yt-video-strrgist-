import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, RefreshCw, Check, AlertCircle, Info, Tv, CheckCircle2 } from 'lucide-react';
import { Channel, Video, Idea, VideoStatus } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onImportComplete: (message: string) => void;
}

interface FetchedRow {
  index: number;
  title: string;
  description: string;
  selected: boolean;
}

export default function GoogleSheetsModal({
  isOpen,
  onClose,
  channels,
  onImportComplete,
}: GoogleSheetsModalProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('google_sheets_token');
  });

  const [spreadsheetInput, setSpreadsheetInput] = useState('');
  const [sheetRange, setSheetRange] = useState('Sheet1!A:B');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchedRows, setFetchedRows] = useState<FetchedRow[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [importTarget, setImportTarget] = useState<'Pending' | 'Idea'>('Pending');
  const [importing, setImporting] = useState(false);

  // Listen for Google Sheets OAuth success messages from the popup window
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Allow messages from same origin, or any .run.app or .ai.studio domains (for cross-domain custom domain auth)
      const isAllowedOrigin = 
        event.origin === window.location.origin || 
        event.origin.endsWith('.run.app') || 
        event.origin.endsWith('.ai.studio');
        
      if (!isAllowedOrigin) return;

      if (event.data && event.data.type === 'GOOGLE_SHEETS_OAUTH_SUCCESS') {
        const token = event.data.accessToken;
        if (token) {
          setAccessToken(token);
          localStorage.setItem('google_sheets_token', token);
          onImportComplete('Google Sheets successfully connect ho gaya!');
        }
        setLoading(false);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => {
      window.removeEventListener('message', handleOAuthMessage);
    };
  }, [onImportComplete]);

  // Fallback check for localStorage in case postMessage communication is blocked
  useEffect(() => {
    const interval = setInterval(() => {
      const tempToken = localStorage.getItem('google_sheets_token_temp');
      if (tempToken) {
        setAccessToken(tempToken);
        localStorage.setItem('google_sheets_token', tempToken);
        localStorage.removeItem('google_sheets_token_temp');
        onImportComplete('Google Sheets successfully connect ho gaya!');
        setLoading(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [onImportComplete]);

  useEffect(() => {
    if (isOpen && channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [isOpen, channels, selectedChannelId]);

  if (!isOpen) return null;

  // Extract Spreadsheet ID from URL or return the raw ID
  const extractSpreadsheetId = (urlOrId: string) => {
    const trimmed = urlOrId.trim();
    const matches = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return matches ? matches[1] : trimmed;
  };

  // Google OAuth Login popup using proxy flow to bypass Firebase unauthorized-domain restrictions on custom domains
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const appUrl = (process.env.APP_URL || window.location.origin).replace(/\/$/, '');
      const authUrl = `${appUrl}/?oauth_proxy=true`;
      
      localStorage.removeItem('google_sheets_token_temp');
      
      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        authUrl,
        'GoogleSheetsOAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!popup) {
        setError('Popup blocker active hai! Kripya popups ko allow karein.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError('Google Sign-In failed: ' + (err.message || String(err)));
      setLoading(false);
    }
  };

  // Disconnect / Logout Sheets
  const handleDisconnect = () => {
    setAccessToken(null);
    localStorage.removeItem('google_sheets_token');
    setFetchedRows([]);
    setError('');
  };

  // Fetch Rows from Google Sheets API
  const handleFetchSheetData = async () => {
    if (!spreadsheetInput.trim()) {
      setError('Kripya Google Spreadsheet URL ya ID dalein.');
      return;
    }
    const spreadsheetId = extractSpreadsheetId(spreadsheetInput);
    if (!spreadsheetId) {
      setError('Invalid Spreadsheet URL ya ID.');
      return;
    }

    setLoading(true);
    setError('');
    setFetchedRows([]);

    try {
      const encodedRange = encodeURIComponent(sheetRange);
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 401) {
          setError('Session expire ho gaya. Kripya dobara login karein.');
          handleDisconnect();
        } else {
          setError(errData?.error?.message || 'Sheet data load karne me error aaya.');
        }
        return;
      }

      const data = await response.json();
      const values: string[][] = data.values || [];

      if (values.length === 0) {
        setError('Sheet khali hai ya koi valid row nahi mili.');
        return;
      }

      // Parse spreadsheet rows: Column A = Title, Column B = Description
      // Skip header row if it is like "title", "naam", etc.
      let startIndex = 0;
      const firstRow = values[0];
      if (
        firstRow &&
        firstRow[0] &&
        (firstRow[0].toLowerCase().includes('title') || 
         firstRow[0].toLowerCase().includes('name') ||
         firstRow[0].toLowerCase().includes('naam') ||
         firstRow[0].toLowerCase().includes('topic'))
      ) {
        startIndex = 1;
      }

      const rows: FetchedRow[] = [];
      for (let i = startIndex; i < values.length; i++) {
        const r = values[i];
        const title = r[0] ? r[0].trim() : '';
        const description = r[1] ? r[1].trim() : '';

        if (title) {
          rows.push({
            index: i,
            title,
            description,
            selected: true, // Default to selected
          });
        }
      }

      if (rows.length === 0) {
        setError('No valid rows with titles found. Kripya check karein ki Column A me titles hain ya nahi.');
      } else {
        setFetchedRows(rows);
      }
    } catch (err: any) {
      console.error('Fetch Sheets Error:', err);
      setError('Sheet fetch error: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection for a row
  const toggleRowSelect = (index: number) => {
    setFetchedRows(prev =>
      prev.map(r => (r.index === index ? { ...r, selected: !r.selected } : r))
    );
  };

  // Select all or deselect all
  const handleSelectAllToggle = (select: boolean) => {
    setFetchedRows(prev => prev.map(r => ({ ...r, selected: select })));
  };

  // Import Selected Rows to Firestore
  const handleImportToApp = async () => {
    const selectedRows = fetchedRows.filter(r => r.selected);
    if (selectedRows.length === 0) {
      setError('Kripya import karne ke liye kam se kam ek row select karein.');
      return;
    }
    if (!selectedChannelId) {
      setError('Kripya channel select karein.');
      return;
    }

    setImporting(true);
    setError('');

    try {
      const channel = channels.find(c => c.id === selectedChannelId);
      const channelName = channel ? channel.name : 'Selected Channel';

      for (const row of selectedRows) {
        const randomId = Math.random().toString(36).substring(2, 11);
        
        if (importTarget === 'Pending') {
          // Add as Pending Video
          const newVideo: Video = {
            id: `vid-${randomId}-${Date.now()}`,
            channelId: selectedChannelId,
            title: row.title,
            description: row.description || 'Google Sheets se automatically import kiya gaya.',
            script: '',
            voiceNotes: '',
            status: 'Pending',
            scheduledDate: '',
            checklist: {
              script: false,
              voice: false,
              fullVideo: false,
              thumbnail: false,
              title: false,
              description: false,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'videos', newVideo.id), newVideo);
        } else {
          // Add as Idea
          const newIdea: Idea = {
            id: `idea-${randomId}-${Date.now()}`,
            text: row.title + (row.description ? ` - ${row.description}` : ''),
            channelId: selectedChannelId,
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'ideas', newIdea.id), newIdea);
        }
      }

      onImportComplete(
        `Success! ${selectedRows.length} items ko "${channelName}" ke under successfully import kar diya gaya.`
      );
      onClose();
    } catch (err: any) {
      console.error('Import Error:', err);
      setError('Import fail ho gaya: ' + (err.message || String(err)));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#171A22] w-full max-w-[620px] max-h-[92vh] overflow-y-auto rounded-t-[22px] sm:rounded-[20px] border border-gray-200 dark:border-[#2A2F3B] shadow-xl transition-colors duration-150 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-start p-[18px] md:p-5 border-b border-gray-200 dark:border-[#2A2F3B] sticky top-0 bg-white dark:bg-[#171A22] z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-[36px] h-[36px] rounded-[10px] bg-emerald-500/10 text-emerald-600 dark:text-[#3ED586] flex items-center justify-center border border-emerald-500/15">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-[#F0F1F4] font-display">Google Sheets Se Import</h3>
              <p className="text-[11.5px] text-gray-500 dark:text-[#9AA0AF] mt-0.5">Title aur description seedhe sheets se load karein</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-100 dark:bg-[#1D212B] border border-gray-200 dark:border-[#2A2F3B] w-[30px] h-[30px] rounded-[9px] text-gray-500 dark:text-[#9AA0AF] hover:text-gray-900 dark:hover:text-[#F0F1F4] flex items-center justify-center transition-colors duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-[18px] md:p-5 flex-1 flex flex-col gap-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Connection Phase */}
          {!accessToken ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/5 text-emerald-500 flex items-center justify-center mb-4 border border-emerald-500/10">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h4 className="text-[15px] font-bold text-gray-900 dark:text-[#F0F1F4] font-display">Sarkari/Private Google Sheets Link Karein</h4>
              <p className="text-xs text-gray-500 dark:text-[#9AA0AF] max-w-sm mt-1.5 font-sans leading-relaxed">
                Apne spreadsheet se video titles aur descriptions seedhe pending deck me ek click me import karein. Mehnat bachayein!
              </p>
              
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="mt-6 flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-[#3ED586] dark:hover:bg-emerald-400 dark:text-[#0E1015] font-bold text-[13px] px-6 py-2.5 rounded-[11px] transition-all cursor-pointer shadow-sm disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                <span>Google Account Connect Karein</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Account Connected Header */}
              <div className="bg-emerald-500/5 dark:bg-[#3ED586]/5 border border-emerald-500/15 dark:border-[#3ED586]/10 p-3 rounded-[12px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-[#3ED586] font-sans">Google Sheets Ready</span>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-[11px] font-bold text-red-500 hover:text-red-600 hover:underline bg-transparent border-none cursor-pointer"
                >
                  Disconnect Account
                </button>
              </div>

              {/* Sheet Input Parameters */}
              <div className="bg-gray-50 dark:bg-[#1D212B] border border-gray-200 dark:border-[#2A2F3B] p-4 rounded-[14px] flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] font-sans">
                    Google Spreadsheet Link ya ID
                  </label>
                  <input
                    type="text"
                    value={spreadsheetInput}
                    onChange={(e) => setSpreadsheetInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full px-3 py-2 rounded-[10px] border border-gray-200 dark:border-[#2A2F3B] bg-white dark:bg-[#171A22] text-gray-900 dark:text-[#F0F1F4] text-[13px] focus:outline-none focus:border-emerald-500 dark:focus:border-[#3ED586]"
                  />
                  <div className="text-[10px] text-gray-400 dark:text-[#6A7180] flex items-center gap-1 mt-0.5 font-sans">
                    <Info className="w-3 h-3 text-gray-400" />
                    <span>Sheets URL directly paste kiya ja sakta hai</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] font-sans">
                      Sheet Name / Range
                    </label>
                    <input
                      type="text"
                      value={sheetRange}
                      onChange={(e) => setSheetRange(e.target.value)}
                      placeholder="Sheet1!A:B"
                      className="w-full px-3 py-2 rounded-[10px] border border-gray-200 dark:border-[#2A2F3B] bg-white dark:bg-[#171A22] text-gray-900 dark:text-[#F0F1F4] text-[13px] focus:outline-none focus:border-emerald-500 dark:focus:border-[#3ED586] font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleFetchSheetData}
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 dark:bg-[#3ED586] dark:hover:bg-emerald-400 text-white dark:text-[#0E1015] font-bold text-[12.5px] py-2 rounded-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                      <span>Titles Load Karein</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Fetched Rows Table */}
              {fetchedRows.length > 0 && (
                <div className="flex flex-col gap-3 animate-fadeIn">
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-[#1D212B] p-2 px-3 rounded-lg border border-gray-100 dark:border-[#2A2F3B]">
                    <span className="text-[11.5px] font-bold text-gray-600 dark:text-[#9AA0AF] font-sans">
                      Fetched: {fetchedRows.length} rows milin
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAllToggle(true)}
                        className="text-[10px] font-bold text-emerald-600 dark:text-[#3ED586] hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAllToggle(false)}
                        className="text-[10px] font-bold text-gray-400 hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>

                  {/* Rows Container */}
                  <div className="max-h-[220px] overflow-y-auto border border-gray-200 dark:border-[#2A2F3B] rounded-[12px] divide-y divide-gray-200 dark:divide-[#2A2F3B] bg-white dark:bg-[#171A22]">
                    {fetchedRows.map((row) => (
                      <div
                        key={row.index}
                        onClick={() => toggleRowSelect(row.index)}
                        className={`p-3 flex gap-3 cursor-pointer select-none transition-colors hover:bg-gray-50/50 dark:hover:bg-[#1D212B]/30 ${
                          row.selected ? 'bg-emerald-500/5 dark:bg-[#3ED586]/5' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => {}} // toggled by parent div click
                          className="w-4 h-4 rounded-md text-emerald-600 border-gray-300 dark:border-gray-700 bg-transparent focus:ring-0 focus:ring-offset-0 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-bold text-gray-900 dark:text-[#F0F1F4] leading-tight truncate">
                            {row.title}
                          </p>
                          {row.description && (
                            <p className="text-[10.5px] text-gray-400 dark:text-[#6A7180] truncate mt-0.5">
                              {row.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Options & Target Selection */}
                  <div className="bg-gray-50 dark:bg-[#1D212B] border border-gray-200 dark:border-[#2A2F3B] p-4 rounded-[14px] grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] font-sans flex items-center gap-1">
                        <Tv className="w-3.5 h-3.5 text-gray-400" />
                        Target Channel
                      </label>
                      <select
                        value={selectedChannelId}
                        onChange={(e) => setSelectedChannelId(e.target.value)}
                        className="w-full px-2.5 py-2 border border-gray-200 dark:border-[#2A2F3B] rounded-[9px] bg-white dark:bg-[#171A22] text-gray-800 dark:text-[#F0F1F4] text-xs focus:outline-none"
                      >
                        {channels.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] font-sans">
                        Import Target
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 border border-gray-200 dark:border-[#2A2F3B] p-0.5 rounded-[9px] bg-white dark:bg-[#171A22]">
                        <button
                          type="button"
                          onClick={() => setImportTarget('Pending')}
                          className={`py-1 text-[11px] font-bold rounded-md transition-all ${
                            importTarget === 'Pending'
                              ? 'bg-emerald-600 dark:bg-[#3ED586] text-white dark:text-[#0E1015]'
                              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          Pending Deck
                        </button>
                        <button
                          type="button"
                          onClick={() => setImportTarget('Idea')}
                          className={`py-1 text-[11px] font-bold rounded-md transition-all ${
                            importTarget === 'Idea'
                              ? 'bg-emerald-600 dark:bg-[#3ED586] text-white dark:text-[#0E1015]'
                              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          Idea Deck
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleImportToApp}
                    disabled={importing || fetchedRows.filter(r => r.selected).length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 dark:bg-[#3ED586] dark:hover:bg-emerald-400 text-white dark:text-[#0E1015] font-extrabold text-[13px] py-3 rounded-[11px] transition-all cursor-pointer shadow-sm disabled:opacity-40"
                  >
                    {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>
                      {fetchedRows.filter(r => r.selected).length} Items Selected Channel Me Import Karein
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
