import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock } from 'lucide-react';
import { Video, Channel } from '../types';

interface CalendarViewProps {
  videos: Video[];
  channels: Channel[];
  onSelectVideo: (video: Video) => void;
}

export default function CalendarView({ videos, channels, onSelectVideo }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const emptyPrefixes = Array.from({ length: firstDayIndex }, (_, i) => i);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Scheduled videos
  const scheduledVideos = videos.filter((v) => v.status === 'Scheduled' && v.scheduledDate);

  // Group videos by day of current month
  const getVideosForDay = (day: number) => {
    return scheduledVideos.filter((v) => {
      const vDate = new Date(v.scheduledDate);
      return (
        vDate.getFullYear() === year &&
        vDate.getMonth() === month &&
        vDate.getDate() === day
      );
    });
  };

  return (
    <div id="calendar-view" className="bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[20px] shadow-xs p-4 md:p-5 transition-colors duration-150">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="bg-red-50 dark:bg-red-950/20 text-[#E11D2E] dark:text-[#FF4655] p-2 rounded-lg">
            <CalIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-[#F0F1F4] leading-none font-display">
              {monthNames[month]} {year}
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-[#6A7180] mt-1 font-sans">
              Apni scheduled video timings track karein
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2F3B] bg-transparent text-gray-600 dark:text-[#9AA0AF] hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2F3B] bg-transparent text-gray-600 dark:text-[#9AA0AF] hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-[10px] font-bold text-gray-400 dark:text-[#6A7180] uppercase tracking-wider py-1 font-sans">
            {d}
          </div>
        ))}
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 gap-1 md:gap-1.5">
        {emptyPrefixes.map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[50px] md:min-h-[75px] bg-gray-50/50 dark:bg-[#1D212B]/20 rounded-lg" />
        ))}
        {daysArray.map((day) => {
          const dayVideos = getVideosForDay(day);
          const hasVideos = dayVideos.length > 0;
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={day}
              className={`min-h-[50px] md:min-h-[75px] border p-1 md:p-1.5 flex flex-col justify-between rounded-lg transition-colors ${
                isToday
                  ? 'bg-red-50/30 dark:bg-red-950/10 border-[#E11D2E] dark:border-[#FF4655]'
                  : 'bg-white dark:bg-[#1D212B] border-gray-100 dark:border-[#2A2F3B]'
              }`}
            >
              <span className={`text-[11px] font-bold self-start ${isToday ? 'text-[#E11D2E] dark:text-[#FF4655]' : 'text-gray-400 dark:text-[#6A7180]'} font-sans`}>
                {day}
              </span>

              {hasVideos && (
                <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                  {dayVideos.slice(0, 2).map((v) => {
                    const chan = channels.find((c) => c.id === v.channelId);
                    return (
                      <button
                        key={v.id}
                        onClick={() => onSelectVideo(v)}
                        className="text-left w-full truncate text-[8.5px] md:text-[10px] px-1 py-0.5 rounded-sm font-bold text-white transition-opacity hover:opacity-90 flex items-center gap-0.5 font-sans"
                        style={{ backgroundColor: chan?.color || '#8A93A6' }}
                      >
                        {v.title}
                      </button>
                    );
                  })}
                  {dayVideos.length > 2 && (
                    <span className="text-[8px] font-bold text-gray-500 dark:text-gray-400 self-center font-sans">
                      +{dayVideos.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scheduled Video Details List below Grid */}
      <div className="mt-6 border-t border-gray-100 dark:border-[#2A2F3B] pt-4">
        <h4 className="text-xs font-bold text-gray-900 dark:text-[#F0F1F4] mb-3 font-display">
          Month Ke Scheduled Videos ({scheduledVideos.filter(v => {
            const vD = new Date(v.scheduledDate);
            return vD.getFullYear() === year && vD.getMonth() === month;
          }).length})
        </h4>
        <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
          {scheduledVideos.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-[#6A7180] py-3 text-center font-sans">
              Is month me koi video scheduled nahi hai
            </p>
          ) : (
            scheduledVideos
              .filter(v => {
                const vD = new Date(v.scheduledDate);
                return vD.getFullYear() === year && vD.getMonth() === month;
              })
              .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
              .map((v) => {
                const chan = channels.find((c) => c.id === v.channelId);
                const dateObj = new Date(v.scheduledDate);
                const dateStr = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={v.id}
                    onClick={() => onSelectVideo(v)}
                    className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-[#1D212B] border border-gray-100 dark:border-[#2A2F3B] p-2.5 rounded-[12px] cursor-pointer hover:border-gray-300 dark:hover:border-[#4B5366] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-1.5 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: chan?.color || '#8A93A6' }} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-[#F0F1F4] truncate font-sans">
                          {v.title}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-[#6A7180] font-sans">
                          {chan?.name || 'Unknown Channel'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-[#9AA0AF] flex-shrink-0 text-[10px] md:text-xs font-mono font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#E11D2E] dark:text-[#FF4655]" />
                      <span>{dateStr}, {timeStr}</span>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
