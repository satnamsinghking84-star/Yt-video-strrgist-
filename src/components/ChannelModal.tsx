import React, { useState, useEffect } from 'react';
import { Trash2, X, TrendingUp, Sparkles, ChevronDown, ChevronUp, Eye, BarChart2 } from 'lucide-react';
import { Channel } from '../types';

interface ChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onAddChannel: (name: string, handle: string, color: string) => void;
  onDeleteChannel: (id: string) => void;
  onUpdateChannelStats?: (id: string, views: number, impressions: number) => void;
}

const CHANNEL_COLORS = [
  '#E11D2E', // YouTube Red / Accent
  '#2557C7', // Blue
  '#158A4C', // Green
  '#B4690E', // Amber/Yellow-Brown
  '#7C3AED', // Violet
  '#0891B2', // Cyan
  '#DB2777', // Pink
  '#4B5563', // Slate
];

function getViralityDetails(views: number, impressions: number) {
  if (!impressions || impressions <= 0) {
    return {
      status: 'Stats Not Added',
      badgeClass: 'bg-gray-100 dark:bg-[#1D212B] text-gray-500 border-gray-200 dark:border-[#2A2F3B]',
      description: 'Views aur Impressions input karein taki click-through-rate (CTR) ke hisaab se channel virality potential score calculate kiya ja sake.',
      score: 0,
    };
  }

  const ctr = (views / impressions) * 100;
  
  if (ctr >= 10) {
    return {
      status: '🔥 Ultra Viral Potential',
      badgeClass: 'bg-[#E11D2E]/10 text-[#E11D2E] dark:text-[#FF4655] border-[#E11D2E]/15',
      description: `Outstanding CTR (${ctr.toFixed(1)}%)! Is channel ke topics aur thumbnails log bahut zyada pasand kar rahe hain. Is content space me double down karein!`,
      score: 100,
    };
  } else if (ctr >= 6) {
    return {
      status: '🚀 High Viral Potential',
      badgeClass: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/15',
      description: `Bahut badhiya CTR (${ctr.toFixed(1)}%)! Audience ka interest strong hai. Regular video pipeline se viral hone ke pure chances hain.`,
      score: 80,
    };
  } else if (ctr >= 3) {
    return {
      status: '📈 Average Growth',
      badgeClass: 'bg-[#2557C7]/10 text-[#2557C7] dark:text-[#6C9CFF] border-[#2557C7]/15',
      description: `Healthy stats (${ctr.toFixed(1)}% CTR). Channel average grow kar raha hai. Catchy thumbnails aur titles implement karke CTR aur badhayein.`,
      score: 50,
    };
  } else {
    return {
      status: '⚠️ Low Engagement',
      badgeClass: 'bg-amber-500/10 text-[#B4690E] border-amber-500/15',
      description: `CTR thoda kam hai (${ctr.toFixed(1)}%). Logo ko suggestions to ja rahe hain par log click nahi kar rahe. Thumbnails aur strong topics select karein.`,
      score: 25,
    };
  }
}

