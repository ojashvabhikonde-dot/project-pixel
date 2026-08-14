'use client';

import React from 'react';
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
  MessageSquare, 
  Users, 
  Image, 
  Sparkles,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function ShutterStoriesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-20 bg-background text-zinc-300">
      
      {/* Back to Home Button */}
      <div>
        <NextLink
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </NextLink>
      </div>

      {/* 1. Header / Hero Section (2-Column Layout) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column - Main Poster */}
        <div className="lg:col-span-5 flex justify-center lg:sticky lg:top-24">
          <div className="relative w-full max-w-[360px] aspect-[2/3] bg-card border border-border/60 rounded-xl p-2 shadow-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
            <div 
              className="w-full h-full rounded-lg overflow-hidden bg-center bg-zinc-900" 
              style={{ backgroundImage: `url('/poster1.jpg')`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
            />
          </div>
        </div>

        {/* Right Column - Hero Details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">
              Flagship Photography Exhibition
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight uppercase">
              Shutter Stories <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#ff5e95] to-[#ffaa5e] font-light italic lowercase text-2xl md:text-3xl lg:text-4xl">
                photography exhibition 2026
              </span>
            </h1>
          </div>

          <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed">
            <strong className="text-white font-semibold">Shutter Stories 2026</strong> is the first-ever self-organized public photography exhibition by <strong className="text-white font-semibold">Pixela Photography Club</strong>, where every photograph tells a story through emotions, memories, people, places, and unforgettable moments.
          </p>

          {/* Quick Schedule/Location Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 border border-border/40 rounded-xl p-5">
            <div className="flex items-start space-x-3 text-sm">
              <Calendar className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-xs uppercase tracking-wider">Date</p>
                <p className="text-zinc-400 text-xs mt-0.5">Friday, 11th sep</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 text-sm">
              <MapPin className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-xs uppercase tracking-wider">Venue</p>
                <p className="text-zinc-400 text-xs mt-0.5">Auditorium Hall, Oriental Campus, Bhopal</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-sm">
              <Clock className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-xs uppercase tracking-wider">Timeline</p>
                <p className="text-zinc-400 text-xs mt-0.5">10:00 AM Onwards (Inauguration & Walk)</p>
              </div>
            </div>
          </div>

          {/* Registration CTAs */}
          <div className="pt-2 flex flex-wrap gap-4 items-center">
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
        </div>
      </section>

      {/* 2. Why Should You Be a Part of Shutter Stories 2026? */}
      <section className="border-t border-border/30 pt-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            Why Should You Be a Part of Shutter Stories?
          </h2>
          <p className="text-zinc-400 text-sm font-light">
            This is not just an exhibition—it's a celebration of creativity, storytelling, learning, and connections.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Item 1 */}
          <div className="bg-card/30 border border-border/40 rounded-lg p-6 space-y-4 hover:border-primary/30 transition-colors">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Showcase Your Talent</h3>
            <ul className="text-zinc-450 text-xs font-light space-y-2 list-disc list-inside leading-relaxed">
              <li>Exhibit your best photographs before a wide audience.</li>
              <li>Get your work recognized by photography enthusiasts and professionals.</li>
            </ul>
          </div>

          {/* Item 2 */}
          <div className="bg-card/30 border border-border/40 rounded-lg p-6 space-y-4 hover:border-primary/30 transition-colors">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Win Exciting Prizes</h3>
            <ul className="text-zinc-450 text-xs font-light space-y-2 list-disc list-inside leading-relaxed">
              <li>Compete for Category-wise Awards & Prizes across different photography categories.</li>
              <li>Stand a chance to earn recognition for your creativity.</li>
            </ul>
          </div>

          {/* Item 3 */}
          <div className="bg-card/30 border border-border/40 rounded-lg p-6 space-y-4 hover:border-primary/30 transition-colors">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Receive Certificates</h3>
            <ul className="text-zinc-450 text-xs font-light space-y-2 list-disc list-inside leading-relaxed">
              <li>Participation Certificates for registered participants.</li>
              <li>Winner Certificates and special recognitions for outstanding entries.</li>
            </ul>
          </div>

          {/* Item 4 */}
          <div className="bg-card/30 border border-border/40 rounded-lg p-6 space-y-4 hover:border-primary/30 transition-colors">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Learn from Experts</h3>
            <ul className="text-zinc-450 text-xs font-light space-y-2 list-disc list-inside leading-relaxed">
              <li>Attend inspiring Speaker Sessions by experienced photographers and experts.</li>
              <li>Discover journeys, techniques, and career insights.</li>
            </ul>
          </div>

          {/* Item 5 */}
          <div className="bg-card/30 border border-border/40 rounded-lg p-6 space-y-4 hover:border-primary/30 transition-colors">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Get Expert Feedback</h3>
            <ul className="text-zinc-450 text-xs font-light space-y-2 list-disc list-inside leading-relaxed">
              <li>Interact with our respected Jury Members.</li>
              <li>Receive valuable suggestions to improve your photography skills.</li>
            </ul>
          </div>

          {/* Item 6 */}
          <div className="bg-card/30 border border-border/40 rounded-lg p-6 space-y-4 hover:border-primary/30 transition-colors">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Build Connections</h3>
            <ul className="text-zinc-450 text-xs font-light space-y-2 list-disc list-inside leading-relaxed">
              <li>Meet talented photographers, creators, and professionals.</li>
              <li>Expand your network, exchange ideas, and collaborate on future projects.</li>
            </ul>
          </div>

          {/* Item 7 */}
          <div className="bg-card/30 border border-border/40 rounded-lg p-6 space-y-4 hover:border-primary/30 transition-colors">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Image className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Inspiring Exhibition</h3>
            <ul className="text-zinc-450 text-xs font-light space-y-2 list-disc list-inside leading-relaxed">
              <li>Explore breathtaking photographs and stories behind every frame.</li>
              <li>Discover new perspectives, cultures, emotions, and moments.</li>
            </ul>
          </div>

          {/* Item 8 */}
          <div className="bg-card/30 border border-border/40 rounded-lg p-6 space-y-4 hover:border-primary/30 transition-colors">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Create Memories</h3>
            <ul className="text-zinc-450 text-xs font-light space-y-2 list-disc list-inside leading-relaxed">
              <li>Be part of Pixela's biggest photography celebration.</li>
              <li>Capture moments, make new friends, and gain deep creative inspiration.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Guidelines Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-border/30 pt-16 items-start">
        {/* Left Column - Heading */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            Before Filling Out The Form
          </h2>
          <p className="text-zinc-400 text-sm font-light">
            Please review these quick points to ensure your submission is valid.
          </p>
        </div>

        {/* Right Column - Checklist */}
        <div className="lg:col-span-8 bg-zinc-950/40 border border-border/40 rounded-xl p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3.5">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-light leading-relaxed">
                You are submitting <strong className="text-white font-medium">only your original photographs</strong>. Plagiarism will lead to immediate disqualification.
              </p>
            </div>

            <div className="flex items-start space-x-3.5">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-light leading-relaxed">
                Your submission follows the specified <strong className="text-white font-medium">size, format, and quality requirements</strong>.
              </p>
            </div>

            <div className="flex items-start space-x-3.5">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-light leading-relaxed">
                You have carefully read and agree to all <strong className="text-white font-medium">participant rules and guidelines</strong>.
              </p>
            </div>

            <div className="flex items-start space-x-3.5">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-light leading-relaxed">
                Submissions received <strong className="text-white font-medium">after the deadline will not be considered</strong> under any circumstances.
              </p>
            </div>
          </div>

          <p className="text-zinc-400 text-xs font-light italic border-t border-border/20 pt-4">
            Please fill in all the required details accurately. We look forward to witnessing your creativity and the stories you tell through your lens.
          </p>
        </div>
      </section>

      {/* 4. Footer CTA Block */}
      <section className="bg-card/25 border border-border/40 rounded-2xl p-8 md:p-12 text-center space-y-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <span className="text-[9px] font-bold text-primary tracking-widest uppercase bg-primary/10 border border-primary/20 px-2.5 py-1 rounded w-max mx-auto block">
            Photography Movement
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-snug">
            Don't Just Visit an Exhibition—Become a Part of It.
          </h2>
          <p className="text-zinc-450 text-sm font-light leading-relaxed">
            Whether you are exhibiting your work or coming to experience it, Shutter Stories promises an inspiring celebration of creativity, storytelling, and photography.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <a
            href="https://forms.gle/ZB759a1cnmREZFYQA"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center space-x-2 rounded shadow-lg shadow-white/5"
          >
            <span>Register as Participant</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </a>
          
          <a
            href="https://forms.gle/ZB759a1cnmREZFYQA"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white/20 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/5 hover:border-white transition-all flex items-center justify-center space-x-2 rounded"
          >
            <span>Register as Audience</span>
          </a>
        </div>

        <div className="pt-4 max-w-xl mx-auto border-t border-border/20 relative z-10">
          <p className="text-sm font-extrabold text-white tracking-wide uppercase italic">
            Every Frame Has a Story. Every Story Deserves to Be Seen.
          </p>
        </div>
      </section>

    </div>
  );
}
