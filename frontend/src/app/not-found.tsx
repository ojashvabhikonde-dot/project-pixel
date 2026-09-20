'use client';

import React from 'react';
import NextLink from 'next/link';
import { Camera, Home, Image as ImageIcon, Users, Sparkles, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center relative overflow-hidden bg-background">
      {/* Background glow & aperture effect */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#ff5e95]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto space-y-8">
        {/* Shutter / Lens 404 Visual */}
        <div className="relative inline-block">
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-zinc-900/80 border border-zinc-700/60 backdrop-blur-xl flex items-center justify-center mx-auto shadow-2xl relative group">
            <Camera className="h-12 w-12 sm:h-14 sm:w-14 text-primary animate-pulse" />
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-primary text-black font-mono font-black text-xs rounded-md shadow-lg">
              404
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono block">
            Frame Not Found
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight leading-none">
            Lost In Focus
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
            The frame or page you are looking for has either been moved, archived, or is out of aperture range.
          </p>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <NextLink
            href="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-105"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </NextLink>

          <NextLink
            href="/gallery"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-card/60 hover:bg-card border border-border/60 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:border-white/30"
          >
            <ImageIcon className="h-4 w-4 text-primary" />
            <span>Explore Gallery</span>
          </NextLink>

          <NextLink
            href="/leadership"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-card/60 hover:bg-card border border-border/60 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:border-white/30"
          >
            <Users className="h-4 w-4 text-[#ff5e95]" />
            <span>Meet The Crew</span>
          </NextLink>
        </div>

        {/* Technical Status Footer */}
        <div className="pt-6 border-t border-border/20">
          <p className="text-[10px] text-zinc-600 font-mono">
            Error Code: 404 • Pixela Photography Club • Oriental Campus Bhopal
          </p>
        </div>
      </div>
    </div>
  );
}
