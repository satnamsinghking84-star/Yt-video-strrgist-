import React, { useState } from 'react';
import { Plus, Trash2, Lightbulb } from 'lucide-react';
import { Idea, Channel } from '../types';

interface IdeasViewProps {
  ideas: Idea[];
  channels: Channel[];
  onAddIdea: (text: string, channelId: string) => void;
  onDeleteIdea: (id: string) => void;
  onConvertIdea: (idea: Idea) => void;
}

export default function IdeasView({
  ideas,
  channels,
  onAddIdea,
  onDeleteIdea,
  onConvertIdea,
}: IdeasViewProps) {
  const [text, setText] = useState('');
  const [channelId, setChannelId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddIdea(text.trim(), channelId);
    setText('');
    setChannelId('');
  };

  const getChanColor = (id: string) => {
    return channels.find((c) => c.id === id)?.color || '#8A93A6';
  };

  const getChanName = (id: string) => {
    return channels.find((c) => c.id === id)?.name || '';
  };

  return (
    <div className="animate-fadeIn">
      {/* Idea Inputs */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[14px] p-4.5 mb-4 transition-colors">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Naya video idea likhein... e.g. 'Coconut business ke baare mein ek video'"
          className="w-full border border-gray-200 dark:border-[#2A2F3B] rounded-[10px] bg-gray-50 dark:bg-[#1D212B] p-2.5 px-3 text-sm text-gray-900 dark:text-[#F0F1F4] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655] resize-y min-h-[56px]"
          required
        />
        <div className="flex gap-2 mt-2">
          <select
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-[9px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-500 dark:text-[#9AA0AF] text-[12.5px] font-semibold focus:outline-none"
          >
            <option value="">Koi channel nahi</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-[#E11D2E] dark:bg-[#FF4655] text-white dark:text-[#0E1015] border-none rounded-[10px] px-4.5 py-2.5 text-[13px] font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Idea
          </button>
        </div>
      </form>

      {/* Ideas List */}
      <div className="flex flex-col gap-2">
        {ideas.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-[#171A22] border border-dashed border-gray-200 dark:border-[#2A2F3B] rounded-[20px] p-6 text-gray-400 dark:text-[#6A7180]">
            <Lightbulb className="w-[38px] h-[38px] mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-[13px]">Abhi koi idea nahi hai</p>
            <p className="text-xs font-normal mt-0.5">Upar box mein apna agla video idea likhein</p>
          </div>
        ) : (
          [...ideas].reverse().map((idea) => {
            const chanName = getChanName(idea.channelId);
            const chanColor = getChanColor(idea.channelId);
            return (
              <div
                key={idea.id}
                className="bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-xl p-3 px-4 flex items-center justify-between gap-3 shadow-xs transition-colors"
              >
                <p className="text-[13px] text-gray-900 dark:text-[#F0F1F4] font-medium leading-relaxed flex-1">
                  {idea.text}
                  {idea.channelId && chanName && (
                    <span
                      className="ml-2 text-xs font-bold font-display"
                      style={{ color: chanColor }}
                    >
                      — {chanName}
                    </span>
                  )}
                </p>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onConvertIdea(idea)}
                    className="w-7 h-7 bg-gray-50 dark:bg-[#1D212B] border border-gray-100 dark:border-[#2A2F3B] hover:border-[#158A4C] dark:hover:border-[#3ED586] hover:text-[#158A4C] dark:hover:text-[#3ED586] text-gray-500 dark:text-[#9AA0AF] rounded-md flex items-center justify-center transition-all"
                    title="Video banayein"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    onClick={() => onDeleteIdea(idea.id)}
                    className="w-7 h-7 bg-gray-50 dark:bg-[#1D212B] border border-gray-100 dark:border-[#2A2F3B] hover:border-[#E11D2E] dark:hover:border-[#FF4655] hover:text-[#E11D2E] dark:hover:text-[#FF4655] text-gray-500 dark:text-[#9AA0AF] rounded-md flex items-center justify-center transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
