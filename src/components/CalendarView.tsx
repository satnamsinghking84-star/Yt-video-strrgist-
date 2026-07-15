import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Video, Channel } from '../types';

interface CalendarViewProps {
  videos: Video[];
  channels: Channel[];
  onVideoClick: (id: string) => void;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CalendarView({ videos, channels, onVideoClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getChanColor = (channelId: string) => {
    return channels.find((c) => c.id === channelId)?.color || '#8A93A6';
  };

  const monthYearLabel = currentDate.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const cells = [];
  // Blank cells at the beginning
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push(<div key={`blank-${i}`} className="min-h-[78px] sm:min-h-[90px] bg-transparent border-none" />);
  }

  const todayStr = new Date().toDateString();

  // Calendar cells with scheduled videos
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    const cellDateStr = cellDate.toDateString();
    const isToday = cellDateStr === todayStr;

    // Filter videos scheduled on this specific day
    const scheduledVideos = videos.filter((v) => {
      if (v.status !== 'Scheduled' || !v.scheduledDate) return false;
      const vDate = new Date(v.scheduledDate);
      return vDate.toDateString() === cellDateStr;
    });

    cells.push(
      <div
        key={`day-${d}`}
        className={`bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[10px] min-h-[78px] sm:min-h-[90px] p-1.5 flex flex-col gap-1 transition-colors ${
          isToday ? 'ring-2 ring-[#E11D2E] dark:ring-[#FF4655] border-transparent' : ''
        }`}
      >
        <span
          className={`font-mono font-bold text-[11px] sm:text-xs ${
            isToday ? 'text-[#E11D2E] dark:text-[#FF4655]' : 'text-gray-400 dark:text-[#6A7180]'
          }`}
        >
          {d}
        </span>
        <div className="flex flex-col gap-1 overflow-y-auto max-h-[50px] sm:max-h-[60px] custom-scrollbar">
          {scheduledVideos.map((v) => (
            <button
              key={v.id}
              onClick={() => onVideoClick(v.id)}
              className="text-[9px] sm:text-[10px] font-bold text-white px-1.5 py-0.5 rounded-[5px] text-left truncate hover:brightness-110 active:scale-95 transition-all w-full"
              style={{ backgroundColor: getChanColor(v.channelId) }}
              title={v.title}
            >
              {v.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[14px] p-2.5 px-4 mb-3 transition-colors">
        <button
          onClick={handlePrevMonth}
          className="w-9 h-9 border border-gray-200 dark:border-[#2A2F3B] bg-white dark:bg-[#171A22] rounded-[10px] text-gray-500 hover:text-gray-900 dark:hover:text-[#F0F1F4] flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-bold text-gray-900 dark:text-[#F0F1F4] font-display">
          {monthYearLabel}
        </h3>
        <button
          onClick={handleNextMonth}
          className="w-9 h-9 border border-gray-200 dark:border-[#2A2F3B] bg-white dark:bg-[#171A22] rounded-[10px] text-gray-500 hover:text-gray-900 dark:hover:text-[#F0F1F4] flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Week days & cells grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold text-gray-400 dark:text-[#6A7180] uppercase py-1"
          >
            {d}
          </div>
        ))}
        {cells}
      </div>

      {videos.filter(v => v.status === 'Scheduled' && v.scheduledDate).length === 0 && (
        <div className="mt-8 text-center text-xs text-gray-400 dark:text-[#6A7180] bg-white dark:bg-[#171A22] border border-dashed border-gray-200 dark:border-[#2A2F3B] rounded-[14px] p-6">
          <CalendarIcon className="w-6 h-6 mx-auto mb-2 opacity-50 text-gray-400" />
          <p className="font-semibold">Scheduled videos abhi nahi hain</p>
          <p className="text-[11px] font-normal mt-1">Calendar me dekhne ke liye video details me status &ldquo;Scheduled&rdquo; select karein aur date bharein.</p>
        </div>
      )}
    </div>
  );
}
