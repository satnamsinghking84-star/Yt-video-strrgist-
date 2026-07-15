import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Sun,
  Moon,
  Download,
  Upload,
  Plus,
  Search,
  Settings,
  Calendar,
  List,
  Lightbulb,
  Check,
  Clapperboard,
} from 'lucide-react';

import { Channel, Video, Idea, VideoStatus } from './types';
import StatsSection from './components/StatsSection';
import ChannelModal from './components/ChannelModal';
import VideoModal from './components/VideoModal';
import DetailModal from './components/DetailModal';
import CalendarView from './components/CalendarView';
import IdeasView from './components/IdeasView';

// Default Sample Data (to showcase beautiful workflows instantly)
const DEFAULT_CHANNELS: Channel[] = [
  {
    id: 'ch-1',
    name: 'Coconut Business Vlogs',
    handle: '@coconutvlogs',
    color: '#E11D2E',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ch-2',
    name: 'Tech Gyan Shorts',
    handle: '@techgyan',
    color: '#2557C7',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ch-3',
    name: 'Foodie Hisaab',
    handle: '@foodiehisaab',
    color: '#158A4C',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_VIDEOS: Video[] = [
  {
    id: 'vid-1',
    channelId: 'ch-1',
    title: 'How to start Coconut Business with 5000 Rs',
    description: 'A complete step by step guide about sourcing, margins, and selling setup.',
    script: '1. Introduction: Business opportunity\n2. Sourcing: Wholesale markets\n3. Cost Breakdown: Investment required\n4. Profit margins analysis\n5. Action plan',
    voiceNotes: 'Keep the tone engaging and energetic. Highlight high profit potential.',
    status: 'Scheduled',
    scheduledDate: '2026-07-20T11:00',
    checklist: { thumbnail: true, title: true, description: true, script: true, voice: false, fullVideo: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vid-2',
    channelId: 'ch-2',
    title: 'Top 5 AI Tools for Creators in 2026',
    description: 'Must watch AI tools to automate editing, scripts, and thumbnail creation.',
    script: 'Introduction\nTool 1: Runway Gen-3\nTool 2: ElevenLabs Voice cloning\nTool 3: Midjourney v7\nTool 4: Chatbot helper\nTool 5: AutoCut editing\nConclusion',
    voiceNotes: 'Sound professional. Keep sections concise for high retention.',
    status: 'Pending',
    scheduledDate: '',
    checklist: { thumbnail: false, title: true, description: false, script: true, voice: false, fullVideo: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vid-3',
    channelId: 'ch-3',
    title: 'Delhi Famous Street Food - Honest Review',
    description: 'Trying the most viral street food in Chandni Chowk and checking if it is worth the hype.',
    script: 'Intro at Chandni Chowk\nTrying the viral paratha\nTrying dahi bhalla\nFinal rating and verdict',
    voiceNotes: 'Expressive foodie sound, add ambient street sounds.',
    status: 'Published',
    scheduledDate: '2026-07-10T14:30',
    checklist: { thumbnail: true, title: true, description: true, script: true, voice: true, fullVideo: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_IDEAS: Idea[] = [
  {
    id: 'idea-1',
    text: '10 Smart ways to save money daily',
    channelId: 'ch-2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'idea-2',
    text: 'Vlog: Day in the life of a street vendor',
    channelId: 'ch-1',
    createdAt: new Date().toISOString(),
  },
];

const CHECKLIST_ORDER: [keyof Video['checklist'], string][] = [
  ['script', 'Script'],
  ['voice', 'Voice'],
  ['fullVideo', 'Editing'],
  ['thumbnail', 'Thumbnail'],
  ['title', 'Title'],
  ['description', 'Description'],
];

export default function App() {
  // ---------- Core States ----------
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('ch_channels');
    return saved ? JSON.parse(saved) : DEFAULT_CHANNELS;
  });

  const [videos, setVideos] = useState<Video[]>(() => {
    const saved = localStorage.getItem('ch_videos');
    return saved ? JSON.parse(saved) : DEFAULT_VIDEOS;
  });

  const [ideas, setIdeas] = useState<Idea[]>(() => {
    const saved = localStorage.getItem('ch_ideas');
    return saved ? JSON.parse(saved) : DEFAULT_IDEAS;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ch_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [activeChannel, setActiveChannel] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'videos' | 'calendar' | 'ideas'>('videos');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VideoStatus>('all');
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'complete' | 'incomplete'>('all');

  // ---------- Modal & Overlay States ----------
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // ---------- Action Targets ----------
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Prepopulation state for ideas-to-video conversion
  const [prepopulatedTitle, setPrepopulatedTitle] = useState('');
  const [prepopulatedChannelId, setPrepopulatedChannelId] = useState('');

  // ---------- Feedback/Toast States ----------
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- Effects ----------
  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('ch_channels', JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem('ch_videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('ch_ideas', JSON.stringify(ideas));
  }, [ideas]);

  useEffect(() => {
    localStorage.setItem('ch_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  // ---------- Theme Switcher ----------
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // ---------- Channel Actions ----------
  const handleAddChannel = (name: string, handle: string, color: string) => {
    const newChan: Channel = {
      id: `ch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      handle,
      color,
      createdAt: new Date().toISOString(),
    };
    setChannels((prev) => [...prev, newChan]);
    triggerToast(`Channel "${name}" add ho gaya`);
  };

  const handleDeleteChannel = (id: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== id));
    triggerToast('Channel hataya gaya');
  };

  // ---------- Video Actions ----------
  const handleSaveVideo = (data: {
    channelId: string;
    title: string;
    description: string;
    script: string;
    voiceNotes: string;
    status: VideoStatus;
    scheduledDate: string;
  }) => {
    if (editingVideo) {
      // Edit existing video
      setVideos((prev) =>
        prev.map((v) =>
          v.id === editingVideo.id
            ? {
                ...v,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : v
        )
      );
      // Update selected detail if open
      if (selectedVideo && selectedVideo.id === editingVideo.id) {
        setSelectedVideo((prev) => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : null));
      }
      triggerToast('Video update ho gaya');
    } else {
      // Create new video
      const newVid: Video = {
        id: `vid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        ...data,
        checklist: {
          thumbnail: false,
          title: false,
          description: false,
          script: false,
          voice: false,
          fullVideo: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setVideos((prev) => [newVid, ...prev]);
      triggerToast('Naya video add ho gaya');
    }

    setIsVideoModalOpen(false);
    setEditingVideo(null);
    setPrepopulatedTitle('');
    setPrepopulatedChannelId('');
  };

  const handleDeleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    setIsDetailModalOpen(false);
    setSelectedVideo(null);
    triggerToast('Video delete ho gaya');
  };

  const handleStatusChange = (id: string, newStatus: VideoStatus) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus, updatedAt: new Date().toISOString() } : v))
    );
    setSelectedVideo((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
    triggerToast('Status update ho gaya');
  };

  const handleChecklistToggle = (id: string, key: keyof Video['checklist']) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updatedChecklist = { ...v.checklist, [key]: !v.checklist[key] };
          return { ...v, checklist: updatedChecklist, updatedAt: new Date().toISOString() };
        }
        return v;
      })
    );
    setSelectedVideo((prev) => {
      if (prev && prev.id === id) {
        return {
          ...prev,
          checklist: { ...prev.checklist, [key]: !prev.checklist[key] },
        };
      }
      return prev;
    });
  };

  // ---------- Idea Actions ----------
  const handleAddIdea = (text: string, channelId: string) => {
    const newIdea: Idea = {
      id: `idea-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      channelId,
      createdAt: new Date().toISOString(),
    };
    setIdeas((prev) => [...prev, newIdea]);
    triggerToast('Idea save ho gaya');
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    triggerToast('Idea delete ho gaya');
  };

  const handleConvertIdea = (idea: Idea) => {
    if (channels.length === 0) {
      triggerToast('Pehle ek channel banayein');
      return;
    }
    // Prepopulate video creation details
    setPrepopulatedTitle(idea.text);
    setPrepopulatedChannelId(idea.channelId);
    setEditingVideo(null);
    setIsVideoModalOpen(true);

    // Delete converted idea
    setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
  };

  // ---------- Import/Export Backup ----------
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      channels,
      videos,
      ideas,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `creator-hisaab-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    triggerToast('Backup download ho gaya');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.channels || !parsed.videos) {
          alert('Invalid backup file! Channels or Videos data missing.');
          return;
        }

        // Merge without duplicates (by matching IDs)
        setChannels((prev) => {
          const merged = [...prev];
          parsed.channels.forEach((c: Channel) => {
            if (!merged.some((x) => x.id === c.id)) {
              merged.push(c);
            }
          });
          return merged;
        });

        setVideos((prev) => {
          const merged = [...prev];
          parsed.videos.forEach((v: Video) => {
            if (!merged.some((x) => x.id === v.id)) {
              merged.push(v);
            }
          });
          return merged;
        });

        if (parsed.ideas) {
          setIdeas((prev) => {
            const merged = [...prev];
            parsed.ideas.forEach((i: Idea) => {
              if (!merged.some((x) => x.id === i.id)) {
                merged.push(i);
              }
            });
            return merged;
          });
        }

        triggerToast('Backup restore ho gaya');
      } catch (err) {
        alert('File padhne mein error aayi. Please check your JSON format.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // ---------- Filtering Logic ----------
  const filteredVideos = videos
    .filter((v) => {
      // Channel Filter
      if (activeChannel !== 'all' && v.channelId !== activeChannel) return false;

      // Status Filter
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;

      // Checklist Filter
      if (checklistFilter !== 'all') {
        const isComplete = Object.values(v.checklist).every(Boolean);
        if (checklistFilter === 'complete' && !isComplete) return false;
        if (checklistFilter === 'incomplete' && isComplete) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = (v.title || '').toLowerCase().includes(query);
        const inDesc = (v.description || '').toLowerCase().includes(query);
        const inScript = (v.script || '').toLowerCase().includes(query);
        return inTitle || inDesc || inScript;
      }

      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // ---------- Navigation helpers ----------
  const handleOpenDetail = (id: string) => {
    const videoObj = videos.find((v) => v.id === id);
    if (videoObj) {
      setSelectedVideo(videoObj);
      setIsDetailModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1015] text-gray-900 dark:text-[#F0F1F4] font-sans selection:bg-[#E11D2E] dark:selection:bg-[#FF4655] selection:text-white dark:selection:text-[#0E1015] transition-colors duration-150">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 bg-gray-900 dark:bg-[#F0F1F4] text-white dark:text-[#0E1015] px-4.5 py-2.5 rounded-[11px] font-bold text-[12.5px] shadow-lg animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#171A22]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#2A2F3B] transition-colors">
        <div className="max-w-[1080px] mx-auto px-4.5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-[38px] h-[38px] rounded-[11px] bg-gray-900 dark:bg-[#F0F1F4] text-white dark:text-[#0E1015] flex items-center justify-center flex-shrink-0 relative overflow-hidden transition-all active:scale-95">
              <Clapperboard className="w-[18px] h-[18px] text-[#E11D2E] dark:text-[#FF4655] fill-[#E11D2E] dark:fill-[#FF4655]" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight font-display text-gray-900 dark:text-[#F0F1F4]">
                Creator Hisaab
              </h1>
              <p className="text-[10.5px] font-extrabold text-[#E11D2E] dark:text-[#FF4655] uppercase tracking-[0.08em] mt-0.5">
                Video Pipeline Manager
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 border border-gray-200 dark:border-[#2A2F3B] bg-white dark:bg-[#171A22] text-gray-500 dark:text-[#9AA0AF] hover:bg-gray-50 dark:hover:bg-[#1D212B] hover:text-gray-900 dark:hover:text-[#F0F1F4] rounded-[10px] flex items-center justify-center transition-all duration-150"
              title="Theme Toggle"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {/* Export Backup */}
            <button
              onClick={handleExportBackup}
              className="w-9 h-9 border border-gray-200 dark:border-[#2A2F3B] bg-white dark:bg-[#171A22] text-gray-500 dark:text-[#9AA0AF] hover:bg-gray-50 dark:hover:bg-[#1D212B] hover:text-gray-900 dark:hover:text-[#F0F1F4] rounded-[10px] flex items-center justify-center transition-all duration-150"
              title="Backup Download Karein"
            >
              <Download className="w-4.5 h-4.5" />
            </button>

            {/* Import Backup */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 border border-gray-200 dark:border-[#2A2F3B] bg-white dark:bg-[#171A22] text-gray-500 dark:text-[#9AA0AF] hover:bg-gray-50 dark:hover:bg-[#1D212B] hover:text-gray-900 dark:hover:text-[#F0F1F4] rounded-[10px] flex items-center justify-center transition-all duration-150"
              title="Backup Restore/Upload Karein"
            >
              <Upload className="w-4.5 h-4.5" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1080px] mx-auto px-4.5 pb-16 pt-5">
        
        {/* Stats Section */}
        <StatsSection videos={videos} />

        {/* Section label for Channels */}
        <div className="flex items-center justify-between mb-2.5 mt-2">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400 dark:text-[#6A7180]">
            Aapke Channels
          </h2>
          <button
            onClick={() => setIsChannelModalOpen(true)}
            className="text-[#E11D2E] dark:text-[#FF4655] text-xs font-bold flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all bg-transparent border-none p-0"
          >
            <Settings className="w-3.5 h-3.5 stroke-[2.5]" />
            Manage
          </button>
        </div>

        {/* Channel Row Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 custom-scrollbar scrollbar-none">
          {/* All Channels Pill */}
          <button
            onClick={() => setActiveChannel('all')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs md:text-[12.5px] font-bold transition-all ${
              activeChannel === 'all'
                ? 'bg-gray-900 dark:bg-[#F0F1F4] border-gray-900 dark:border-[#F0F1F4] text-white dark:text-[#0E1015]'
                : 'bg-white dark:bg-[#171A22] border-gray-200 dark:border-[#2A2F3B] text-gray-500 dark:text-[#9AA0AF] hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            All Channels
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
              {videos.length}
            </span>
          </button>

          {/* Individual Channel Pills */}
          {channels.map((chan) => {
            const count = videos.filter((v) => v.channelId === chan.id).length;
            const isActive = activeChannel === chan.id;
            return (
              <button
                key={chan.id}
                onClick={() => setActiveChannel(chan.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs md:text-[12.5px] font-bold transition-all ${
                  isActive
                    ? 'text-white border-transparent'
                    : 'bg-white dark:bg-[#171A22] border-gray-200 dark:border-[#2A2F3B] text-gray-500 dark:text-[#9AA0AF] hover:border-gray-400 dark:hover:border-[#6A7180]'
                }`}
                style={isActive ? { backgroundColor: chan.color } : {}}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: isActive ? '#fff' : chan.color }}
                />
                {chan.name}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tabs Row */}
        <div className="flex gap-1 bg-gray-100 dark:bg-[#1D212B] border border-gray-200 dark:border-[#2A2F3B] rounded-xl p-1 mb-5 w-fit">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4.5 py-2 rounded-[9px] border-none text-[13px] font-bold transition-all ${
              activeTab === 'videos'
                ? 'bg-white dark:bg-[#171A22] text-gray-900 dark:text-[#F0F1F4] shadow-xs'
                : 'bg-transparent text-gray-500 dark:text-[#9AA0AF] hover:text-gray-900 dark:hover:text-[#F0F1F4]'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4.5 py-2 rounded-[9px] border-none text-[13px] font-bold transition-all ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-[#171A22] text-gray-900 dark:text-[#F0F1F4] shadow-xs'
                : 'bg-transparent text-gray-500 dark:text-[#9AA0AF] hover:text-gray-900 dark:hover:text-[#F0F1F4]'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-4.5 py-2 rounded-[9px] border-none text-[13px] font-bold transition-all ${
              activeTab === 'ideas'
                ? 'bg-white dark:bg-[#171A22] text-gray-900 dark:text-[#F0F1F4] shadow-xs'
                : 'bg-transparent text-gray-500 dark:text-[#9AA0AF] hover:text-gray-900 dark:hover:text-[#F0F1F4]'
            }`}
          >
            Ideas Bank
          </button>
        </div>

        {/* TAB 1: VIDEOS */}
        {activeTab === 'videos' && (
          <div className="animate-fadeIn">
            {/* Filter Bar */}
            <div className="bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[14px] p-3.5 mb-5 shadow-xs transition-colors duration-150">
              <div className="flex gap-2.5 flex-wrap md:flex-nowrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Title, description ya script mein khojein..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-[10px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-[13.5px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655] transition-colors"
                  />
                </div>
                {/* New Video Button */}
                <button
                  onClick={() => {
                    if (channels.length === 0) {
                      triggerToast('Pehle ek channel banayein');
                      return;
                    }
                    setEditingVideo(null);
                    setPrepopulatedTitle('');
                    setPrepopulatedChannelId('');
                    setIsVideoModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 bg-[#E11D2E] dark:bg-[#FF4655] text-white dark:text-[#0E1015] border-none rounded-[10px] px-4.5 py-2.5 text-[13px] font-bold hover:brightness-110 active:scale-95 transition-all w-full md:w-auto justify-center"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Naya Video
                </button>
              </div>

              {/* Status & Checklist filters */}
              <div className="grid grid-cols-2 gap-2 mt-2.5">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-500 dark:text-[#9AA0AF] text-[11.5px] font-semibold focus:outline-none"
                >
                  <option value="all">Status — Sabhi</option>
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Published">Published</option>
                </select>

                <select
                  value={checklistFilter}
                  onChange={(e) => setChecklistFilter(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-500 dark:text-[#9AA0AF] text-[11.5px] font-semibold focus:outline-none"
                >
                  <option value="all">Checklist — Sabhi</option>
                  <option value="complete">Poora Hua</option>
                  <option value="incomplete">Adhoora</option>
                </select>
              </div>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredVideos.length === 0 ? (
                <div className="col-span-1 sm:col-span-2 text-center py-16 bg-white dark:bg-[#171A22] border border-dashed border-gray-200 dark:border-[#2A2F3B] rounded-[20px] p-6 text-gray-400 dark:text-[#6A7180]">
                  <Play className="w-[38px] h-[38px] mx-auto mb-2.5 opacity-50 text-gray-400 rotate-90" />
                  <p className="font-semibold text-sm">Koi video nahi mila</p>
                  <p className="text-xs font-normal mt-1 text-gray-400 dark:text-[#6A7180]">
                    Filter criteria badlein ya naya video add karein
                  </p>
                </div>
              ) : (
                filteredVideos.map((v) => {
                  const chan = channels.find((c) => c.id === v.channelId);
                  const chanColor = chan?.color || '#8A93A6';
                  const chanName = chan?.name || 'No Channel';
                  const completedCount = Object.values(v.checklist).filter(Boolean).length;

                  return (
                    <div
                      key={v.id}
                      onClick={() => handleOpenDetail(v.id)}
                      className="bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[20px] p-4.5 cursor-pointer shadow-xs hover:-translate-y-0.5 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-150 flex flex-col gap-3"
                    >
                      {/* Badge Top */}
                      <div className="flex justify-between items-center gap-2">
                        <span
                          className="text-[9.5px] font-extrabold text-white uppercase tracking-wider px-2.5 py-1 rounded-full text-center truncate max-w-[150px]"
                          style={{ backgroundColor: chanColor }}
                        >
                          {chanName}
                        </span>
                        <span
                          className={`text-[9.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full text-center ${
                            v.status === 'Pending'
                              ? 'bg-[#FDF1E2] dark:bg-[#2E2210] text-[#B4690E] dark:text-[#F5A544]'
                              : v.status === 'Scheduled'
                              ? 'bg-[#E9F0FE] dark:bg-[#151F35] text-[#2557C7] dark:text-[#6C9CFF]'
                              : 'bg-[#E7F6EE] dark:bg-[#0F2A1E] text-[#158A4C] dark:text-[#3ED586]'
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>

                      {/* Info & Scheduling */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-[#F0F1F4] leading-snug font-display truncate">
                          {v.title}
                        </h3>
                        {v.description && (
                          <p className="text-xs text-gray-500 dark:text-[#9AA0AF] mt-1 line-clamp-2 leading-relaxed">
                            {v.description}
                          </p>
                        )}
                        {v.status === 'Scheduled' && v.scheduledDate && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-[#9AA0AF] mt-2.5 bg-gray-50 dark:bg-[#1D212B] border border-gray-100 dark:border-[#2A2F3B] w-fit px-2 py-1 rounded-[7px]">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(v.scheduledDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Pipeline progress bar indicators (6 dots) */}
                      <div className="pt-2 border-t border-dashed border-gray-200 dark:border-[#2A2F3B] flex flex-col gap-1">
                        <div className="flex gap-1.5">
                          {CHECKLIST_ORDER.map(([k]) => (
                            <div
                              key={k}
                              className={`flex-1 h-1.5 rounded-full ${
                                v.checklist[k] ? 'bg-[#158A4C] dark:bg-[#3ED586]' : 'bg-gray-200 dark:bg-[#2A2F3B]'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-[10.5px] font-bold text-gray-400 dark:text-[#6A7180] mt-1">
                          <span>{completedCount}/6 steps completed</span>
                          <span className="font-mono text-[10px] bg-gray-100 dark:bg-[#1D212B] px-1.5 py-0.5 rounded">
                            {Math.round((completedCount / 6) * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Production checklist micro toggles */}
                      <div className="grid grid-cols-2 gap-1.5 mt-1">
                        {CHECKLIST_ORDER.map(([k, label]) => {
                          const isDone = v.checklist[k];
                          return (
                            <button
                              key={k}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChecklistToggle(v.id, k);
                              }}
                              className={`flex items-center gap-2 p-1.5 px-2 rounded-[9px] border text-left truncate active:scale-[0.98] transition-all ${
                                isDone
                                  ? 'bg-[#E7F6EE] dark:bg-[#0F2A1E] border-[#158A4C] dark:border-[#3ED586]'
                                  : 'bg-gray-50 dark:bg-[#1D212B] border-gray-200 dark:border-[#2A2F3B]'
                              }`}
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded-[4px] border flex-shrink-0 flex items-center justify-center ${
                                  isDone
                                    ? 'bg-[#158A4C] dark:bg-[#3ED586] border-[#158A4C] dark:border-[#3ED586]'
                                    : 'border-gray-400 dark:border-gray-600'
                                }`}
                              >
                                {isDone && <Check className="w-2.5 h-2.5 text-white dark:text-[#0E1015] stroke-[2.5]" />}
                              </span>
                              <span className="text-[10.5px] font-bold text-gray-700 dark:text-[#F0F1F4] truncate">
                                {label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CALENDAR */}
        {activeTab === 'calendar' && (
          <CalendarView
            videos={videos}
            channels={channels}
            onVideoClick={handleOpenDetail}
          />
        )}

        {/* TAB 3: IDEAS BANK */}
        {activeTab === 'ideas' && (
          <IdeasView
            ideas={ideas}
            channels={channels}
            onAddIdea={handleAddIdea}
            onDeleteIdea={handleDeleteIdea}
            onConvertIdea={handleConvertIdea}
          />
        )}
      </main>

      {/* Footer info */}
      <footer className="text-center text-gray-400 dark:text-[#6A7180] text-[11px] py-10 border-t border-gray-100 dark:border-[#1D212B] mt-10 space-y-1 bg-white dark:bg-[#0E1015]">
        <p>Data aapke browser mein hi save hota hai (localStorage). Permanent copy ke liye backup download karein.</p>
        <p className="mono font-semibold">© 2026 Creator Hisaab</p>
      </footer>

      {/* MODALS */}
      <ChannelModal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        channels={channels}
        onAddChannel={handleAddChannel}
        onDeleteChannel={handleDeleteChannel}
      />

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setEditingVideo(null);
          setPrepopulatedTitle('');
          setPrepopulatedChannelId('');
        }}
        channels={channels}
        video={editingVideo}
        onSave={handleSaveVideo}
        initialTitle={prepopulatedTitle}
        initialChannelId={prepopulatedChannelId}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedVideo(null);
        }}
        video={selectedVideo}
        channels={channels}
        onStatusChange={handleStatusChange}
        onChecklistToggle={handleChecklistToggle}
        onDelete={handleDeleteVideo}
        onEdit={(v) => {
          setIsDetailModalOpen(false);
          setEditingVideo(v);
          setIsVideoModalOpen(true);
        }}
      />
    </div>
  );
}
