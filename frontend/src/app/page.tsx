'use client';

import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { Camera, Calendar, MapPin, Clock, ArrowRight, Image as ImageIcon, Flame, ChevronRight, Mail, Heart, ChevronLeft } from 'lucide-react';

const AperturePLogo = () => (
  <svg
    viewBox="0 0 500 600"
    className="w-[300px] sm:w-[400px] md:w-[500px] h-auto text-zinc-500 opacity-[0.06] select-none pointer-events-none absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 z-0"
    fill="currentColor"
  >
    {/* Base P letter shape with cutout */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M120 80h180c80 0 140 45 140 120s-60 120-140 120h-90v200h-90V80zm90 70v100h90c40 0 60-20 60-50s-20-50-60-50h-90z"
    />
    {/* Center of the loop is at X=255, Y=200, radius is ~50 */}
    {/* Aperture blades inside the loop cutout */}
    <g transform="translate(255, 200)">
      {/* Circle outline of the aperture */}
      <circle cx="0" cy="0" r="48" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      {/* 8 Aperture Blades */}
      <path d="M 0 -48 L 30 -37 L 15 -5 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M 33.9 -33.9 L 46.4 -8.3 L 13.6 13.6 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M 48 0 L 37 30 L 5 15 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M 33.9 33.9 L 8.3 46.4 L -13.6 13.6 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M 0 48 L -30 37 L -15 5 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M -33.9 33.9 L -46.4 8.3 L -13.6 -13.6 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M -48 0 L -37 -30 L -5 -15 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M -33.9 -33.9 L -8.3 -46.4 L 13.6 -13.6 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
    </g>
  </svg>
);

export default function Home() {
  const [stats, setStats] = useState({
    members: 54,
    eventsCovered: 120,
    photosApproved: 450,
    workshops: 12,
  });

  const [featuredPhotos, setFeaturedPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shutterFlash, setShutterFlash] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setFeaturedPhotos(data.slice(0, 3));
        } else {
          setFeaturedPhotos(MOCK_PHOTOS.slice(0, 3));
        }
      })
      .catch(() => {
        setFeaturedPhotos(MOCK_PHOTOS.slice(0, 3));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const triggerShutter = () => {
    setShutterFlash(true);
    setTimeout(() => {
      setShutterFlash(false);
    }, 150);
  };

  return (
    <div className="relative w-full overflow-hidden bg-background">
      
      {/* Shutter Click Flash Overlay */}
      {shutterFlash && (
        <div className="fixed inset-0 bg-white z-50 pointer-events-none opacity-100 transition-opacity duration-150" />
      )}

      {/* 1. Cinematic Hero Section */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 py-20 text-center studio-spotlight">
        <AperturePLogo />

        {/* DSLR Viewfinder Frame Lines */}
        <div className="absolute top-10 left-10 w-8 h-8 border-t border-l border-white/10 pointer-events-none select-none hidden lg:block" />
        <div className="absolute top-10 right-10 w-8 h-8 border-t border-r border-white/10 pointer-events-none select-none hidden lg:block" />
        <div className="absolute bottom-10 left-10 w-8 h-8 border-b border-l border-white/10 pointer-events-none select-none hidden lg:block" />
        <div className="absolute bottom-10 right-10 w-8 h-8 border-b border-r border-white/10 pointer-events-none select-none hidden lg:block" />

        {/* Viewfinder Overlay Info - REC indicators */}
        <div className="absolute top-10 left-12 flex items-center space-x-2 text-[10px] font-mono text-zinc-500 tracking-wider select-none hidden lg:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-red-600 rec-blinker" />
          <span className="font-bold text-zinc-400">REC</span>
          <span>4K 60FPS</span>
        </div>

        {/* Viewfinder Overlay Info - Battery and SD status */}
        <div className="absolute top-10 right-12 flex items-center space-x-4 text-[10px] font-mono text-zinc-500 tracking-wider select-none hidden lg:flex">
          <span>SD 128GB</span>
          <div className="flex items-center space-x-1">
            <span>98%</span>
            <div className="w-5 h-2.5 border border-zinc-500 rounded-sm p-[1px] flex items-stretch">
              <div className="bg-zinc-400 w-full rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Viewfinder Overlay Info - Exposure scale */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1 text-[9px] font-mono text-zinc-650 select-none tracking-widest hidden lg:flex">
          <div className="flex items-center space-x-1.5">
            <span>-2</span>
            <span>.</span>
            <span>-1</span>
            <span>.</span>
            <span className="text-primary font-bold">0</span>
            <span>.</span>
            <span>+1</span>
            <span>.</span>
            <span>+2</span>
          </div>
          <span className="text-[7px] text-zinc-500">▼ EXPOSURE METER</span>
        </div>

        {/* Viewfinder Overlay Info - Audio level jump meters */}
        <div className="absolute bottom-10 left-12 flex items-end space-x-[2px] h-6 w-12 select-none hidden lg:flex">
          <div className="audio-bar bg-zinc-650 w-[3px]" style={{ animationDelay: '0.1s' }} />
          <div className="audio-bar bg-zinc-650 w-[3px]" style={{ animationDelay: '0.4s' }} />
          <div className="audio-bar bg-zinc-650 w-[3px]" style={{ animationDelay: '0.2s' }} />
          <div className="audio-bar bg-zinc-650 w-[3px]" style={{ animationDelay: '0.5s' }} />
          <span className="text-[8px] font-mono text-zinc-600 ml-2">CH1</span>
        </div>
        
        {/* Floating Polaroid Left */}
        <div className="absolute left-[3%] lg:left-[8%] top-[22%] hidden md:block w-[160px] lg:w-[185px] bg-[#0c0b0b] border border-border/70 p-3 pb-6 shadow-2xl z-20 float-polaroid-left hover:scale-105 hover:border-primary/40 transition-all duration-300">
          <div className="aspect-square bg-zinc-950 overflow-hidden relative border border-white/5 mb-3">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/hero_river.jpg')` }} />
          </div>
          <div className="space-y-0.5 text-left font-mono">
            <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">EXP // 1/500S</p>
            <p className="text-[7px] text-zinc-500">ISO 100 • 24MM</p>
          </div>
        </div>

        {/* Floating Polaroid Right */}
        <div className="absolute right-[3%] lg:right-[8%] top-[26%] hidden md:block w-[160px] lg:w-[185px] bg-[#0c0b0b] border border-border/70 p-3 pb-6 shadow-2xl z-20 float-polaroid-right hover:scale-105 hover:border-secondary/40 transition-all duration-300">
          <div className="aspect-square bg-zinc-950 overflow-hidden relative border border-white/5 mb-3">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/hero_nature.jpg')` }} />
          </div>
          <div className="space-y-0.5 text-left font-mono">
            <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">SHUTTER // F/2.8</p>
            <p className="text-[7px] text-zinc-500">ISO 200 • 50MM</p>
          </div>
        </div>

        {/* 4 Background Photographs (Behind the Text) */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
          {/* Photograph 1 - Top Left */}
          <div 
            className="absolute left-[12%] top-[10%] w-[140px] md:w-[185px] aspect-[4/3] bg-cover bg-center rounded-lg border border-white/15 opacity-[0.25] shadow-2xl rotate-[-10deg] float-polaroid-left" 
            style={{ backgroundImage: `url('/hero_mountain.jpg')` }}
          />
          {/* Photograph 2 - Bottom Left */}
          <div 
            className="absolute left-[22%] bottom-[12%] w-[130px] md:w-[170px] aspect-[3/4] bg-cover bg-center rounded-lg border border-white/15 opacity-[0.25] shadow-2xl rotate-[8deg] float-polaroid-right" 
            style={{ backgroundImage: `url('/hero_street.jpg')` }}
          />
          {/* Photograph 3 - Top Right */}
          <div 
            className="absolute right-[12%] top-[12%] w-[135px] md:w-[180px] aspect-[4/3] bg-cover bg-center rounded-lg border border-white/15 opacity-[0.25] shadow-2xl rotate-[12deg] float-polaroid-left" 
            style={{ backgroundImage: `url('/hero_villa.jpg')` }}
          />
          {/* Photograph 4 - Bottom Right */}
          <div 
            className="absolute right-[20%] bottom-[10%] w-[140px] md:w-[180px] aspect-[4/3] bg-cover bg-center rounded-lg border border-white/15 opacity-[0.25] shadow-2xl rotate-[-6deg] float-polaroid-right" 
            style={{ backgroundImage: `url('/hero_river.jpg')` }}
          />
        </div>

        <div className="max-w-4xl mx-auto space-y-8 z-10 relative">
          {/* Creative Animated Pixela Text */}
          <div className="flex justify-center items-center space-x-3 md:space-x-5 select-none mb-4 md:mb-6">
            {["P", "I", "X", "E", "L", "A"].map((letter, index) => (
              <span
                key={index}
                className="animate-lens-focus inline-block text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] via-[#9b51e0] to-[#ff007f] animate-gradient-text hover:scale-125 hover:rotate-6 transition-all duration-300 cursor-default drop-shadow-[0_0_25px_rgba(0,242,254,0.55)]"
                style={{
                  animationDelay: `${index * 0.12}s`,
                  opacity: 0,
                }}
              >
                {letter}
              </span>
            ))}
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none uppercase select-none transition-all duration-700 hover:tracking-normal group cursor-default">
            Behind the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5885ff] via-[#ff5e95] to-[#ffaa5e] animate-gradient-text drop-shadow-[0_0_20px_rgba(255,94,149,0.2)]">Glass</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm md:text-base text-zinc-400 font-light leading-relaxed select-none">
            A collective of visual storytellers capturing the unseen rhythms of the city. 
            Precision technology meets raw artistic expression.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <NextLink
              href="/gallery"
              className="w-full sm:w-auto px-8 py-3 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center"
            >
              <span>View Portfolio</span>
            </NextLink>
            <NextLink
              href="/about"
              className="w-full sm:w-auto px-8 py-3 bg-transparent border border-white/20 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/5 hover:border-white transition-all flex items-center justify-center"
            >
              <span>Our Mission</span>
            </NextLink>
          </div>
        </div>
      </section>

      {/* 2. Flagship Event Spotlight: Shutter Stories */}
      <section className="relative py-24 bg-card/25 border-y border-border/40 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left side details */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
                Flagship Organized Event
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase">
                Shutter Stories <br />
                <span className="text-zinc-500 font-light text-2xl md:text-3xl lowercase italic">photography exhibition</span>
              </h2>

              <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed">
                For years, Pixela has covered tech fests, seminars, and sports fests. Now, we are proud to announce our <span className="text-white font-semibold">first-ever self-organized public photography exhibition</span>! Come witness polaroids, landscape stories, and bird profiles frozen in glass frames.
              </p>

              {/* Event card detail details */}
              <div className="space-y-4 bg-muted/30 border border-border/40 rounded-lg p-5">
                <div className="flex items-center space-x-3.5 text-zinc-300 text-sm">
                  <Calendar className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span>Friday, 11th September (10:00 AM Onwards)</span>
                </div>
                <div className="flex items-center space-x-3.5 text-zinc-300 text-sm">
                  <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span>Auditorium Hall, Oriental Campus, Bhopal</span>
                </div>
                <div className="flex items-center space-x-3.5 text-zinc-300 text-sm">
                  <Clock className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span>Inauguration Ceremony followed by Gallery Walk</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <a
                  href="https://forms.gle/ZB759a1cnmREZFYQA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-primary text-white font-bold uppercase tracking-wider text-xs hover:bg-primary/90 transition-all flex items-center justify-center space-x-2 rounded shadow-lg shadow-primary/10"
                >
                  <span>Register as Participant</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </a>
                
                <a
                  href="https://forms.gle/ZB759a1cnmREZFYQA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-transparent border border-white/20 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/5 hover:border-white transition-all flex items-center justify-center space-x-2 rounded"
                >
                  <span>Register as Audience</span>
                </a>
              </div>

              <div className="pt-3">
                <NextLink
                  href="/shutter-stories"
                  className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-white transition-colors"
                >
                  <span>View Exhibition Details & Schedule</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </NextLink>
              </div>
            </div>

            {/* Right side poster display */}
            <div className="lg:col-span-6 relative flex justify-center items-center h-[350px] sm:h-[450px]">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[2/3]">
                {/* Poster 1 (Retro Poster - Frontmost) */}
                <div className="absolute inset-0 bg-card border border-border/60 rounded-lg p-1.5 shadow-2xl rotate-[-4deg] hover:rotate-0 hover:z-30 hover:scale-105 transition-all duration-300 cursor-pointer z-20">
                  <div className="w-full h-full rounded-md overflow-hidden bg-center bg-zinc-900" style={{ backgroundImage: `url('/poster1.jpg')`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }} />
                </div>

                {/* Poster 2 (White Poster - Middle) */}
                <div className="absolute inset-0 bg-card border border-border/60 rounded-lg p-1.5 shadow-2xl rotate-[8deg] translate-x-6 translate-y-3 hover:rotate-0 hover:z-30 hover:scale-105 transition-all duration-300 cursor-pointer z-10">
                  <div className="w-full h-full rounded-md overflow-hidden bg-center bg-zinc-900" style={{ backgroundImage: `url('/poster2.jpg')`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }} />
                </div>

                {/* Poster 3 (Dark Frame Poster - Backmost) */}
                <div className="absolute inset-0 bg-card border border-border/60 rounded-lg p-1.5 shadow-2xl translate-x-[-16px] translate-y-[12px] rotate-[-12deg] hover:rotate-0 hover:z-30 hover:scale-105 transition-all duration-300 cursor-pointer z-0 opacity-80">
                  <div className="w-full h-full rounded-md overflow-hidden bg-center bg-zinc-900" style={{ backgroundImage: `url('/poster3.jpg')`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }} />
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 3. Artistic Vision meets Technical Mastery */}
      <section className="relative py-24 px-4 border-b border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column - Core DNA */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-3">
                <span className="text-[9px] font-bold text-primary tracking-widest uppercase bg-primary/10 border border-primary/20 px-2.5 py-1 rounded w-max block">
                  Our DNA
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase">
                  Artistic vision meets technical mastery.
                </h2>
                <p className="text-zinc-400 text-sm font-light leading-relaxed">
                  At Pixela, we believe photography is more than just capturing light; it's about the conscious decision of what to leave out. Our community is built on three core pillars that define every shutter click.
                </p>
              </div>

              {/* Pillars list */}
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="h-9 w-9 rounded border border-border/60 bg-muted/40 flex items-center justify-center text-primary shrink-0 mt-1">
                    <Camera className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white uppercase tracking-wider">Authentic Vision</h4>
                    <p className="text-zinc-400 text-xs font-light leading-relaxed">
                      Honest storytelling through unmanipulated, raw compositions that challenge the eye.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="h-9 w-9 rounded border border-border/60 bg-muted/40 flex items-center justify-center text-primary shrink-0 mt-1">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white uppercase tracking-wider">Technical Precision</h4>
                    <p className="text-zinc-450 text-xs font-light leading-relaxed">
                      Mastery over the glass. We push the boundaries of gear to achieve professional-grade results.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="h-9 w-9 rounded border border-border/60 bg-muted/40 flex items-center justify-center text-primary shrink-0 mt-1">
                    <Flame className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white uppercase tracking-wider">Shared Growth</h4>
                    <p className="text-zinc-450 text-xs font-light leading-relaxed">
                      A collaborative ecosystem where members mentor each other to refine their craft.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Large Camera Lens Image */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] rounded-lg border border-border/40 overflow-hidden bg-zinc-950 shadow-2xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center hover:scale-105 transition-transform duration-700" 
                  style={{ backgroundImage: `url('/hero_villa.jpg')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 4. Photowalks */}
      <section className="relative py-24 px-4 border-b border-border/40 studio-spotlight-subtle">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header Row */}
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                Photowalks
              </h2>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
            {/* Card 1 - MANUABHAN TEKRI */}
            <div className="bg-card/40 border border-border/65 rounded overflow-hidden group hover:border-white/20 transition-all flex flex-col h-full">
              <div className="relative aspect-[1.8/1] bg-zinc-900 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                  style={{ backgroundImage: `url('/photowalk1.jpg')` }}
                />
                <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-[9px] font-bold text-white px-2 py-0.5 rounded tracking-wide font-mono uppercase">
                  1st Place
                </span>
              </div>
              <div className="p-5 space-y-2 flex-grow">
                <h3 className="font-bold text-base text-white uppercase tracking-wider font-display">MANUABHAN TEKRI</h3>
                <p className="text-zinc-400 text-xs font-light leading-relaxed">
                  A scenic hilltop photowalk capturing the panoramic horizon of Bhopal, rocky terrains, and high-altitude perspective shots.
                </p>
              </div>
            </div>

            {/* Card 2 - ITH BHOPAL */}
            <div className="bg-card/40 border border-border/65 rounded overflow-hidden group hover:border-white/20 transition-all flex flex-col h-full">
              <div className="relative aspect-[1.8/1] bg-zinc-900 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                  style={{ backgroundImage: `url('/photowalk2.jpg')` }}
                />
                <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-[9px] font-bold text-white px-2 py-0.5 rounded tracking-wide font-mono uppercase">
                  2nd Place
                </span>
              </div>
              <div className="p-5 space-y-2 flex-grow">
                <h3 className="font-bold text-base text-white uppercase tracking-wider font-display">ITH BHOPAL</h3>
                <p className="text-zinc-400 text-xs font-light leading-relaxed">
                  Exploring the heritage architecture, historical pink corridors, and symmetrical stone stairs of Bhopal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Crew Photographs Grid */}
      <section className="relative py-24 px-4 border-b border-border/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
              Captured By <span className="pixela-gradient">Our Crew</span>
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto text-xs font-light">
              Discover visual entries from active members of Pixela, displaying dynamic settings and configurations.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-card animate-pulse border border-border/40" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPhotos.map((photo: any, index: number) => (
                <div
                  key={photo._id || index}
                  className="group relative overflow-hidden rounded bg-card border border-border/40 aspect-[4/3] cursor-pointer shadow-lg hover:border-white/10 transition-all duration-300"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-102 transition-transform duration-500"
                    style={{ backgroundImage: `url('${photo.imageUrl}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-85" />
                  
                  {/* Photo tag metadata */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-col justify-end text-left">
                    <span className="text-[9px] bg-zinc-900/80 text-zinc-300 px-2 py-0.5 rounded-sm w-max mb-1.5 font-medium tracking-wider uppercase font-mono border border-white/5">
                      {photo.category}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-tight">{photo.title}</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      By {photo.photographer?.name || 'Pixela Crew'} • {photo.camera || 'Sony'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-4">
            <NextLink
              href="/gallery"
              className="inline-flex items-center space-x-2 bg-card/60 hover:bg-muted border border-border/40 text-white font-bold py-2.5 px-6 rounded text-xs uppercase tracking-wider transition-all"
            >
              <span>View All Categories</span>
              <ChevronRight className="h-4 w-4 text-primary" />
            </NextLink>
          </div>
        </div>
      </section>

      {/* 6. Statistics Block */}
      <section className="relative py-16 bg-card/20 border-b border-border/40 px-4 text-center">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-1">
            <span className="text-4xl md:text-5xl font-black text-white">{stats.members}+</span>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Active Crew</p>
          </div>
          <div className="space-y-1">
            <span className="text-4xl md:text-5xl font-black text-white">{stats.eventsCovered}+</span>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Events Covered</p>
          </div>
          <div className="space-y-1">
            <span className="text-4xl md:text-5xl font-black text-white">{stats.photosApproved}+</span>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Exhibition Prints</p>
          </div>
          <div className="space-y-1">
            <span className="text-4xl md:text-5xl font-black text-white">{stats.workshops}+</span>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Workshops & walks</p>
          </div>
        </div>
      </section>

      {/* 7. Booking CTA Section */}
      <section className="relative py-24 px-4 text-center studio-spotlight">
        <div className="max-w-3xl mx-auto space-y-6 z-10 relative">
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase">
            Ready to sharpen your focus?
          </h2>
          <p className="text-zinc-400 text-xs md:text-sm max-w-lg mx-auto leading-relaxed font-light">
            Join over 200 photographers in our growing collective. Gain access to exclusive gear, professional workshops, studio space, and global exhibitions.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <NextLink
              href="/hire"
              className="w-full sm:w-auto px-8 py-3 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-zinc-200 transition-colors"
            >
              <span>Apply for Membership</span>
            </NextLink>
            <NextLink
              href="/assistant"
              className="w-full sm:w-auto px-8 py-3 bg-transparent border border-white/20 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/5 transition-all"
            >
              <span>Talk to Pixie AI</span>
            </NextLink>
          </div>
        </div>
      </section>
    </div>
  );
}

const MOCK_PHOTOS = [
  {
    title: 'Himalayan Ridge Horizon',
    category: 'Landscape',
    imageUrl: '/hero_mountain.jpg',
    photographer: { name: 'Pixela Crew' },
    camera: 'Nikon D750',
  },
  {
    title: 'Ghat Street Rhythms',
    category: 'Street',
    imageUrl: '/hero_street.jpg',
    photographer: { name: 'Pixela Crew' },
    camera: 'Sony A7 III',
  },
  {
    title: 'Flora & Camouflage',
    category: 'Macro & Nature',
    imageUrl: '/hero_nature.jpg',
    photographer: { name: 'Pixela Crew' },
    camera: 'Canon EOS R5',
  },
  {
    title: 'Holy Ganga Promenade',
    category: 'Travel',
    imageUrl: '/hero_river.jpg',
    photographer: { name: 'Pixela Crew' },
    camera: 'Fujifilm X-T4',
  },
  {
    title: 'Hillside Haven Estate',
    category: 'Architecture',
    imageUrl: '/hero_villa.jpg',
    photographer: { name: 'Pixela Crew' },
    camera: 'Sony A7R IV',
  },
  {
    title: 'Cosmic Trails',
    category: 'Night',
    imageUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&auto=format&fit=crop&q=80',
    photographer: { name: 'Rohan Mehra' },
    camera: 'Sony A7 III',
  },
  {
    title: 'Golden Hour Dunes',
    category: 'Nature',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    photographer: { name: 'Ishaan Sen' },
    camera: 'Sony A7 III',
  },
  {
    title: 'Forest Path Sunrise',
    category: 'Nature',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    photographer: { name: 'Ishaan Sen' },
    camera: 'Sony A7 III',
  }
];
