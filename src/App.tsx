import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Tv,
  Calendar as CalIcon,
  Lightbulb,
  Moon,
  Sun,
  X,
  Trash2,
  ListTodo,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Upload,
  Cloud,
  Check,
} from 'lucide-react';
import { Channel, Video, VideoStatus, Idea } from './types';
import StatsSection from './components/StatsSection';
import ChannelModal from './components/ChannelModal';
import VideoModal from './components/VideoModal';
import DetailModal from './components/DetailModal';
import CalendarView from './components/CalendarView';
import IdeasView from './components/IdeasView';
import { onSnapshot, collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';

// Preset Seeding
const INITIAL_CHANNELS: Channel[] = [
  { id: 'ch-1', name: 'Coconut Business Vlogs', handle: '@coconutvlogs', color: '#B4690E', createdAt: new Date().toISOString() },
  { id: 'ch-2', name: 'Tech Tech India', handle: '@techtech', color: '#2557C7', createdAt: new Date().toISOString() },
  { id: 'ch-3', name: 'Zindagi & Shorts', handle: '@zindagi_shorts', color: '#E11D2E', createdAt: new Date().toISOString() },
];

const INITIAL_VIDEOS: Video[] = [
  {
    id: 'vid-1',
    channelId: 'ch-1',
    title: 'Coconut Trading Business Setup Guide (Hindi)',
    description: 'Practical business breakdown explaining the logistics, wholesale supply chain, and profitability margins of coconut trading in Mumbai and Chennai.',
    script: '1. Hook: 15 Rupaye ka nariyal, 60 me kaise bikta hai?\n2. Wholesale suppliers contact guide\n3. Transport cost vs profit analysis\n4. Real stall setup stories.',
    voiceNotes: 'Keep the tone conversational, use real terms like Mandi, transport charges.',
    status: 'Pending',
    scheduledDate: '',
    checklist: { script: true, voice: false, fullVideo: false, thumbnail: false, title: false, description: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vid-2',
    channelId: 'ch-2',
    title: 'Top 5 Tech Inventions in 2026',
    description: 'Looking at how wearable augmented reality and miniature batteries have changed daily user productivity.',
    script: '1. Glass AR tech standard features\n2. Battery life breakthrough discussion\n3. AI agents in operating systems.',
    voiceNotes: 'Dynamic tech-channel presentation, sound effects cues.',
    status: 'Scheduled',
    scheduledDate: '2026-07-20T18:00',
    checklist: { script: true, voice: true, fullVideo: true, thumbnail: true, title: true, description: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vid-3',
    channelId: 'ch-3',
    title: 'Zindagi ke 3 Kadwe Sach (Short)',
    description: 'Inspirational short talking about focus, work ethics, and the trap of social media comparisons.',
    script: 'Line 1: Jab tak khud pe kaam nahi karoge, results nahi milenge.\nLine 2: Dusro ki posts dekhna band karo.\nLine 3: Hard work beat talent.',
    voiceNotes: 'Background deep low-fi music, clear crisp voice recording.',
    status: 'Published',
    scheduledDate: '',
    checklist: { script: true, voice: true, fullVideo: true, thumbnail: true, title: true, description: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_IDEAS: Idea[] = [
  { id: 'id-1', text: 'Why $1 coconuts are dominating wholesale markets', channelId: 'ch-1', createdAt: new Date().toISOString() },
  { id: 'id-2', text: 'Vite 6 is extremely fast! Real benchmarks', channelId: 'ch-2', createdAt: new Date().toISOString() },
];

export default function App() {
  // ---------- Load States with fallbacks ----------
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('creator_channels');
    return saved ? JSON.parse(saved) : INITIAL_CHANNELS;
  });

  const [videos, setVideos] = useState<Video[]>(() => {
    const saved = localStorage.getItem('creator_videos');
    return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
  });

  const [ideas, setIdeas] = useState<Idea[]>(() => {
    const saved = localStorage.getItem('creator_ideas');
    return saved ? JSON.parse(saved) : INITIAL_IDEAS;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('creator_theme');
    return saved === 'dark';
  });

  // Firebase integration states
  const [loadingCloud, setLoadingCloud] = useState<boolean>(false);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'Pipeline' | 'Calendar' | 'Idea Deck'>('Pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState('all');

  // Modal Open states
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Focus Video for Edit/Detail
  const [focusedVideo, setFocusedVideo] = useState<Video | null>(null);

  // Prepopulated values for Idea convertion
  const [initialTitle, setInitialTitle] = useState('');
  const [initialChannelId, setInitialChannelId] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ---------- Firebase Firestore Realtime Sync & Auto-Seeding ----------
  useEffect(() => {
    setLoadingCloud(true);

    const unsubChannels = onSnapshot(
      collection(db, 'channels'),
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            for (const ch of INITIAL_CHANNELS) {
              await setDoc(doc(db, 'channels', ch.id), ch);
            }
          } catch (e) {
            console.error('Seeding channels failed:', e);
          }
        } else {
          const list: Channel[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as Channel);
          });
          setChannels(list);
        }
        setLoadingCloud(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'channels');
      }
    );

    const unsubVideos = onSnapshot(
      collection(db, 'videos'),
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            for (const vid of INITIAL_VIDEOS) {
              await setDoc(doc(db, 'videos', vid.id), vid);
            }
          } catch (e) {
            console.error('Seeding videos failed:', e);
          }
        } else {
          const list: Video[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as Video);
          });
          setVideos(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'videos');
      }
    );

    const unsubIdeas = onSnapshot(
      collection(db, 'ideas'),
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            for (const idea of INITIAL_IDEAS) {
              await setDoc(doc(db, 'ideas', idea.id), idea);
            }
          } catch (e) {
            console.error('Seeding ideas failed:', e);
          }
        } else {
          const list: Idea[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as Idea);
          });
          setIdeas(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'ideas');
      }
    );

    return () => {
      unsubChannels();
      unsubVideos();
      unsubIdeas();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('creator_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // ---------- Helpers ----------
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // ---------- Channel Actions ----------
  const handleAddChannel = async (name: string, handle: string, color: string) => {
    const newChan: Channel = {
      id: `ch-${Date.now()}`,
      name,
      handle,
      color,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'channels', newChan.id), newChan);
      triggerToast(`"${name}" channel add kiya gaya`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `channels/${newChan.id}`);
      triggerToast('Error: Channel add nahi ho saka');
    }
  };

  const handleDeleteChannel = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'channels', id));
      triggerToast('Channel hataya gaya');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `channels/${id}`);
      triggerToast('Error: Channel delete nahi ho saka');
    }
  };

  // ---------- Video Actions ----------
  const handleSaveVideo = async (data: {
    channelId: string;
    title: string;
    description: string;
    script: string;
    voiceNotes: string;
    status: VideoStatus;
    scheduledDate: string;
  }) => {
    if (focusedVideo) {
      // Edit mode
      const updatedVideo: Video = {
        ...focusedVideo,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'videos', updatedVideo.id), updatedVideo);
        triggerToast('Video details update kar di gayi');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `videos/${updatedVideo.id}`);
        triggerToast('Error: Video update nahi ho saka');
      }
      setFocusedVideo(null);
    } else {
      // Create mode
      const newVideo: Video = {
        id: `vid-${Date.now()}`,
        channelId: data.channelId,
        title: data.title,
        description: data.description,
        script: data.script,
        voiceNotes: data.voiceNotes,
        status: data.status,
        scheduledDate: data.scheduledDate,
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
      try {
        await setDoc(doc(db, 'videos', newVideo.id), newVideo);
        triggerToast('Naya video pipeline me add kiya gaya');
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `videos/${newVideo.id}`);
        triggerToast('Error: Video add nahi ho saka');
      }
    }
    setIsVideoModalOpen(false);
    setInitialTitle('');
    setInitialChannelId('');
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'videos', id));
      setIsDetailModalOpen(false);
      triggerToast('Video delete ho gaya');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `videos/${id}`);
      triggerToast('Error: Video delete nahi ho saka');
    }
  };

  const handleStatusChange = async (id: string, newStatus: VideoStatus) => {
    const targetVideo = videos.find((v) => v.id === id);
    if (!targetVideo) return;

    const updatedVideo: Video = {
      ...targetVideo,
      status: newStatus,
      scheduledDate: newStatus === 'Scheduled' ? targetVideo.scheduledDate || new Date().toISOString().slice(0, 16) : '',
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'videos', id), updatedVideo);
      triggerToast(`Status badal kar "${newStatus}" kiya gaya`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `videos/${id}`);
      triggerToast('Error: Status update nahi ho saka');
    }

    // Sync focused video if open
    if (focusedVideo && focusedVideo.id === id) {
      setFocusedVideo(updatedVideo);
    }
  };

  const handleChecklistToggle = async (id: string, key: keyof Video['checklist']) => {
    const targetVideo = videos.find((v) => v.id === id);
    if (!targetVideo) return;

    const updatedVideo: Video = {
      ...targetVideo,
      checklist: {
        ...targetVideo.checklist,
        [key]: !targetVideo.checklist[key],
      },
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'videos', id), updatedVideo);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `videos/${id}`);
      triggerToast('Error: Checklist update nahi ho saki');
    }

    // Sync focused video if open
    if (focusedVideo && focusedVideo.id === id) {
      setFocusedVideo(updatedVideo);
    }
  };

  // ---------- Idea Actions ----------
  const handleAddIdea = async (text: string, channelId: string) => {
    const newIdea: Idea = {
      id: `id-${Date.now()}`,
      text,
      channelId,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'ideas', newIdea.id), newIdea);
      triggerToast('Idea Scratchpad me save ho gaya');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `ideas/${newIdea.id}`);
      triggerToast('Error: Idea save nahi ho saka');
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ideas', id));
      triggerToast('Idea delete ho gaya');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `ideas/${id}`);
      triggerToast('Error: Idea delete nahi ho saka');
    }
  };

  const handleConvertToVideo = async (idea: Idea) => {
    setInitialTitle(idea.text);
    setInitialChannelId(idea.channelId);
    setFocusedVideo(null); // explicitly reset focused video (we are creating)
    setIsVideoModalOpen(true);
    // Delete idea once processed
    try {
      await deleteDoc(doc(db, 'ideas', idea.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `ideas/${idea.id}`);
    }
  };

  // ---------- Export/Backup ----------
  const handleExportData = () => {
    const backupData = {
      channels,
      videos,
      ideas,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CreatorHisaab_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Backup file export ho gayi hai!');
  };

  // ---------- Import/Restore ----------
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.channels && data.videos && data.ideas) {
          triggerToast('Backup database me sync ho raha hai...');
          for (const ch of data.channels) {
            await setDoc(doc(db, 'channels', ch.id), ch);
          }
          for (const vid of data.videos) {
            await setDoc(doc(db, 'videos', vid.id), vid);
          }
          for (const idea of data.ideas) {
            await setDoc(doc(db, 'ideas', idea.id), idea);
          }
          triggerToast('Backup Cloud me restore ho gaya!');
        } else {
          triggerToast('Error: Backup format invalid hai');
        }
      } catch (err) {
        triggerToast('Error: Backup restore karne me koi samasya aayi');
      }
    };
    reader.readAsText(file);
  };

  // ---------- Filtered List Builders ----------
  const getFilteredVideos = () => {
    return videos.filter((v) => {
      const matchSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchChannel = selectedChannelFilter === 'all' || v.channelId === selectedChannelFilter;
      return matchSearch && matchChannel;
    });
  };

  const filteredVideos = getFilteredVideos();

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0E1015] text-gray-900 dark:text-[#F0F1F4] transition-colors duration-200 pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-[#171A22] text-white border border-[#2A2F3B] p-3 px-5 rounded-[12px] shadow-lg z-50 text-xs md:text-sm font-semibold animate-fadeIn flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#3ED586] animate-ping" />
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <header className="border-b border-gray-200 dark:border-[#1D212B] bg-white dark:bg-[#171A22] sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="bg-[#E11D2E] text-white p-2 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 id="appTitle" className="text-base font-extrabold text-gray-900 dark:text-white leading-none tracking-tight font-display">
                  Creator Hisaab
                </h1>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#158A4C]/10 text-[#158A4C] dark:text-[#3ED586] border border-[#158A4C]/15 select-none animate-pulse">
                  <Cloud className="w-3 h-3" />
                  <span>Cloud Active</span>
                </span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-[#6A7180] tracking-wider uppercase font-sans mt-0.5 block">
                Video Pipeline Hub
              </span>
            </div>
          </div>

          {/* Quick Actions (Theme, Backup, Channels) */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* Backup Exporter */}
            <button
              onClick={handleExportData}
              title="Backup export karein (JSON)"
              className="p-2 border border-gray-200 dark:border-[#2A2F3B] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[10px] text-gray-500 dark:text-[#9AA0AF] transition-all flex items-center justify-center"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Backup Importer */}
            <label className="p-2 border border-gray-200 dark:border-[#2A2F3B] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[10px] text-gray-500 dark:text-[#9AA0AF] transition-all flex items-center justify-center cursor-pointer">
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 border border-gray-200 dark:border-[#2A2F3B] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[10px] text-gray-500 dark:text-[#9AA0AF] transition-all flex items-center justify-center"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#FFB800]" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Channels Modal Open */}
            <button
              onClick={() => setIsChannelModalOpen(true)}
              className="px-3.5 py-2 border border-gray-200 dark:border-[#2A2F3B] bg-white dark:bg-transparent text-gray-700 dark:text-[#9AA0AF] font-bold text-xs md:text-[13px] rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-1.5"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Channels ({channels.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        
        {/* Pipeline Summary Counters */}
        <StatsSection videos={videos} />

        {/* Tab Filters and Search Deck */}
        <div className="bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[18px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 transition-colors duration-150">
          
          {/* Tabs */}
          <div className="flex gap-1.5 border border-gray-100 dark:border-[#2A2F3B] p-1 rounded-[12px] bg-gray-50 dark:bg-[#1D212B] w-fit">
            {(['Pipeline', 'Calendar', 'Idea Deck'] as const).map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-[9px] text-xs md:text-[13px] font-bold transition-all ${
                    active
                      ? 'bg-white dark:bg-[#171A22] text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-[#9AA0AF] hover:text-gray-800 dark:hover:text-[#F0F1F4]'
                  }`}
                >
                  {tab === 'Pipeline' && <ListTodo className="w-3.5 h-3.5 inline mr-1" />}
                  {tab === 'Calendar' && <CalIcon className="w-3.5 h-3.5 inline mr-1" />}
                  {tab === 'Idea Deck' && <Lightbulb className="w-3.5 h-3.5 inline mr-1" />}
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Search & Channel Selector & New Video */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto">
            
            {/* New Video Button */}
            <button
              onClick={() => {
                setFocusedVideo(null);
                setInitialTitle('');
                setInitialChannelId('');
                setIsVideoModalOpen(true);
              }}
              className="px-4 py-2 bg-[#E11D2E] dark:bg-[#FF4655] hover:brightness-110 active:scale-95 text-white dark:text-[#0E1015] font-bold text-xs md:text-[13px] rounded-[10px] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Video</span>
            </button>

            {/* Channel filter */}
            <select
              value={selectedChannelFilter}
              onChange={(e) => setSelectedChannelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-[#2A2F3B] rounded-[10px] bg-gray-50 dark:bg-[#1D212B] text-gray-700 dark:text-[#9AA0AF] text-xs md:text-[13px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655]"
            >
              <option value="all">Sabhi Channels</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6A7180]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Video title search karein..."
                className="pl-9 pr-4 py-2 w-full sm:w-[220px] md:w-[260px] border border-gray-200 dark:border-[#2A2F3B] rounded-[10px] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-xs md:text-[13px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655]"
              />
            </div>
          </div>
        </div>

        {/* View Switcher Router */}
        {activeTab === 'Pipeline' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* COLUMN 1: Pending */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2A2F3B] pb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B4690E] dark:bg-[#F5A544]" />
                  <h3 className="text-[14px] font-bold text-gray-900 dark:text-[#F0F1F4] font-display">Pending / Research</h3>
                </div>
                <span className="bg-gray-100 dark:bg-[#1D212B] px-2 py-0.5 rounded-md text-[10.5px] font-bold text-gray-500 dark:text-[#9AA0AF]">
                  {filteredVideos.filter((v) => v.status === 'Pending').length}
                </span>
              </div>
              <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
                {filteredVideos.filter((v) => v.status === 'Pending').map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    channels={channels}
                    onClick={() => {
                      setFocusedVideo(video);
                      setIsDetailModalOpen(true);
                    }}
                    onChecklistToggle={handleChecklistToggle}
                    onStatusChange={handleStatusChange}
                  />
                ))}
                {filteredVideos.filter((v) => v.status === 'Pending').length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-[#6A7180] text-center py-6 border border-dashed border-gray-200 dark:border-[#2A2F3B] rounded-xl">
                    Koi pending videos nahi hain
                  </p>
                )}
              </div>
            </div>

            {/* COLUMN 2: Scheduled */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2A2F3B] pb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2557C7] dark:bg-[#6C9CFF]" />
                  <h3 className="text-[14px] font-bold text-gray-900 dark:text-[#F0F1F4] font-display">Scheduled</h3>
                </div>
                <span className="bg-gray-100 dark:bg-[#1D212B] px-2 py-0.5 rounded-md text-[10.5px] font-bold text-gray-500 dark:text-[#9AA0AF]">
                  {filteredVideos.filter((v) => v.status === 'Scheduled').length}
                </span>
              </div>
              <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
                {filteredVideos.filter((v) => v.status === 'Scheduled').map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    channels={channels}
                    onClick={() => {
                      setFocusedVideo(video);
                      setIsDetailModalOpen(true);
                    }}
                    onChecklistToggle={handleChecklistToggle}
                    onStatusChange={handleStatusChange}
                  />
                ))}
                {filteredVideos.filter((v) => v.status === 'Scheduled').length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-[#6A7180] text-center py-6 border border-dashed border-gray-200 dark:border-[#2A2F3B] rounded-xl">
                    Koi scheduled videos nahi hain
                  </p>
                )}
              </div>
            </div>

            {/* COLUMN 3: Published */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2A2F3B] pb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#158A4C] dark:bg-[#3ED586]" />
                  <h3 className="text-[14px] font-bold text-gray-900 dark:text-[#F0F1F4] font-display">Published</h3>
                </div>
                <span className="bg-gray-100 dark:bg-[#1D212B] px-2 py-0.5 rounded-md text-[10.5px] font-bold text-gray-500 dark:text-[#9AA0AF]">
                  {filteredVideos.filter((v) => v.status === 'Published').length}
                </span>
              </div>
              <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
                {filteredVideos.filter((v) => v.status === 'Published').map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    channels={channels}
                    onClick={() => {
                      setFocusedVideo(video);
                      setIsDetailModalOpen(true);
                    }}
                    onChecklistToggle={handleChecklistToggle}
                    onStatusChange={handleStatusChange}
                  />
                ))}
                {filteredVideos.filter((v) => v.status === 'Published').length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-[#6A7180] text-center py-6 border border-dashed border-gray-200 dark:border-[#2A2F3B] rounded-xl">
                    Koi published videos nahi hain
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'Calendar' && (
          <CalendarView
            videos={videos}
            channels={channels}
            onSelectVideo={(video) => {
              setFocusedVideo(video);
              setIsDetailModalOpen(true);
            }}
          />
        )}

        {activeTab === 'Idea Deck' && (
          <IdeasView
            ideas={ideas}
            channels={channels}
            onAddIdea={handleAddIdea}
            onDeleteIdea={handleDeleteIdea}
            onConvertToVideo={handleConvertToVideo}
          />
        )}

      </main>

      {/* Footer Branding Disclaimer */}
      <footer className="max-w-7xl mx-auto px-4 md:px-6 mt-16 text-center text-[11px] text-gray-400 dark:text-[#6A7180]">
        <p className="font-sans">Creator Hisaab — Video Production Manager</p>
        <p className="mt-1.5 font-sans">
          Mene GitHub me dal diya hai isko! Aapka data local state me save ho raha hai. Isko permanent save rakhne ke liye download/restore backups button use karein.
        </p>
      </footer>

      {/* MODAL 1: Manage Channels */}
      <ChannelModal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        channels={channels}
        onAddChannel={handleAddChannel}
        onDeleteChannel={handleDeleteChannel}
      />

      {/* MODAL 2: Create / Edit Video Details */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setFocusedVideo(null);
          setInitialTitle('');
          setInitialChannelId('');
        }}
        channels={channels}
        video={focusedVideo}
        onSave={handleSaveVideo}
        initialTitle={initialTitle}
        initialChannelId={initialChannelId}
      />

      {/* MODAL 3: Detail View / Production Checklist tracker */}
      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setFocusedVideo(null);
        }}
        video={focusedVideo}
        channels={channels}
        onStatusChange={handleStatusChange}
        onChecklistToggle={handleChecklistToggle}
        onDelete={handleDeleteVideo}
        onEdit={(video) => {
          setFocusedVideo(video);
          setIsDetailModalOpen(false);
          setIsVideoModalOpen(true);
        }}
      />

    </div>
  );
}

// ---------- Sub Component: VideoCard ----------
interface VideoCardProps {
  video: Video;
  channels: Channel[];
  onClick: () => void;
  onChecklistToggle: (id: string, key: keyof Video['checklist']) => void;
  onStatusChange: (id: string, newStatus: VideoStatus) => void;
}

const CHECKLIST_ORDER: [keyof Video['checklist'], string][] = [
  ['script', 'Script'],
  ['voice', 'Voice'],
  ['fullVideo', 'Editing'],
  ['thumbnail', 'Thumbnail'],
  ['title', 'Title'],
  ['description', 'Description'],
];

function VideoCard({ video, channels, onClick, onChecklistToggle, onStatusChange }: VideoCardProps) {
  const currentChannel = channels.find((c) => c.id === video.channelId);
  const chanColor = currentChannel?.color || '#8A93A6';
  const chanName = currentChannel?.name || 'No Channel';

  // Count checklist progress
  const checklistKeys: (keyof Video['checklist'])[] = ['script', 'voice', 'fullVideo', 'thumbnail', 'title', 'description'];
  const doneCount = checklistKeys.filter((k) => video.checklist[k]).length;

  const handleNextStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (video.status === 'Pending') onStatusChange(video.id, 'Scheduled');
    else if (video.status === 'Scheduled') onStatusChange(video.id, 'Published');
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] hover:border-gray-300 dark:hover:border-[#4B5366] rounded-[16px] p-4 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer group flex flex-col gap-3"
    >
      {/* Card Channel and Action */}
      <div className="flex justify-between items-center">
        <span
          className="text-[9px] font-extrabold text-white uppercase tracking-wider px-2 py-0.5 rounded-full truncate max-w-[150px] font-sans"
          style={{ backgroundColor: chanColor }}
        >
          {chanName}
        </span>

        {video.status !== 'Published' && (
          <button
            onClick={handleNextStatus}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 dark:bg-[#1D212B] text-gray-600 dark:text-[#9AA0AF] hover:text-gray-950 dark:hover:text-white px-2 py-0.5 rounded-[6px] text-[10px] font-bold flex items-center gap-1 border border-gray-200 dark:border-[#2A2F3B]"
          >
            Move Next
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Title */}
      <h4 className="text-xs md:text-[13px] font-bold text-gray-900 dark:text-[#F0F1F4] leading-snug group-hover:text-[#E11D2E] dark:group-hover:text-[#FF4655] transition-colors font-sans">
        {video.title}
      </h4>

      {/* Description */}
      {video.description && (
        <p className="text-[11.5px] text-gray-500 dark:text-[#9AA0AF] line-clamp-2 leading-relaxed font-sans">
          {video.description}
        </p>
      )}

      {/* Date Timings */}
      {video.status === 'Scheduled' && video.scheduledDate && (
        <div className="flex items-center gap-1 text-[10px] text-[#2557C7] dark:text-[#6C9CFF] font-mono font-medium bg-[#2557C7]/5 dark:bg-[#6C9CFF]/5 border border-[#2557C7]/15 dark:border-[#6C9CFF]/15 px-2 py-1 rounded-[8px] w-fit">
          <Clock className="w-3 h-3" />
          <span>{new Date(video.scheduledDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} at {new Date(video.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}

      {/* Segmented Progress bar & text */}
      <div className="flex flex-col gap-1.5 mt-0.5">
        <div className="flex gap-1.5 h-1.5">
          {checklistKeys.map((k) => {
            const isDone = video.checklist[k];
            return (
              <div
                key={k}
                className={`flex-1 h-full rounded-full transition-all duration-300 ${
                  isDone ? 'bg-[#158A4C] dark:bg-[#3ED586]' : 'bg-gray-100 dark:bg-[#1D212B]'
                }`}
              />
            );
          })}
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold font-sans text-gray-400 dark:text-[#6A7180]">
          <span>{doneCount}/6 steps completed</span>
          <span className="bg-gray-100 dark:bg-[#1D212B] px-1 py-0.5 rounded text-[9.5px]">
            {Math.round((doneCount / 6) * 100)}%
          </span>
        </div>
      </div>

      {/* Interactive Checklist Grid */}
      <div
        className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-gray-100 dark:border-[#1D212B]"
        onClick={(e) => e.stopPropagation()}
      >
        {CHECKLIST_ORDER.map(([k, label]) => {
          const checked = video.checklist[k];
          return (
            <button
              key={k}
              onClick={(e) => {
                e.stopPropagation();
                onChecklistToggle(video.id, k);
              }}
              className={`flex items-center gap-2 p-1.5 rounded-[8px] border text-left transition-all active:scale-[0.98] cursor-pointer ${
                checked
                  ? 'bg-[#E7F6EE] dark:bg-[#0F2A1E] border-[#158A4C] dark:border-[#3ED586]'
                  : 'bg-gray-50 dark:bg-[#1D212B] border-gray-200 dark:border-[#2A2F3B]'
              }`}
            >
              <span
                className={`w-[13px] h-[13px] rounded-[3px] border flex-shrink-0 flex items-center justify-center transition-all ${
                  checked
                    ? 'bg-[#158A4C] dark:bg-[#3ED586] border-[#158A4C] dark:border-[#3ED586]'
                    : 'border-gray-400 dark:border-gray-600'
                }`}
              >
                {checked && <Check className="w-2.5 h-2.5 text-white dark:text-[#0E1015]" />}
              </span>
              <span className="text-[10px] font-bold text-gray-800 dark:text-[#F0F1F4] font-sans truncate">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
