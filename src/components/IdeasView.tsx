import React, { useState } from 'react';
import { Lightbulb, Trash2, ArrowUpRight, Sparkles, Loader2 } from 'lucide-react';
import { Idea, Channel } from '../types';

interface IdeasViewProps {
  ideas: Idea[];
  channels: Channel[];
  onAddIdea: (text: string, channelId: string) => void;
  onDeleteIdea: (id: string) => void;
  onConvertToVideo: (idea: Idea) => void;
}

const SAMPLE_TEMPLATES = [
  "How I built a $10,000/month side-hustle using only free tools",
  "The dark reality of the creator economy in 2026",
  "5 brutal mistakes that are killing your views (and how to fix them)",
  "I tried viral productivity hacks for 30 days. Here is what actually worked",
  "Why traditional education is failing, and how to learn anything fast",
  "The secret psychology behind why people click on YouTube videos",
  "My complete workflow for editing videos 10x faster"
];

export default function IdeasView({
  ideas,
  channels,
  onAddIdea,
  onDeleteIdea,
  onConvertToVideo,
}: IdeasViewProps) {
  const [text, setText] = useState('');
  const [channelId, setChannelId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !channelId) return;
    onAddIdea(text.trim(), channelId);
    setText('');
  };

  const handleSuggestIdeas = () => {
    if (!channelId) return;
    setIsGenerating(true);
    setGeneratedIdeas([]);

    setTimeout(() => {
      const selectedChannel = channels.find((c) => c.id === channelId);
      const name = selectedChannel?.name || 'My Channel';
      
      // Let's generate nice creative ideas tailored to this channel name
      const customSuggestions = [
        `How to start a ${name} in 2026 (Step-by-Step Guide)`,
        `I spent 100 hours researching ${name} secrets`,
        `5 shocking things you didn't know about ${name}`,
        `The ultimate ${name} breakdown for beginners`,
        `Why most people fail at ${name} (and how to succeed)`,
      ];
      
      setGeneratedIdeas(customSuggestions);
      setIsGenerating(false);
    }, 1200);
  };

  const handleUseGenerated = (suggestion: string) => {
    setText(suggestion);
  };

  return (
    <div id="ideas-view" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Scratchpad Form */}
      <div className="lg:col-span-5 bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[20px] p-4 md:p-5 shadow-xs h-fit transition-colors duration-150">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-red-50 dark:bg-red-950/20 text-[#E11D2E] dark:text-[#FF4655] p-2 rounded-lg">
            <Lightbulb className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-[#F0F1F4] leading-none font-display">
              Idea Scratchpad
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-[#6A7180] mt-1 font-sans">
              Apne rough ideas yahan likhein aur unhe videos me convert karein
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="field">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] mb-1.5 font-sans">
              Select Channel
            </label>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-[13.5px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655]"
              required
            >
              <option value="">Channel chunein...</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9AA0AF] font-sans">
                Idea Title / Topic Hook
              </label>
              {channelId && (
                <button
                  type="button"
                  onClick={handleSuggestIdeas}
                  disabled={isGenerating}
                  className="text-[11px] font-bold text-[#E11D2E] dark:text-[#FF4655] flex items-center gap-1 hover:underline disabled:opacity-50 font-sans"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-[#FFB800]" />
                  )}
                  AI Suggestions
                </button>
              )}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. 10 brutal coding lessons I learned the hard way"
              rows={4}
              className="w-full px-3 py-2.5 rounded-[10px] border border-gray-200 dark:border-[#2A2F3B] bg-gray-50 dark:bg-[#1D212B] text-gray-900 dark:text-[#F0F1F4] text-[13.5px] focus:outline-none focus:border-[#E11D2E] dark:focus:border-[#FF4655] resize-y"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#E11D2E] dark:bg-[#FF4655] text-white dark:text-[#0E1015] border-none rounded-[10px] text-[13px] font-bold hover:brightness-110 active:scale-[0.99] transition-all"
          >
            Save Idea
          </button>
        </form>

        {/* AI Suggestions Box */}
        {generatedIdeas.length > 0 && (
          <div className="mt-5 border-t border-gray-100 dark:border-[#2A2F3B] pt-4 animate-fadeIn">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#E11D2E] dark:text-[#FF4655] mb-2.5 font-sans flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" /> Tailored Channel Suggestions
            </h4>
            <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto pr-1">
              {generatedIdeas.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUseGenerated(suggestion)}
                  className="text-left text-[11.5px] p-2 rounded-lg bg-gray-50 dark:bg-[#1D212B] border border-gray-100 dark:border-[#2A2F3B] text-gray-700 dark:text-[#9AA0AF] hover:bg-[#E11D2E]/5 dark:hover:bg-[#FF4655]/5 hover:border-[#E11D2E]/25 dark:hover:border-[#FF4655]/25 transition-colors font-sans"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ideas Deck */}
      <div className="lg:col-span-7 bg-white dark:bg-[#171A22] border border-gray-200 dark:border-[#2A2F3B] rounded-[20px] p-4 md:p-5 shadow-xs flex flex-col transition-colors duration-150">
        <h3 className="text-[15px] font-bold text-gray-900 dark:text-[#F0F1F4] mb-3.5 font-display">
          Active Ideas List ({ideas.length})
        </h3>

        <div className="flex-1 flex flex-col gap-2 max-h-[450px] overflow-y-auto pr-1">
          {ideas.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <Lightbulb className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-xs text-gray-400 dark:text-[#6A7180] font-sans">
                Koi ideas nahi hain. Baaju waale form se ek idea add karein!
              </p>
            </div>
          ) : (
            ideas.map((idea) => {
              const chan = channels.find((c) => c.id === idea.channelId);
              return (
                <div
                  key={idea.id}
                  className="bg-gray-50 dark:bg-[#1D212B] border border-gray-100 dark:border-[#2A2F3B] p-3.5 rounded-[14px] flex justify-between items-start gap-4 hover:border-gray-300 dark:hover:border-[#4B5366] transition-all group"
                >
                  <div className="min-w-0">
                    {chan && (
                      <span
                        className="text-[9px] font-extrabold text-white uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1.5"
                        style={{ backgroundColor: chan.color }}
                      >
                        {chan.name}
                      </span>
                    )}
                    <p className="text-xs md:text-[13px] font-bold text-gray-900 dark:text-[#F0F1F4] leading-normal font-sans">
                      {idea.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onConvertToVideo(idea)}
                      className="bg-[#E11D2E]/5 dark:bg-[#FF4655]/5 border border-[#E11D2E]/20 dark:border-[#FF4655]/20 hover:bg-[#E11D2E] dark:hover:bg-[#FF4655] hover:text-white dark:hover:text-[#0E1015] text-[#E11D2E] dark:text-[#FF4655] p-2 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold font-sans"
                      title="Naya Video banao is idea se"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Create Video
                    </button>
                    <button
                      onClick={() => onDeleteIdea(idea.id)}
                      className="text-gray-400 hover:text-[#E11D2E] dark:hover:text-[#FF4655] p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
    </div>
  );
}
