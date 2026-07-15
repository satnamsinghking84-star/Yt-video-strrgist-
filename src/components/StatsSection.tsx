import React from 'react';
import { Video } from '../types';

interface StatsSectionProps {
  videos: Video[];
}

export default function StatsSection({ videos }: StatsSectionProps) {
  const total = videos.length;
  const pending = videos.filter((v) => v.status === 'Pending').length;
  const scheduled = videos.filter((v) => v.status === 'Scheduled').length;
  const published = videos.filter((v) => v.status === 'Published').length;

  const totalChecklistItems = total * 6;
  const completedChecklistItems = videos.reduce((acc, v) => {
    return acc + Object.values(v.checklist).filter(Boolean).length;
  }, 0);

  const completionPct = totalChecklistItems ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0;

  return (
    <div id="stats-section">
      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-3">
        <div className="bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[14px] p-3.5 shadow-xs transition-colors duration-150">
          <div className="text-[10px] font-bold text-gray-500 dark:text-[#9AA0AF] uppercase tracking-wider font-sans">Total Videos</div>
          <div className="font-display text-2xl font-bold text-gray-900 dark:text-[#F0F1F4] mt-1">{total}</div>
        </div>
        <div className="bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[14px] p-3.5 shadow-xs transition-colors duration-150">
          <div className="text-[10px] font-bold text-gray-500 dark:text-[#9AA0AF] uppercase tracking-wider font-sans">Pending</div>
          <div className="font-display text-2xl font-bold text-[#B4690E] dark:text-[#F5A544] mt-1">{pending}</div>
        </div>
        <div className="bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[14px] p-3.5 shadow-xs transition-colors duration-150">
          <div className="text-[10px] font-bold text-gray-500 dark:text-[#9AA0AF] uppercase tracking-wider font-sans">Scheduled</div>
          <div className="font-display text-2xl font-bold text-[#2557C7] dark:text-[#6C9CFF] mt-1">{scheduled}</div>
        </div>
        <div className="bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[14px] p-3.5 shadow-xs transition-colors duration-150">
          <div className="text-[10px] font-bold text-gray-500 dark:text-[#9AA0AF] uppercase tracking-wider font-sans">Published</div>
          <div className="font-display text-2xl font-bold text-[#158A4C] dark:text-[#3ED586] mt-1">{published}</div>
        </div>
      </div>

      {/* Progress Band */}
      <div className="mb-6 bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[20px] p-4.5 flex items-center gap-5 shadow-xs transition-colors duration-150">
        <div
          className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{
            background: `conic-gradient(var(--color-accent, #E11D2E) ${completionPct}%, var(--color-border, #E4E7EC) 0)`,
          }}
        >
          <div className="w-[50px] h-[50px] rounded-full bg-white dark:bg-[#171A22] flex items-center justify-center font-mono font-semibold text-xs text-gray-900 dark:text-[#F0F1F4]">
            {completionPct}%
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[11px] font-bold text-[#E11D2E] dark:text-[#FF4655] uppercase tracking-wider">
            Overall Pipeline Progress
          </h4>
          <p className="mt-1 text-xs md:text-[13px] text-gray-600 dark:text-[#9AA0AF] leading-relaxed">
            Sabhi videos ke checklist steps mila kar: <b className="text-gray-900 dark:text-[#F0F1F4]">{completedChecklistItems}/{totalChecklistItems}</b> complete
          </p>
        </div>
      </div>
    </div>
  );
}
