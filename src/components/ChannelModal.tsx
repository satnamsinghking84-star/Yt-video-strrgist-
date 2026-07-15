import React, { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import { Channel } from '../types';

interface ChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onAddChannel: (name: string, handle: string, color: string) => void;
  onDeleteChannel: (id: string) => void;
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

export default function ChannelModal({
  isOpen,
  onClose,
  channels,
  onAddChannel,
  onDeleteChannel,
}: ChannelModalProps) {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [selectedColor, setSelectedColor] = useState(CHANNEL_COLORS[0]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setConfirmDeleteId(null);
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#171A22] w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-t-[22px] sm:rounded-[20px] border border-gray-200 dark:border-[#2A2F3B] shadow-xl transition-colors duration-150">
        
        {/* Modal Head */}
        <div className="flex justify-between items-start p-[18px] md:p-5 border-b border-gray-200 dark:border-[#2A2F3B] sticky top-0 bg-white dark:bg-[#171A22] z-10">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-[#F0F1F4] font-display">Channels Manage Karein</h3>
            <p className="text-[11.5px] text-gray-500 dark:text-[#9AA0AF] mt-0.5">Naya channel add karein ya purana hatayein</p>
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
            <div className="flex flex-col gap-2">
              {channels.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-[#6A7180] text-center py-4 font-sans">
                  Abhi koi channel nahi hai
                </p>
              ) : (
                channels.map((c) => {
                  const isConfirming = confirmDeleteId === c.id;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-2.5 bg-gray-50 dark:bg-[#1D212B] border border-gray-200 dark:border-[#2A2F3B] rounded-[11px] p-[9px] px-3.5 transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="flex-1 text-[13px] font-bold text-gray-900 dark:text-[#F0F1F4] truncate">
                        {c.name}
                      </span>
                      {c.handle && !isConfirming && (
                        <span className="text-[11px] text-gray-400 dark:text-[#6A7180] truncate max-w-[120px] font-sans">
                          {c.handle}
                        </span>
                      )}
                      {isConfirming ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[11px] font-bold text-[#E11D2E] dark:text-[#FF4655] font-sans">Sure?</span>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteChannel(c.id);
                              setConfirmDeleteId(null);
                            }}
                            className="bg-[#E11D2E] dark:bg-[#FF4655] text-white dark:text-[#0E1015] px-2 py-0.5 rounded-md text-[11px] font-bold hover:brightness-110 font-sans"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-gray-200 dark:bg-[#2A2F3B] text-gray-700 dark:text-[#9AA0AF] px-2 py-0.5 rounded-md text-[11px] font-bold hover:brightness-110 font-sans"
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
