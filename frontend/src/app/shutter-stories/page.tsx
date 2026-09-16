'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Clock, 
  Camera, 
  Trophy, 
  Award, 
  BookOpen, 
  Users, 
  Image as ImageIcon, 
  Sparkles,
  Medal,
  Star,
  Flame,
  ZoomIn,
  X,
  Heart,
  Eye,
  CheckCircle2
} from 'lucide-react';

interface ExhibitionFrame {
  id: string;
  title: string;
  category: 'portraits' | 'nature' | 'street' | 'campus' | 'abstract';
  photographer: string;
  story: string;
  image: string;
  focalLength: string;
  aperture: string;
  shutter: string;
  iso: string;
  likes: number;
}

const EXHIBITION_FRAMES: ExhibitionFrame[] = [
  {
    id: 'frame-1',
    title: 'Fishermen through the Nets',
    category: 'nature',
    photographer: 'Aritra Bhattacharya (1st Place Grand Champion)',
    story: 'Captured amidst the waters, framing the calm routine of fishermen through the circular weave of fishing nets.',
    image: '/shutter_stories_winner_1.jpg',
    focalLength: '24mm',
    aperture: 'f/4.0',
    shutter: '1/800s',
    iso: '100',
    likes: 142
  },
  {
    id: 'frame-2',
    title: 'Embrace of Resilience',
    category: 'street',
    photographer: 'Atishay Jain (2nd Place Winner)',
    story: 'A deeply moving monochrome street portrait capturing maternal strength and raw familial bonds.',
    image: '/shutter_stories_winner_2_atishay.jpg',
    focalLength: '50mm',
    aperture: 'f/2.0',
    shutter: '1/400s',
    iso: '200',
    likes: 218
  },
  {
    id: 'frame-3',
    title: 'Sparkles of Wonder',
    category: 'portraits',
    photographer: 'Nayan Anand (2nd Place Winner)',
    story: 'An emotional night frame capturing a father and child gazing up at golden fireworks exploding in the dark sky.',
    image: '/shutter_stories_winner_2_nayan.jpg',
    focalLength: '50mm',
    aperture: 'f/1.8',
    shutter: '1/60s',
    iso: '800',
    likes: 215
  },
  {
    id: 'frame-4',
    title: 'Golden Rays of Heritage',
    category: 'campus',
    photographer: 'Ayush Malviya (3rd Place Winner)',
    story: 'Golden afternoon sunbeams slicing through historic domed arches, illuminating the weathered corridor textures.',
    image: '/shutter_stories_winner_3_ayush.jpg',
    focalLength: '18mm',
    aperture: 'f/5.6',
    shutter: '1/320s',
    iso: '100',
    likes: 198
  },
  {
    id: 'frame-5',
    title: 'Azure Solitude at Riverbank',
    category: 'nature',
    photographer: 'Exhibition Curated Selection',
    story: 'Long-exposure reflection capturing peaceful tranquility under clear midday skies.',
    image: '/hero_river.jpg',
    focalLength: '16mm',
    aperture: 'f/8.0',
    shutter: '1/60s',
    iso: '100',
    likes: 134
  },
  {
    id: 'frame-6',
    title: 'Geometry in Modern Architecture',
    category: 'abstract',
    photographer: 'Exhibition Curated Selection',
    story: 'Interplay of glass panels, sharp angles, and sky reflections creating an illusion of infinite height.',
    image: '/hero_villa.jpg',
    focalLength: '28mm',
    aperture: 'f/4.5',
    shutter: '1/500s',
    iso: '250',
    likes: 178
  },
  {
    id: 'frame-7',
    title: 'Emerald Flora in Macro Focus',
    category: 'nature',
    photographer: 'Exhibition Curated Selection',
    story: 'Microscopic dewdrop optics on morning foliage highlighting extreme sharpness and shallow depth.',
    image: '/hero_nature.jpg',
    focalLength: '90mm Macro',
    aperture: 'f/2.8',
    shutter: '1/320s',
    iso: '200',
    likes: 195
  },
  {
    id: 'frame-8',
    title: 'Gaze Through the Lens',
    category: 'portraits',
    photographer: 'Exhibition Curated Selection',
    story: 'An expressive candid portrait reflecting raw emotion, natural eye lighting, and gentle background blur.',
    image: '/about_hero.png',
    focalLength: '85mm',
    aperture: 'f/1.4',
    shutter: '1/1000s',
    iso: '100',
    likes: 254
  }
];

