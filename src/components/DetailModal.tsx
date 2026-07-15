import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit3, Check } from 'lucide-react';
import { Video, Channel, VideoStatus } from '../types';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
  channels: Channel[];
  onStatusChange: (id: string, newStatus: VideoStatus) => void;
  onChecklistToggle: (id: string, key: keyof Video['checklist']) => void;
  onDelete: (id: string) => void;
  onEdit: (video: Video) => void;
}

const CHECKLIST_ORDER: [keyof Video['checklist'], string][] = [
  ['script', 'Script'],
  ['voice', 'Voice'],
  ['fullVideo', 'Editing'],
  ['thumbnail', 'Thumbnail'],
  ['title', 'Title'],
  ['description', 'Description'],
];

export default function DetailModal({
  isOpen,
  onClose,
  video,
  channels,
  onStatusChange,
  onChecklistToggle,
  onDelete,
  onEdit,
}: DetailModalProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsConfirmingDelete(false);
    }
  }, [isOpen]);

  if (!isOpen || !video) return null;

  const currentChannel = channels.find((c) => c.id === video.channelId);
  const chanName = currentChannel?.name || 'No Channel';
  const chanColor = currentChannel?.color || '#8A93A6';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#171A22] w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-t-[22px] sm:rounded-[20px] border border-gray-200 dark:border-[#2A2F3B] shadow-xl flex flex-col transition-colors duration-150">
        
        {/* Modal Head */}
        <div className="flex justify-between items-start p-[18px] md:p-5 border-b border-gray-200 dark:border-[#2A2F3B] sticky top-0 bg-white dark:bg-[#171A22] z-10">
          <div>
            <span
              className="text-[9.5px] font-extrabold text-white uppercase tracking-wider px-2.5 py-1 rounded-full text-center inline-block"
              style={{ backgroundColor: chanColor }}
            >
              {chanName}
            </span>
            <h3 id="detailTitle" className="text-[17px] font-bold text-gray-900 dark:text-[#F0F1F4] mt-2.5 font-display leading-snug">
              {video.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-100 dark:bg-[#1D212B] border border-gray-200 dark:border-[#2A2F3B] w-[30px] h-[30px] rounded-[9px] text-gray-500 dark:text-[#9AA0AF] hover:text-gray-900 dark:hover:text-[#F0F1F4] flex items-center justify-center transition-colors duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-[18px] md:p-5 flex flex-col gap-5 overflow-y-auto flex-1">
          {/* Status Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {(['Pending', 'Scheduled', 'Published'] as VideoStatus[]).map((s) => {
              let activeStyle = '';
              if (s === 'Pending') activeStyle = 'bg-[#B4690E] text-white border-transparent';
              if (s === 'Scheduled') activeStyle = 'bg-[#2557C7] text-white border-transparent';
              if (s === 'Published') activeStyle = 'bg-[#158A4C] text-white border-transparent';

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStatusChange(video.id, s)}
                  className={`py-2 rounded-[10px] border text-xs md:text-[13px] font-bold text-center transition-all ${
                    video.status === s
                      ? activeStyle
                      : 'bg-gray-50 dark:bg-[#1D212B] text-gray-500 dark:text-[#9AA0AF] border-gray-200 dark:border-[#2A2F3B]'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {/* Production Checklist */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-2.5">
              Production Checklist
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CHECKLIST_ORDER.map(([k, label]) => {
                const checked = video.checklist[k];
                return (
                  <button
                    key={k}
                    onClick={() => onChecklistToggle(video.id, k)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-[11px] border text-left transition-all active:scale-[0.98] ${
                      checked
                        ? 'bg-[#E7F6EE] dark:bg-[#0F2A1E] border-[#158A4C] dark:border-[#3ED586]'
                        : 'bg-gray-50 dark:bg-[#1D212B] border-gray-200 dark:border-[#2A2F3B]'
                    }`}
                  >
                    <span
                      className={`w-[17px] h-[17px] rounded-[5px] border flex-shrink-0 flex items-center justify-center transition-all ${
                        checked
                          ? 'bg-[#158A4C] dark:bg-[#3ED586] border-[#158A4C] dark:border-[#3ED586]'
                          : 'border-gray-400 dark:border-gray-600'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 text-white dark:text-[#0E1015]" />}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-[#F0F1F4]">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-1.5">
              Description
            </label>
            <div
              className={`p-3 border border-gray-100 dark:border-[#2A2F3B] rounded-[11px] text-[12.5px] leading-relaxed max-h-[140px] overflow-y-auto whitespace-pre-wrap ${
                video.description
                  ? 'bg-gray-50 dark:bg-[#1D212B] text-gray-700 dark:text-[#9AA0AF]'
                  : 'bg-gray-50 dark:bg-[#1D212B] text-gray-400 dark:text-gray-600 italic'
              }`}
            >
              {video.description || 'Kuch nahi likha gaya'}
            </div>
          </div>

          {/* Script */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-1.5">
              Script / Talking Points
            </label>
            <div
              className={`p-3 border border-gray-100 dark:border-[#2A2F3B] rounded-[11px] text-[12.5px] leading-relaxed max-h-[180px] overflow-y-auto whitespace-pre-wrap ${
                video.script
                  ? 'bg-gray-50 dark:bg-[#1D212B] text-gray-700 dark:text-[#9AA0AF]'
                  : 'bg-gray-50 dark:bg-[#1D212B] text-gray-400 dark:text-gray-600 italic'
              }`}
            >
              {video.script || 'Kuch nahi likha gaya'}
            </div>
          </div>

          {/* Voice Notes */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-1.5">
              Voice Notes
            </label>
            <div
              className={`p-3 border border-gray-100 dark:border-[#2A2F3B] rounded-[11px] text-[12.5px] leading-relaxed max-h-[140px] overflow-y-auto whitespace-pre-wrap ${
                video.voiceNotes
                  ? 'bg-gray-50 dark:bg-[#1D212B] text-gray-700 dark:text-[#9AA0AF]'
                  : 'bg-gray-50 dark:bg-[#1D212B] text-gray-400 dark:text-gray-600 italic'
              }`}
            >
              {video.voiceNotes || 'Kuch nahi likha gaya'}
            </div>
          </div>
        </div>

        {/* Modal Foot */}
        <div className="p-[18px] md:p-5 border-t border-gray-200 dark:border-[#2A2F3B] flex justify-between items-center bg-gray-50 dark:bg-[#1D212B] rounded-b-[20px] gap-4">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#C53030]">Sure?</span>
              <button
                type="button"
                onClick={() => {
                  onDelete(video.id);
                  setIsConfirmingDelete(false);
                }}
                className="bg-[#C53030] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:brightness-110"
              >
                Haan, Delete
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="border border-gray-200 dark:border-[#2A2F3B] bg-white dark:bg-[#171A22] text-gray-600 dark:text-[#9AA0AF] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="flex items-center gap-1.5 text-[#C53030] hover:text-[#E53E3E] text-[12.5px] font-bold bg-transparent border-none p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/25 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <button
            onClick={() => onEdit(video)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-[11px] border border-gray-200 dark:border-[#2A2F3B] bg-white dark:bg-[#171A22] text-gray-700 dark:text-[#9AA0AF] font-bold text-[13px] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Details
          </button>
        </div>
      </div>
    </div>
  );
}