export default function ChannelModal({
  isOpen,
  onClose,
  channels,
  onAddChannel,
  onDeleteChannel,
  onUpdateChannelStats,
}: ChannelModalProps) {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [selectedColor, setSelectedColor] = useState(CHANNEL_COLORS[0]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Stats edit states
  const [editingStatsChannelId, setEditingStatsChannelId] = useState<string | null>(null);
  const [viewsInput, setViewsInput] = useState('');
  const [impressionsInput, setImpressionsInput] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setConfirmDeleteId(null);
      setEditingStatsChannelId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddChannel(name.trim(), handle.trim(), selectedColor);
    setName('');
    setHandle('');
  };

  const handleToggleStats = (c: Channel) => {
    if (editingStatsChannelId === c.id) {
      setEditingStatsChannelId(null);
    } else {
      setEditingStatsChannelId(c.id);
      setViewsInput(c.views !== undefined ? String(c.views) : '');
      setImpressionsInput(c.impressions !== undefined ? String(c.impressions) : '');
    }
  };

  const handleSaveStats = (channelId: string) => {
    if (onUpdateChannelStats) {
      const views = viewsInput.trim() === '' ? 0 : Number(viewsInput);
      const impressions = impressionsInput.trim() === '' ? 0 : Number(impressionsInput);
      onUpdateChannelStats(channelId, views, impressions);
      setEditingStatsChannelId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#171A22] w-full max-w-[580px] max-h-[92vh] overflow-y-auto rounded-t-[22px] sm:rounded-[20px] border border-gray-200 dark:border-[#2A2F3B] shadow-xl transition-colors duration-150">
        
        {/* Modal Head */}
        <div className="flex justify-between items-start p-[18px] md:p-5 border-b border-gray-200 dark:border-[#2A2F3B] sticky top-0 bg-white dark:bg-[#171A22] z-10">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-[#F0F1F4] font-display">Channels Manage Karein</h3>
            <p className="text-[11.5px] text-gray-500 dark:text-[#9AA0AF] mt-0.5">Naya channel aur uske views/impressions stats track karein</p>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-100 dark:bg-[#1D212B] border border-gray-200 dark:border-[#2A2F3B] w-[30px] h-[30px] rounded-[9px] text-gray-500 dark:text-[#9AA0AF] hover:text-gray-900 dark:hover:text-[#F0F1F4] flex items-center justify-center transition-colors duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-[18px] md:p-5 flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="field">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-1.5 font-sans">
                Channel Naam
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Coconut Business Vlogs"
                className="w-full px-3 py-2.5 rounded-[10px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-[13.5px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655] transition-colors"
                required
              />
            </div>

            <div className="field">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-1.5 font-sans">
                Handle (optional)
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@channelhandle"
                className="w-full px-3 py-2.5 rounded-[10px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-[13.5px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655] transition-colors"
              />
            </div>

            <div className="field">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-1.5 font-sans">
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {CHANNEL_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-[9px] border-2 transition-transform duration-150 active:scale-95 ${
                      c === selectedColor
                        ? 'border-gray-900 dark:border-white scale-105'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#E11D2E] dark:bg-[#FF4655] text-white dark:text-[#0E1015] border-none rounded-[10px] py-2.5 text-[13px] font-bold hover:brightness-110 active:scale-[0.99] transition-transform"
            >
              Channel Add Karein
            </button>
          </form>

          {/* Divider */}
          <div className="h-[1px] bg-gray-200 dark:bg-[#2A2F3B] my-2" />

          {/* Channel List */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-2.5 font-sans">
              Current Channels
            </label>
            <div className="flex flex-col gap-2.5">
              {channels.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-[#6A7180] text-center py-4 font-sans">
                  Abhi koi channel nahi hai
                </p>
              ) : (
                channels.map((c) => {
                  const isConfirming = confirmDeleteId === c.id;
                  const isEditingStats = editingStatsChannelId === c.id;
                  const hasStats = c.views !== undefined && c.impressions !== undefined && c.impressions > 0;
                  const ctr = hasStats ? ((c.views || 0) / (c.impressions || 1)) * 100 : 0;
                  const virality = getViralityDetails(c.views || 0, c.impressions || 0);

                  return (
                    <div
                      key={c.id}
                      className="flex flex-col bg-gray-50 dark:bg-[#1D212B] border border-gray-200 dark:border-[#2A2F3B] rounded-[14px] p-3 transition-all animate-fadeIn"
                    >
                      {/* Top main row */}
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-gray-900 dark:text-[#F0F1F4] truncate">
                            {c.name}
                          </p>
                          {c.handle && (
                            <p className="text-[10px] text-gray-400 dark:text-[#6A7180] truncate font-sans">
                              {c.handle}
                            </p>
                          )}
                        </div>

                        {/* Stats Indicator summary if exists */}
                        {hasStats && (
                          <div className="flex items-center gap-2 flex-shrink-0 bg-white dark:bg-[#171A22] border border-gray-100 dark:border-[#2A2F3B] px-2 py-1 rounded-[8px] text-[10px] font-mono">
                            <span className="text-[#E11D2E] dark:text-[#FF4655] font-bold">CTR: {ctr.toFixed(1)}%</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Stats Expand Button */}
                          {onUpdateChannelStats && (
                            <button
                              type="button"
                              onClick={() => handleToggleStats(c)}
                              className={`flex items-center gap-1 text-[11px] font-bold font-sans px-2.5 py-1.5 rounded-[8px] border transition-all ${
                                isEditingStats
                                  ? 'bg-[#E11D2E] dark:bg-[#FF4655] text-white border-transparent'
                                  : 'bg-white dark:bg-[#171A22] border-gray-200 dark:border-[#2A2F3B] text-gray-600 dark:text-[#9AA0AF] hover:text-gray-900 dark:hover:text-[#F0F1F4]'
                              }`}
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline">Virality</span>
                              {isEditingStats ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}

                          {isConfirming ? (
                            <div className="flex items-center gap-1.5 flex-shrink-0 bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] p-1 rounded-lg">
                              <span className="text-[10px] font-bold text-[#E11D2E] dark:text-[#FF4655] font-sans px-1">Delete?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteChannel(c.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="bg-[#E11D2E] dark:bg-[#FF4655] text-white dark:text-[#0E1015] px-2 py-0.5 rounded-md text-[10px] font-bold hover:brightness-110 font-sans"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-[#9AA0AF] px-2 py-0.5 rounded-md text-[10px] font-bold hover:brightness-110 font-sans"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(c.id)}
                              className="bg-transparent border-none text-gray-400 hover:text-[#E11D2E] dark:hover:text-[#FF4655] p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Stats & Predictor expandable panel */}
                      {isEditingStats && (
                        <div className="mt-3 bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[11px] p-3 flex flex-col gap-3.5 animate-fadeIn">
                          
                          {/* Virality Prediction Badge & Score */}
                          <div className="flex flex-col gap-1.5 border-b border-gray-100 dark:border-[#2A2F3B] pb-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-[#6A7180] font-sans flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                                Virality Prediction
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${virality.badgeClass}`}>
                                {virality.status}
                              </span>
                            </div>
                            <p className="text-[11.5px] text-gray-500 dark:text-[#9AA0AF] font-sans leading-relaxed">
                              {virality.description}
                            </p>
                          </div>

                          {/* Stats Inputs */}
                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6A7180] font-sans flex items-center gap-1">
                                <Eye className="w-3 h-3 text-gray-400" />
                                Total Views
                              </label>
                              <input
                                type="number"
                                value={viewsInput}
                                onChange={(e) => setViewsInput(e.target.value)}
                                placeholder="0"
                                className="w-full px-2.5 py-1.5 rounded-[8px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-[12.5px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655] font-mono"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#6A7180] font-sans flex items-center gap-1">
                                <BarChart2 className="w-3 h-3 text-gray-400" />
                                Impressions
                              </label>
                              <input
                                type="number"
                                value={impressionsInput}
                                onChange={(e) => setImpressionsInput(e.target.value)}
                                placeholder="0"
                                className="w-full px-2.5 py-1.5 rounded-[8px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-[12.5px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655] font-mono"
                              />
                            </div>
                          </div>

                          {/* CTR Indicator if inputs exist */}
                          {Number(impressionsInput) > 0 && (
                            <div className="bg-gray-50 dark:bg-[#1D212B] border border-gray-100 dark:border-[#2A2F3B] p-2 rounded-lg flex items-center justify-between text-xs font-mono px-3">
                              <span className="text-gray-400">Click-Through Rate (CTR):</span>
                              <span className="font-bold text-[#E11D2E] dark:text-[#FF4655]">
                                {((Number(viewsInput) / Number(impressionsInput)) * 100).toFixed(2)}%
                              </span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditingStatsChannelId(null)}
                              className="px-3 py-1.5 rounded-[8px] bg-gray-100 dark:bg-[#2A2F3B] text-gray-600 dark:text-[#9AA0AF] text-[11px] font-bold hover:brightness-110 font-sans"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveStats(c.id)}
                              className="px-3.5 py-1.5 rounded-[8px] bg-[#E11D2E] dark:bg-[#FF4655] text-white dark:text-[#0E1015] text-[11px] font-bold hover:brightness-110 font-sans"
                            >
                              Save Stats
                            </button>
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