export default function ShutterStoriesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedFrame, setSelectedFrame] = useState<ExhibitionFrame | null>(null);

  const filteredFrames = activeCategory === 'all' 
    ? EXHIBITION_FRAMES 
    : EXHIBITION_FRAMES.filter(f => f.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-24 bg-background text-zinc-300">
      
      {/* Back to Home & Status Navigation */}
      <div className="flex items-center justify-between border-b border-border/30 pb-4">
        <NextLink
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </NextLink>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono flex items-center gap-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Event Concluded • Exhibition Showcase
          </span>
        </div>
      </div>

      {/* 1. Header / Hero Section (Showcase Edition) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column - Poster Stack Showcase */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[340px] aspect-[2/3] group">
            {/* Background layered glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-[#ff5e95]/30 rounded-2xl blur-2xl opacity-50 group-hover:opacity-80 transition duration-500" />
            
            {/* Main Poster Container */}
            <div className="relative w-full h-full bg-card border border-border/60 rounded-xl p-2 shadow-2xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
              <div 
                className="w-full h-full rounded-lg overflow-hidden bg-center bg-zinc-900" 
                style={{ backgroundImage: `url('/poster1.jpg')`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-md p-3 rounded-lg border border-white/10 text-center">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">Official Edition Archive</span>
                <p className="text-xs font-bold text-white mt-0.5">Shutter Stories 2026</p>
                <p className="text-[9px] text-zinc-400">Auditorium Hall • Oriental Bhopal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Hero Showcase Details */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">
              Official Exhibition Recap & Gallery
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight uppercase">
              Shutter Stories <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#ff5e95] to-[#ffaa5e] font-light italic lowercase text-2xl md:text-3xl lg:text-4xl">
                photography exhibition 2026
              </span>
            </h1>
          </div>

          <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed">
            <strong className="text-white font-semibold">Shutter Stories 2026</strong> was the landmark first self-organized public photography exhibition by <strong className="text-white font-semibold">Pixela Photography Club</strong>. Hundreds of visitors, student creators, and art enthusiasts joined us to celebrate the magic of visual storytelling.
          </p>

          {/* Key Milestones Stats Bar */}
          <div className="grid grid-cols-3 gap-3 bg-card/40 border border-border/50 rounded-xl p-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-black text-white font-mono">120+</p>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Curated Prints</p>
            </div>
            <div className="space-y-1 border-x border-border/40">
              <p className="text-2xl font-black text-primary font-mono">600+</p>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Attendees & Walkers</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-[#ffaa5e] font-mono">450+</p>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Submissions Received</p>
            </div>
          </div>

          {/* Event Conclusion Alert Pill */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-3.5 flex items-start space-x-3 text-emerald-300 text-xs">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-200">Event Successfully Concluded</p>
              <p className="text-emerald-400/80 text-[11px] mt-0.5 leading-relaxed">
                Thank you to all participants, judges, and visitors for making this exhibition unforgettable. Registrations are closed, and you can now explore the exhibition frames and upcoming winners below!
              </p>
            </div>
          </div>

          {/* Quick Jump Buttons */}
          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <a
              href="#exhibition-frames"
              className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-zinc-200 transition-all flex items-center justify-center space-x-2 rounded shadow-lg shadow-white/5 cursor-pointer"
            >
              <ImageIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Explore Exhibition Frames</span>
            </a>
            
            <a
              href="#winners-hall-of-fame"
              className="px-6 py-3 bg-primary/20 border border-primary/40 text-primary font-bold uppercase tracking-wider text-xs hover:bg-primary/30 transition-all flex items-center justify-center space-x-2 rounded cursor-pointer"
            >
              <Trophy className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>Winners & Hall of Fame</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Winners & Hall of Fame Section (Dedicated Feature Slot) */}
      <section id="winners-hall-of-fame" className="border-t border-border/30 pt-16 space-y-12 text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-primary">
              <Trophy className="h-5 w-5 text-[#ffaa5e]" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">
                Hall of Fame • Shutter Stories 2026
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Exhibition Winners & Awards
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm font-light">
              Honoring the visionary visual creators and winning photographs selected by our expert jury.
            </p>
          </div>

          <div className="shrink-0">
            <span className="text-[10px] font-mono bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-full text-zinc-400">
              Jury Evaluation Completed
            </span>
          </div>
        </div>

        {/* Podium Champions Display */}
        <div className="space-y-8">
          {/* Top: 1st Place / Grand Champion */}
          <div className="bg-gradient-to-r from-card/80 via-card/50 to-card/80 border-2 border-primary/60 rounded-2xl p-6 md:p-8 hover:border-primary transition-all relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Image Frame */}
              <div className="md:col-span-6 lg:col-span-5 h-72 md:h-80 w-full rounded-xl bg-zinc-950 border-2 border-primary/40 overflow-hidden relative group-hover:border-primary transition-colors shadow-2xl flex items-center justify-center p-2">
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-xl opacity-30 scale-110" 
                  style={{ backgroundImage: `url('/shutter_stories_winner_1.jpg')` }}
                />
                <img 
                  src="/shutter_stories_winner_1.jpg" 
                  alt="Fishermen through the Nets - Aritra Bhattacharya"
                  className="relative z-10 w-full h-full object-contain drop-shadow-2xl rounded"
                />
                <div className="absolute bottom-3 left-3 z-20">
                  <span className="text-[8px] bg-primary text-white font-bold uppercase px-2.5 py-1 rounded font-mono shadow-md backdrop-blur-md">
                    Grand Trophy • 1st Place
                  </span>
                </div>
              </div>

              {/* Champion Details */}
              <div className="md:col-span-6 lg:col-span-7 space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest font-mono px-3 py-1 rounded bg-primary/20 border border-primary/40 flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-primary" />
                    <span>Grand Champion (1st Place)</span>
                  </span>
                  <span className="text-3xl">👑</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider block">Winner</span>
                  <h3 className="text-2xl md:text-3xl font-black text-white">Aritra Bhattacharya</h3>
                  <p className="text-xs md:text-sm text-primary/90 font-medium">Frame: Fishermen through the Nets</p>
                  <p className="text-xs md:text-sm text-zinc-300 font-light leading-relaxed pt-1">
                    Congratulations to Aritra Bhattacharya for extraordinary visual depth, natural perspective framing, and capturing the authentic essence of river life.
                  </p>
                </div>

                <div className="pt-3 border-t border-primary/25 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-primary font-semibold">Grand Jury Award</span>
                  <span className="text-white font-bold bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">Gold Trophy + Certificate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: 2nd Place / Joint 1st Runners-Up (2 Winners) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-zinc-300">
              <Medal className="h-4 w-4 text-zinc-300" />
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest font-mono">
                Joint 1st Runners-Up • 2nd Position Winners
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* 2nd Place Winner A: Atishay Jain */}
              <div className="bg-card/40 border border-zinc-700/60 rounded-xl p-6 flex flex-col justify-between space-y-6 hover:border-white/40 transition-all relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 w-28 h-28 bg-zinc-400/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest font-mono px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 flex items-center gap-1.5">
                      <Medal className="h-3.5 w-3.5 text-zinc-300" />
                      <span>Joint 1st Runner-Up (2nd Place)</span>
                    </span>
                    <span className="text-xl">🥈</span>
                  </div>

                  {/* Photo Frame Container */}
                  <div className="h-72 w-full rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden relative group-hover:border-zinc-500 transition-colors shadow-md flex items-center justify-center p-2">
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-xl opacity-25 scale-110" 
                      style={{ backgroundImage: `url('/shutter_stories_winner_2_atishay.jpg')` }}
                    />
                    <img 
                      src="/shutter_stories_winner_2_atishay.jpg" 
                      alt="Embrace of Resilience - Atishay Jain"
                      className="relative z-10 w-full h-full object-contain drop-shadow-xl rounded"
                    />
                    <div className="absolute bottom-2 left-2 z-20">
                      <span className="text-[8px] bg-black/85 border border-white/10 text-zinc-300 font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                        Award: Human Interest & Documentary
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-wider block">Winner</span>
                    <h3 className="text-xl font-bold text-white">Atishay Jain</h3>
                    <p className="text-xs text-primary/90 font-medium">Frame: Embrace of Resilience</p>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed pt-1">
                      A deeply evocative monochrome documentary capture depicting maternal protection, innocence, and unspoken emotions on the streets.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Category: Street & Documentary</span>
                  <span className="text-white font-bold">Silver Trophy + Certificate</span>
                </div>
              </div>

              {/* 2nd Place Winner B: Nayan Anand */}
              <div className="bg-card/40 border border-zinc-700/60 rounded-xl p-6 flex flex-col justify-between space-y-6 hover:border-white/40 transition-all relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 w-28 h-28 bg-zinc-400/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest font-mono px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 flex items-center gap-1.5">
                      <Medal className="h-3.5 w-3.5 text-zinc-300" />
                      <span>Joint 1st Runner-Up (2nd Place)</span>
                    </span>
                    <span className="text-xl">🥈</span>
                  </div>

                  {/* Photo Frame Container */}
                  <div className="h-72 w-full rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden relative group-hover:border-zinc-500 transition-colors shadow-md flex items-center justify-center p-2">
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-xl opacity-25 scale-110" 
                      style={{ backgroundImage: `url('/shutter_stories_winner_2_nayan.jpg')` }}
                    />
                    <img 
                      src="/shutter_stories_winner_2_nayan.jpg" 
                      alt="Sparkles of Wonder - Nayan Anand"
                      className="relative z-10 w-full h-full object-contain drop-shadow-xl rounded"
                    />
                    <div className="absolute bottom-2 left-2 z-20">
                      <span className="text-[8px] bg-black/85 border border-white/10 text-zinc-300 font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                        Award: Night Emotion & Light
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-wider block">Winner</span>
                    <h3 className="text-xl font-bold text-white">Nayan Anand</h3>
                    <p className="text-xs text-primary/90 font-medium">Frame: Sparkles of Wonder</p>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed pt-1">
                      A poignant night documentary frame capturing innocent wonder and warmth as a father and child gaze at golden fireworks.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Category: Night Documentary</span>
                  <span className="text-white font-bold">Silver Trophy + Certificate</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3rd Place / Second Runner-Up */}
          <div className="bg-card/30 border border-[#ffaa5e]/30 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#ffaa5e]/60 transition-all relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffaa5e]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-full sm:w-64 h-64 sm:h-72 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden relative shrink-0 shadow-md flex items-center justify-center p-2">
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-xl opacity-25 scale-110" 
                  style={{ backgroundImage: `url('/shutter_stories_winner_3_ayush.jpg')` }}
                />
                <img 
                  src="/shutter_stories_winner_3_ayush.jpg" 
                  alt="Golden Rays of Heritage - Ayush Malviya"
                  className="relative z-10 w-full h-full object-contain drop-shadow-xl rounded"
                />
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-[#ffaa5e] uppercase tracking-widest font-mono px-2.5 py-1 rounded bg-[#ffaa5e]/15 border border-[#ffaa5e]/30 flex items-center gap-1.5">
                    <Medal className="h-3.5 w-3.5 text-[#ffaa5e]" />
                    <span>2nd Runner-Up (3rd Place)</span>
                  </span>
                  <span className="text-lg">🥉</span>
                </div>
                <h3 className="text-xl font-bold text-white">Ayush Malviya</h3>
                <p className="text-xs text-primary/90 font-medium">Frame: Golden Rays of Heritage</p>
                <p className="text-xs text-zinc-400 font-light max-w-xl">
                  An enchanting heritage perspective capturing afternoon sunbeams cutting through domed arches with warm golden radiance and weathered textures.
                </p>
              </div>
            </div>

            <div className="shrink-0 text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-border/30 text-[10px] font-mono space-y-1">
              <span className="text-zinc-500 block">Category: Heritage & Light</span>
              <span className="text-white font-bold block">Bronze Trophy + Certificate</span>
            </div>
          </div>
        </div>

        {/* Special Category Recognitions (Grid of 4) */}
        <div className="space-y-4 pt-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
            Special Category Honors & Recognitions
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '📸', category: 'Best Portraiture Frame', badge: 'Emotion & Light', color: 'text-primary' },
              { icon: '🏙️', category: 'Best Street & Documentary', badge: 'Authenticity', color: 'text-[#ff5e95]' },
              { icon: '🌄', category: 'Best Landscape Capture', badge: 'Dynamic Range', color: 'text-[#ffaa5e]' },
              { icon: '❤️', category: "People's Choice Award", badge: 'Public Favorite', color: 'text-emerald-400' },
            ].map((award, i) => (
              <div key={i} className="bg-card/20 border border-border/40 rounded-lg p-4 space-y-3 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{award.icon}</span>
                  <span className="text-[8px] font-mono uppercase bg-zinc-900 px-2 py-0.5 rounded border border-white/5 text-zinc-400">
                    {award.badge}
                  </span>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">{award.category}</h5>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">Winner Announcement Syncing...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Exhibition Gallery Showcase (Framed Prints Experience) */}
      <section id="exhibition-frames" className="border-t border-border/30 pt-16 space-y-10 text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">
              Curated Exhibition Gallery
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Featured Exhibition Prints
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm font-light">
              A curated virtual walk through standout frames and polaroids presented at Shutter Stories 2026.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Prints' },
              { id: 'nature', label: 'Nature & Landscape' },
              { id: 'street', label: 'Street & Life' },
              { id: 'campus', label: 'Campus & Heritage' },
              { id: 'portraits', label: 'Portraits' },
              { id: 'abstract', label: 'Abstract' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeCategory === tab.id
                    ? 'bg-white text-zinc-950 shadow-md font-bold'
                    : 'bg-zinc-900/60 border border-border/40 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exhibition Frame Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFrames.map((frame) => (
            <div
              key={frame.id}
              onClick={() => setSelectedFrame(frame)}
              className="bg-[#0b0a0a] border border-border/70 rounded-xl p-3 pb-4 space-y-3 shadow-xl hover:border-primary/50 transition-all duration-300 group cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
            >
              {/* Museum Matted Frame Container */}
              <div className="relative aspect-square w-full rounded-lg bg-zinc-950 overflow-hidden border border-white/10 flex items-center justify-center p-2">
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-md opacity-25 scale-110" 
                  style={{ backgroundImage: `url('${frame.image}')` }}
                />
                <img 
                  src={frame.image} 
                  alt={frame.title}
                  className="relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md rounded"
                />
                
                {/* Hover zoom icon & EXIF overlay */}
                <div className="absolute inset-0 z-20 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <span className="p-1.5 rounded-full bg-black/80 text-white backdrop-blur-sm">
                      <ZoomIn className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-300 bg-black/80 backdrop-blur-md p-2 rounded border border-white/10 flex justify-between items-center">
                    <span>{frame.focalLength}</span>
                    <span>{frame.aperture}</span>
                    <span>{frame.shutter}</span>
                    <span>ISO {frame.iso}</span>
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-primary font-bold">
                    {frame.category}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1">
                    <Heart className="h-2.5 w-2.5 text-[#ff5e95]" />
                    {frame.likes}
                  </span>
                </div>
                
                <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                  {frame.title}
                </h4>
                
                <p className="text-[10px] text-zinc-400 font-light line-clamp-2 leading-relaxed">
                  {frame.story}
                </p>
              </div>

              <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[8px] font-mono text-zinc-500">
                <span>Print ID: {frame.id}</span>
                <span className="text-zinc-400 font-semibold">Exhibited</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Event Highlights & Masterclasses Recap */}
      <section className="border-t border-border/30 pt-16 space-y-12 text-left">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">
            Exhibition Attractions
          </span>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            Workshops, Stalls & Moments
          </h2>
          <p className="text-zinc-400 text-sm font-light">
            Beyond the photograph frames, Shutter Stories 2026 brought hands-on creative learning to hundreds of students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-card/25 border border-border/40 rounded-xl p-6 space-y-4 hover:border-primary/40 transition-colors">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Free Creative Masterclasses</h3>
            <p className="text-zinc-400 text-xs font-light leading-relaxed">
              Participants attended interactive sessions on Animation, VFX pipelines, Graphic Designing, and advanced Color Grading in Lightroom.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-card/25 border border-border/40 rounded-xl p-6 space-y-4 hover:border-primary/40 transition-colors">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Creator Networking & Food Stalls</h3>
            <p className="text-zinc-400 text-xs font-light leading-relaxed">
              Bhopal creators, student cinematographers, and faculties mingled across food stalls, artist booths, and collaborative discussions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-card/25 border border-border/40 rounded-xl p-6 space-y-4 hover:border-primary/40 transition-colors">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Live Jury Critiques</h3>
            <p className="text-zinc-400 text-xs font-light leading-relaxed">
              Our esteemed faculty and industry jury walked through every print, delivering constructive live reviews on lighting and composition.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Closing Thank You Banner */}
      <section className="bg-gradient-to-b from-card/30 to-card/10 border border-border/40 rounded-2xl p-8 md:p-12 text-center space-y-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <span className="text-[9px] font-bold text-emerald-400 tracking-widest uppercase bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full w-max mx-auto block font-mono">
            Thank You Bhopal & Oriental
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-snug">
            Every Frame Has a Story. Every Story Deserves to Be Seen.
          </h2>
          <p className="text-zinc-400 text-sm font-light leading-relaxed">
            Shutter Stories 2026 was made possible by the passionate creators, volunteers, and visitors who believe in the art of the camera. Stay tuned for our upcoming photowalks and Shutter Stories 2027!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <NextLink
            href="/gallery"
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center space-x-2 rounded shadow-lg shadow-white/5"
          >
            <span>Explore Pixela Portfolio</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </NextLink>
          
          <NextLink
            href="/leadership"
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white/20 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/5 hover:border-white transition-all flex items-center justify-center space-x-2 rounded"
          >
            <span>Meet Pixela Crew</span>
          </NextLink>
        </div>
      </section>

      {/* 6. Lightbox Preview Modal for Framed Prints */}
      {selectedFrame && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setSelectedFrame(null)}
        >
          <div 
            className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative space-y-4 p-5 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedFrame(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-full transition-colors cursor-pointer border border-white/10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Image */}
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black border border-white/10">
              <img 
                src={selectedFrame.image} 
                alt={selectedFrame.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Details */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-primary font-bold">
                    {selectedFrame.category} • Shutter Stories 2026 Print
                  </span>
                  <h3 className="text-xl font-black text-white">{selectedFrame.title}</h3>
                </div>
                <div className="text-[10px] font-mono bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/10 text-zinc-300 flex items-center gap-3">
                  <span>{selectedFrame.focalLength}</span>
                  <span>{selectedFrame.aperture}</span>
                  <span>{selectedFrame.shutter}</span>
                  <span>ISO {selectedFrame.iso}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                {selectedFrame.story}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
