'use client';

import React from 'react';
import NextLink from 'next/link';
import { ShieldCheck, Award, Heart, HelpCircle, Users, Target, BookOpen, Clock, MapPin, Calendar, Eye, Palette, ArrowRight, Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-24 bg-background">
      
      {/* 1. Hero / Page Header (Image 3) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Column - Pixela Brand Image */}
        <div className="lg:col-span-5">
          <div className="relative aspect-square rounded border border-border/40 overflow-hidden bg-zinc-950 shadow-2xl">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url('/about_hero.png')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">
              Since 2024
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-none uppercase">
              Behind the <span className="pixela-gradient">Glass</span>.
            </h1>
            <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed">
              Pixela is more than a photography club; it's a collective of visual storytellers dedicated to finding the art within the camera. We explore the intersection of light, technology, and human emotion through every frame.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex space-x-12 border-t border-border/30 pt-8">
            <div className="space-y-1">
              <span className="text-4xl font-black text-white">12K+</span>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold font-mono">Shots Photographed</p>
            </div>
            <div className="space-y-1">
              <span className="text-4xl font-black text-white">150+</span>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold font-mono">Global Artists</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Our Story Section (Image 3 middle style) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-border/30 pt-16">
        {/* Left column - Title & Polaroid Visual */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              Our Story
            </h2>
            <div className="h-0.5 w-12 bg-primary/80 rounded" />
          </div>

          <div className="relative block w-full max-w-[280px] bg-[#0c0b0b] border border-border/70 p-3 pb-6 shadow-2xl rounded-sm transition-all duration-500 hover:scale-103 hover:border-primary/45 group">
            <div className="aspect-square bg-zinc-950 overflow-hidden relative border border-white/5 mb-3">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105" 
                style={{ backgroundImage: `url('/photowalk2.jpg')` }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80" />
              
              {/* Technical camera setting badge overlay on hover */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] font-mono text-zinc-300 bg-black/75 backdrop-blur-md px-2 py-1 rounded border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>50mm</span>
                <span>f/2.8</span>
                <span>ISO 400</span>
              </div>
            </div>
            <div className="space-y-1 font-mono text-left">
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">HERITAGE PHOTOWALK</p>
              <p className="text-[8px] text-zinc-600">BHOPAL, IN • EST. 2024</p>
            </div>
          </div>
        </div>

        {/* Right column - Story + Pillars */}
        <div className="lg:col-span-8 space-y-12">
          <p className="text-zinc-400 text-sm font-light leading-relaxed">
            Four years ago, Pixela was founded by Ishu Yadav with a small group of students who shared a passion for photography and visual storytelling. What started as a handful of enthusiastic creators has grown into a thriving community of 70+ members united by creativity, curiosity, and a love for capturing moments.
            <br /><br />
            Today, Pixela plays an important role in documenting college life by covering campus events and preserving memories through photography and videography. The club also brings members together through photo walks, giving them opportunities to explore, learn, and improve their creative skills.
            <br /><br />
            More than just a photography club, Pixela is a community where creativity is encouraged, skills are nurtured, and every member is inspired to see the world through a unique perspective, one frame at a time.
          </p>

          {/* Perspective & Chromaticity cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="h-8 w-8 rounded bg-muted/40 border border-border/40 flex items-center justify-center text-primary">
                <Eye className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Perspective</h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                We prioritize unique angles and unconventional frames that challenge the viewer's expectations.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-8 w-8 rounded bg-muted/40 border border-border/40 flex items-center justify-center text-primary">
                <Palette className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Chromaticity</h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                Harnessing the power of light, color, and contrast to deliver artistic statements in modern digital workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Faculty Coordinators Section */}
      <section className="space-y-12 border-t border-border/30 pt-16">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              Faculty Coordinators
            </h2>
            <p className="text-zinc-500 text-xs font-light">
              Guiding minds behind the club's growth.
            </p>
          </div>
          <NextLink
            href="/leadership"
            className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center space-x-1.5 hover:opacity-85 transition-opacity"
          >
            <span>View student leads</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </NextLink>
        </div>

        {/* Coordinators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Faculty Coordinator 1 */}
          <div className="bg-card/25 border border-border/50 rounded overflow-hidden flex flex-col group shadow-2xl">
            <div className="relative aspect-[16/10] bg-zinc-950 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-102 transition-transform duration-500" 
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=80')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>
            <div className="p-6 space-y-3">
              <div>
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest font-mono">Faculty Coordinator</span>
                <h3 className="text-xl font-bold text-white"> prof.  Nida Qureshi </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Professor of Management  Department, OCM Bhopal</p>
              </div>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                "At Pixela, we bridge engineering and creative expression. Our goal is to nurture students' artistic skills alongside technical camera precision."
              </p>
              <div className="pt-2 flex items-center space-x-2 text-[10px] text-zinc-500 font-mono">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>neelesh_gupta@oriental.ac.in</span>
              </div>
            </div>
          </div>

          {/* Faculty Coordinator 2 */}
          <div className="bg-card/25 border border-border/50 rounded overflow-hidden flex flex-col group shadow-2xl">
            <div className="relative aspect-[16/10] bg-zinc-950 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-102 transition-transform duration-500" 
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>
            <div className="p-6 space-y-3">
              <div>
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest font-mono">Co-Coordinator</span>
                <h3 className="text-xl font-bold text-white">Prof. Sumit Vashishtha</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5"> Professor HOD of AIML Department, OIST Bhopal</p>
              </div>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                "Media and documentation are critical to any institution. We guide Pixela to capture the vibrant campus life and technical fests of Bhopal."
              </p>
              <div className="pt-2 flex items-center space-x-2 text-[10px] text-zinc-500 font-mono">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>shikha_it@oriental.ac.in</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
