import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Channel, Video, VideoStatus } from '../types';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  video: Video | null; // If null, we are creating a new video. If present, we are editing.
  onSave: (data: {
    channelId: string;
    title: string;
    description: string;
    script: string;
    voiceNotes: string;
    status: VideoStatus;
    scheduledDate: string;
  }) => void;
  initialTitle?: string; // Prepopulated from Ideas conversion
  initialChannelId?: string; // Prepopulated from Ideas conversion
}

export default function VideoModal({
  isOpen,
  onClose,
  channels,
  video,
  onSave,
  initialTitle = '',
  initialChannelId = '',
}: VideoModalProps) {
  const [channelId, setChannelId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [script, setScript] = useState('');
  const [voiceNotes, setVoiceNotes] = useState('');
  const [status, setStatus] = useState<VideoStatus>('Pending');
  const [scheduledDate, setScheduledDate] = useState('');
  const [error, setError] = useState('');

  // Sync state with active video or initial values
  useEffect(() => {
    if (isOpen) {
      if (video) {
        setChannelId(video.channelId);
        setTitle(video.title);
        setDescription(video.description);
        setScript(video.script);
        setVoiceNotes(video.voiceNotes);
        setStatus(video.status);
        setScheduledDate(video.scheduledDate ? video.scheduledDate.slice(0, 16) : '');
        setError('');
      } else {
        setChannelId(initialChannelId || (channels[0]?.id || ''));
        setTitle(initialTitle || '');
        setDescription('');
        setScript('');
        setVoiceNotes('');
        setStatus('Pending');
        setScheduledDate('');
        setError('');
      }
    }
  }, [isOpen, video, channels, initialTitle, initialChannelId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelId) {
      setError('Channel chunein');
      return;
    }
    if (!title.trim()) {
      setError('Title dalein');
      return;
    }
    if (status === 'Scheduled' && !scheduledDate) {
      setError('Scheduled Date & Time select karein');
      return;
    }

    onSave({
      channelId,
      title: title.trim(),
      description: description.trim(),
      script: script.trim(),
      voiceNotes: voiceNotes.trim(),
      status,
      scheduledDate: status === 'Scheduled' ? scheduledDate : '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#171A22] w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-t-[22px] sm:rounded-[20px] border border-gray-200 dark:border-[#2A2F3B] shadow-xl flex flex-col transition-colors duration-150">
        
        {/* Modal Head */}
        <div className="flex justify-between items-start p-[18px] md:p-5 border-b border-gray-200 dark:border-[#2A2F3B] sticky top-0 bg-white dark:bg-[#171A22] z-10">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-[#F0F1F4] font-display">
              {video ? 'Video Details Edit Karein' : 'Naya Video Jodein'}
            </h3>
            <p className="text-[11.5px] text-gray-500 dark:text-[#9AA0AF] mt-0.5">Video ki details bharein</p>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-100 dark:bg-[#1D212B] border border-gray-200 dark:border-[#2A2F3B] w-[30px] h-[30px] rounded-[9px] text-gray-500 dark:text-[#9AA0AF] hover:text-gray-900 dark:hover:text-[#F0F1F4] flex items-center justify-center transition-colors duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-[18px] md:p-5 flex flex-col gap-4">
          <div className="field">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-1.5">
              Channel
            </label>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-[13.5px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655]"
              required
            >
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video ka title"
              className="w-full px-3 py-2.5 rounded-[10px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-[13.5px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655]"
              required
            />
          </div>

          <div className="field">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video description"
              rows={3}
              className="w-full px-3 py-2.5 rounded-[10px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-[13.5px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655] resize-y"
            />
          </div>

          <div className="field">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-1.5">
              Script / Talking Points
            </label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Script / talking points"
              rows={4}
              className="w-full px-3 py-2.5 rounded-[10px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-[13.5px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655] resize-y"
            />
          </div>

          <div className="field">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-1.5">
              Voice Notes
            </label>
            <textarea
              value={voiceNotes}
              onChange={(e) => setVoiceNotes(e.target.value)}
              placeholder="Voice-over notes"
              rows={2}
              className="w-full px-3 py-2.5 rounded-[10px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-[13.5px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655] resize-y"
            />
          </div>

          <div className="field">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-2">
              Status
            </label>
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
                    onClick={() => setStatus(s)}
                    className={`py-2 rounded-[10px] border text-xs md:text-[13px] font-bold text-center transition-all ${
                      status === s
                        ? activeStyle
                        : 'bg-gray-50 dark:bg-[#1D212B] text-gray-500 dark:text-[#9AA0AF] border-gray-200 dark:border-[#2A2F3B]'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {status === 'Scheduled' && (
            <div className="field animate-fadeIn">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-1.5">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[10px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-[13.5px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655]"
                required
              />
            </div>
          )}

          {error && <p className="text-[#E11D2E] dark:text-[#FF4655] text-xs font-bold mt-1">{error}</p>}
        </form>

        {/* Modal Foot */}
        <div className="p-[18px] md:p-5 border-t border-gray-200 dark:border-[#2A2F3B] flex gap-3.5 bg-gray-50 dark:bg-[#1D212B] rounded-b-[20px]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-[11px] border border-gray-200 dark:border-[#2A2F3B] bg-white dark:bg-[#171A22] text-gray-600 dark:text-[#9AA0AF] text-[13px] font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-[11px] bg-[#E11D2E] dark:bg-[#FF4655] text-white dark:text-[#0E1015] font-bold text-[13px] hover:brightness-110 active:scale-[0.99] transition-transform flex items-center justify-center"
          >
            Save Video
          </button>
        </div>
      </div>
    </div>
  );
}
