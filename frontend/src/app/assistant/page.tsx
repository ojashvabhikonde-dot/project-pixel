'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Camera, Sparkles, Send, Upload, Copy, AlertCircle, RefreshCw, Layers, Sliders, Hash } from 'lucide-react';
import { API_URL } from '@/config/api';

export default function AssistantPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'critique'>('chat');
  
  // Chat state
  const [messages, setMessages] = useState<any[]>([
    { sender: 'pixie', text: "Hello! I am Pixie, your Pixela Photography Club AI Assistant. Ask me anything about exposure settings, lens selections, lighting setups, or post-production edits in Lightroom & Premiere. I answer in English, Hindi, or Hinglish!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Critique state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [critiqueResult, setCritiqueResult] = useState<any | null>(null);
  const [critiqueLoading, setCritiqueLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat failed');
      
      setMessages(prev => [...prev, { sender: 'pixie', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'pixie', text: "Sorry, I encountered a temporary connection issue. Please make sure the backend is running." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCritiqueResult(null);
    }
  };

  const handleCritiqueSubmit = async () => {
    if (!selectedImage || critiqueLoading) return;
    setCritiqueLoading(true);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const res = await fetch(`${API_URL}/api/ai/critique`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Critique failed');

      setCritiqueResult(data.critique);
    } catch (err) {
      alert('Photo critique failed. Make sure your Gemini API key is configured correctly.');
    } finally {
      setCritiqueLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-10 bg-background text-left">
      
      {/* Page Header */}
      <div className="text-center space-y-4 pb-6 border-b border-border/30">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center justify-center space-x-1.5 font-mono">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span>Advanced AI Studio</span>
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase leading-none">
          Pixie Assistant
        </h1>
        <p className="max-w-xl mx-auto text-xs md:text-sm text-zinc-400 font-light leading-relaxed">
          Ask photography questions or upload your captures to get professional analysis on composition, settings, and Lightroom configurations.
        </p>
      </div>

      {/* Selector Tabs */}
      <div className="flex justify-center">
        <div className="bg-card/25 border border-border/50 p-1 rounded-full flex space-x-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider px-6 py-2 rounded-full transition-colors cursor-pointer ${
              activeTab === 'chat' 
                ? 'bg-[#dce4ec] text-[#080707]' 
                : 'text-zinc-550 hover:text-white'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat with Pixie</span>
          </button>
          <button
            onClick={() => setActiveTab('critique')}
            className={`flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider px-6 py-2 rounded-full transition-colors cursor-pointer ${
              activeTab === 'critique' 
                ? 'bg-[#dce4ec] text-[#080707]' 
                : 'text-zinc-550 hover:text-white'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>AI Photo Critique</span>
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="min-h-[500px] bg-card/25 border border-border/50 rounded overflow-hidden flex flex-col shadow-2xl relative">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pixela-gradient-bg opacity-[0.03] blur-3xl pointer-events-none" />

        {activeTab === 'chat' ? (
          /* CHAT INTERFACE */
          <div className="flex-1 flex flex-col h-[550px]">
            {/* Messages box */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 font-sans">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-[#5885ff] text-white font-semibold rounded-tr-none shadow-lg shadow-blue-900/30'
                      : 'bg-[#161517] border border-white/15 text-zinc-100 rounded-tl-none font-normal shadow-md'
                  }`}>
                    {msg.text.split('\n').map((line: string, lIdx: number) => (
                      <React.Fragment key={lIdx}>
                        {line.split(/(\*\*.*?\*\*)/g).map((part: string, pIdx: number) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return (
                              <strong key={pIdx} className="font-bold text-white bg-white/10 px-1 py-0.5 rounded text-xs sm:text-sm">
                                {part.slice(2, -2)}
                              </strong>
                            );
                          }
                          return part;
                        })}
                        {lIdx < msg.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#161517] border border-white/15 text-zinc-300 rounded-xl rounded-tl-none p-4 text-sm font-medium flex items-center space-x-2.5">
                    <RefreshCw className="h-4 w-4 animate-spin text-[#5885ff]" />
                    <span>Pixie is crafting an answer...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-6 py-2.5 border-t border-white/10 bg-zinc-950/60 flex items-center space-x-2 overflow-x-auto scrollbar-none">
              {[
                "📸 How to blur background in portraits?",
                "⚙️ Explain Exposure Triangle",
                "📅 Shutter Stories Exhibition Info",
                "🎨 Color grading Lightroom tips"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setChatInput(chip.replace(/^[^\s]+\s/, ''));
                  }}
                  className="text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-200 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat form entry */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#0f0e0e] flex gap-2">
              <input
                type="text"
                required
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about exposure settings, f-stops, leading lines, or Hinglish shoot guides..."
                className="flex-1 bg-[#161517] border border-white/15 focus:border-[#5885ff] rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none text-white placeholder:text-zinc-400"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="bg-[#5885ff] hover:bg-[#4372ef] text-white font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-md shadow-blue-900/30"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </form>
          </div>
        ) : (
          /* PHOTO CRITIQUE INTERFACE */
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Image Selector upload */}
              <div className="md:col-span-5 space-y-4">
                <div className="border border-dashed border-border/60 rounded aspect-[4/3] flex flex-col items-center justify-center relative overflow-hidden bg-zinc-900/30">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Critique preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center space-y-2 p-4 text-zinc-500">
                      <Upload className="h-8 w-8 mx-auto text-zinc-650" />
                      <p className="text-xs">Drag and drop or select an image file</p>
                      <p className="text-[10px] text-zinc-600">JPEG, PNG up to 10MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {previewUrl && (
                  <button
                    onClick={handleCritiqueSubmit}
                    disabled={critiqueLoading}
                    className="w-full bg-white text-black font-bold text-xs uppercase tracking-wider py-3 rounded hover:bg-zinc-200 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                  >
                    {critiqueLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Analyzing Exposure & Vectors...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>Analyze Photograph</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Critique output displays */}
              <div className="md:col-span-7 space-y-4">
                {!critiqueResult && !critiqueLoading && (
                  <div className="text-center py-20 border border-border/40 rounded text-zinc-550 space-y-2">
                    <Camera className="h-8 w-8 mx-auto text-zinc-700" />
                    <p className="text-xs">Upload and submit a photo to display composition, lighting, exposure, and editing critique.</p>
                  </div>
                )}

                {critiqueLoading && (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-zinc-900 rounded w-1/4" />
                    <div className="h-20 bg-zinc-900 rounded" />
                    <div className="h-20 bg-zinc-900 rounded" />
                  </div>
                )}

                {critiqueResult && (
                  <div className="space-y-4 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Composition */}
                      <div className="bg-card/25 border border-border/50 p-4 rounded space-y-1">
                        <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold font-mono block">Composition & Framing</span>
                        <p className="text-xs text-zinc-350 font-light leading-relaxed">{critiqueResult.composition}</p>
                      </div>

                      {/* Lighting */}
                      <div className="bg-card/25 border border-border/50 p-4 rounded space-y-1">
                        <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold font-mono block">Lighting & Shadows</span>
                        <p className="text-xs text-zinc-350 font-light leading-relaxed">{critiqueResult.lighting}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Exposure */}
                      <div className="bg-card/25 border border-border/50 p-4 rounded space-y-1">
                        <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold font-mono block">Exposure & Dynamic Range</span>
                        <p className="text-xs text-zinc-350 font-light leading-relaxed">{critiqueResult.exposure}</p>
                      </div>

                      {/* Color */}
                      <div className="bg-card/25 border border-border/50 p-4 rounded space-y-1">
                        <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold font-mono block">Color Harmony</span>
                        <p className="text-xs text-zinc-350 font-light leading-relaxed">{critiqueResult.color}</p>
                      </div>
                    </div>

                    {/* Presets & sliders */}
                    <div className="bg-card/25 border border-border/50 p-4 rounded space-y-3">
                      <span className="text-[9px] text-primary uppercase tracking-widest font-bold flex items-center space-x-1.5 font-mono">
                        <Sliders className="h-3.5 w-3.5" />
                        <span>Lightroom Preset & Sliders</span>
                      </span>
                      <div className="bg-zinc-950/80 p-3 rounded border border-border/40 flex justify-between items-center text-xs">
                        <div>
                          <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Theme</p>
                          <p className="text-white font-bold mt-0.5">{critiqueResult.preset || 'Cinematic Mood'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Suggested Sliders</p>
                          <p className="text-zinc-350 font-mono text-[10px] mt-0.5">{critiqueResult.editingSuggestions}</p>
                        </div>
                      </div>
                    </div>

                    {/* Captions and hashtags */}
                    <div className="bg-card/25 border border-border/50 p-4 rounded space-y-3">
                      <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold font-mono block">Social Caption Generator</span>
                      <p className="text-xs italic text-zinc-350 font-light leading-relaxed">"{critiqueResult.caption}"</p>
                      <div className="flex items-start gap-1.5 pt-2 text-[10px] text-zinc-500">
                        <Hash className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="font-mono text-secondary">{critiqueResult.hashtags}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
