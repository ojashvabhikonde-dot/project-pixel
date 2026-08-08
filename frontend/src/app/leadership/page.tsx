'use client';

import React, { useState } from 'react';
import { Mail, Globe, Camera, Layers, Calendar, ChevronRight } from 'lucide-react';

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function LeadershipPage() {
  const [selectedYear, setSelectedYear] = useState('2025-2026');

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-20 bg-background">
      
      {/* 1. Page Header */}
      <div className="text-center space-y-4 pb-6 border-b border-border/30">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">
          Creative Directors
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase leading-none">
          Club Leadership
        </h1>
        <p className="max-w-xl mx-auto text-xs md:text-sm text-zinc-400 font-light leading-relaxed">
          Meet the minds behind the shutter. Our leaders direct workshops, build tech systems, manage bookings, and edit cinematics.
        </p>
      </div>

      {/* 2. Leaders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {LEADERS.map((leader, i) => (
          <div 
            key={i} 
            className="bg-card/25 border border-border/50 rounded overflow-hidden group hover:border-white/20 transition-all duration-300 shadow-xl relative flex flex-col justify-between"
          >
            {/* Image section with relative hover gradient overlay */}
            <div className="relative aspect-[4/5] bg-zinc-950 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-102 transition-transform duration-500" 
                style={{ backgroundImage: `url('${leader.photo}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            </div>

            {/* Content info */}
            <div className="p-5 space-y-4 z-10 text-left">
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest font-mono block mb-1">
                  {leader.role}
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{leader.name}</h3>
                {(leader.dept || leader.semester) && (
                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                    {leader.dept}
                    {leader.dept && leader.semester ? ' • ' : ''}
                    {leader.semester ? `${leader.semester} Sem` : ''}
                  </p>
                )}
              </div>

              {/* Skills tags */}
              <div className="flex flex-wrap gap-1">
                {leader.skills.map((skill, k) => (
                  <span key={k} className="text-[9px] bg-zinc-900/60 text-zinc-400 px-2 py-0.5 rounded-full border border-white/5 font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Social linkages */}
            <div className="px-5 pb-5 pt-3 flex items-center space-x-4 border-t border-border/40 text-zinc-500">
              <a href={leader.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              {leader.instagram && leader.instagram !== '#' && (
                <a href={leader.instagram} target="_blank" rel="noreferrer" className="hover:text-[#ff5e95] transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              <a href={`mailto:${leader.email}`} className="hover:text-white transition-colors">
                <Mail className="h-4 w-4" />
              </a>
              <a href={leader.portfolio} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* 2.5 Active Crew Section */}
      <section className="space-y-8 border-t border-border/30 pt-16">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">
            Active Members
          </span>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            The Pixela Crew
          </h2>
          <p className="text-zinc-500 text-xs font-light">
            Talented visual creators and technicians driving our everyday captures.
          </p>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent snap-x snap-mandatory">
          {CREW_MEMBERS.map((member, i) => (
            <div 
              key={i} 
              className="flex-shrink-0 w-[150px] bg-card/25 border border-border/50 rounded p-4 text-center group hover:border-white/20 transition-all duration-300 flex flex-col justify-between shadow-lg snap-start"
            >
              <div className="relative aspect-square w-full rounded overflow-hidden bg-zinc-950 mb-3">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                  style={{ backgroundImage: `url('${member.photo}')` }}
                />
              </div>
              <div>
                <span className="text-[8px] font-bold text-primary uppercase tracking-wider font-mono block">
                  {member.specialization}
                </span>
                <h4 className="text-xs font-bold text-white mt-1 truncate">{member.name}</h4>
                <p className="text-[8px] text-zinc-500 font-mono mt-0.5">{member.dept} • {member.semester} Sem</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Ex Leaders & Alumni Grid with Timeline Switcher */}
      <div className="space-y-8 bg-card/25 border border-border/50 rounded p-6 sm:p-10 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full pixela-gradient-bg opacity-5 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-border/30">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Club Alumni</h2>
            <p className="text-xs text-zinc-500 font-light">
              Filtering ex-leaders who established Pixela's foundation.
            </p>
          </div>

          {/* Timeline filter switch */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['2025-2026', '2024-2025', '2023-2024'].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`text-[9px] font-bold uppercase tracking-wider px-5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                  selectedYear === year 
                    ? 'bg-[#dce4ec] text-[#080707]' 
                    : 'bg-zinc-900/60 border border-border/40 text-zinc-500 hover:text-white hover:border-white/10'
                }`}
              >
                {year} Tenure
              </button>
            ))}
          </div>
        </div>

        {/* Display filtered alumni */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {ALUMNI[selectedYear]?.map((alumnus, i) => (
            <div key={i} className="bg-card/20 border border-border/40 rounded p-5 flex gap-5 items-start relative overflow-hidden">
              <div 
                className="h-16 w-16 rounded bg-zinc-900 shrink-0 overflow-hidden bg-cover bg-center border border-border/50"
                style={{ backgroundImage: `url('${alumnus.photo}')` }}
              />
              <div className="space-y-3 flex-1">
                <div>
                  <h4 className="font-bold text-white text-sm">{alumnus.name}</h4>
                  <p className="text-[9px] text-primary font-bold uppercase tracking-widest font-mono mt-0.5">{alumnus.role}</p>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  <span className="text-white font-medium">Contribution:</span> {alumnus.contribution}
                </p>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-border/30 pt-3 mt-1">
                  <span>Now: {alumnus.currentProfession}</span>
                  <a href={alumnus.linkedin} target="_blank" rel="noreferrer" className="flex items-center text-primary hover:text-white transition-colors">
                    <Linkedin className="h-3.5 w-3.5 mr-1" /> LinkedIn
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

interface Leader {
  name: string;
  role: string;
  dept?: string;
  semester?: number;
  photo: string;
  bio: string;
  skills: string[];
  email: string;
  linkedin: string;
  instagram?: string;
  portfolio: string;
}

// Mock leaders array matching roles requested
const LEADERS: Leader[] = [
  {
    name: 'Sarthak Gargav',
    role: 'Prime',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    bio: 'Oversees overall club operations, sets equipment standards, and directs visual aftermovies for prime college events.',
    skills: ['Cinematography', 'DaVinci Resolve', 'Direction'],
    email: 'sarthak@pixela.club',
    linkedin: '#',
    portfolio: '#',
  },
  {
    name: 'Anugya Jha',
    role: 'Co Prime',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    bio: 'Curates photography guidelines, hosts campus photowalks, and supervises exhibition curation entries.',
    skills: ['Portraiture', 'Lightroom Classic', 'Curation'],
    email: 'anugyajha0411@gmail.com',
    linkedin: 'https://www.linkedin.com/in/anugya-jha-ba4a02342',
    instagram: 'https://www.instagram.com/anugyajhaaaa',
    portfolio: '#',
  },
  {
    name: 'Ojashva Bhikonde',
    role: 'Chief',
    photo: '/ojashva.jpg',
    bio: 'Directs full-stack web architectures, Pixie AI integration, and automates real-time event booking alerts.',
    skills: ['Photographer', 'Tech Guy', 'Event Planner'],
    email: 'ojashva.bhikonde@gmail.com',
    linkedin: 'https://www.linkedin.com/in/ojashva-bhikonde-947a48331',
    instagram: 'https://www.instagram.com/mr_ojashva?igsh=emwwdGl4M2Nxd21u',
    portfolio: 'https://portfolio-ojashva.vercel.app/',
  }
];

const CREW_MEMBERS = [
  {
    name: 'Piyush Sen',
    specialization: 'Lead Cinematographer',
    dept: 'IT',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Karan Verma',
    specialization: 'Street Photo',
    dept: 'CSE',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Riya Sharma',
    specialization: 'Portrait Specialist',
    dept: 'ECE',
    semester: 4,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Harsh Patidar',
    specialization: 'Creative Editor',
    dept: 'EX',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Divya Gupta',
    specialization: 'Event Coordinator',
    dept: 'IT',
    semester: 4,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Mayank Soni',
    specialization: 'Landscape & Drone',
    dept: 'ME',
    semester: 8,
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Amit Saxena',
    specialization: 'Astro Photography',
    dept: 'CSE',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sneha Patel',
    specialization: 'Wildlife Specialist',
    dept: 'ECE',
    semester: 4,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Rahul Nair',
    specialization: 'Macro & Close-up',
    dept: 'IT',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Priya Das',
    specialization: 'Fashion Lead',
    dept: 'CSE',
    semester: 8,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Rohit Joshi',
    specialization: 'Sports Coverage',
    dept: 'ME',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ananya Rao',
    specialization: 'Event Manager',
    dept: 'ECE',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Vivek Singh',
    specialization: 'Cinematic Colorist',
    dept: 'IT',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Kavya Mishra',
    specialization: 'Studio Lighting',
    dept: 'EX',
    semester: 4,
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Siddharth Shah',
    specialization: 'Drone Specialist',
    dept: 'CE',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tanvi Joshi',
    specialization: 'Product Shoot',
    dept: 'CSE',
    semester: 4,
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Yash Vyas',
    specialization: 'Storyteller & PR',
    dept: 'IT',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ritu Agrawal',
    specialization: 'Fine Art Photo',
    dept: 'ECE',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Naman Gupta',
    specialization: 'Action & Sports',
    dept: 'ME',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Shalini Dubey',
    specialization: 'Fashion & Studio',
    dept: 'EX',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Kunal Sen',
    specialization: 'Architectural Shoot',
    dept: 'CE',
    semester: 8,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Megha Jain',
    specialization: 'Documentary Lead',
    dept: 'IT',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Aditya Sharma',
    specialization: 'Visual Director',
    dept: 'CSE',
    semester: 6,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Shruti Pandey',
    specialization: 'Exhibition Curation',
    dept: 'ECE',
    semester: 4,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ayush Saxena',
    specialization: 'Post Processing',
    dept: 'ME',
    semester: 8,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
  }
];

// Mock Alumni timelines matching years
const ALUMNI: Record<string, any[]> = {
  '2025-2026': [
    {
      name: 'Dev Bhagat',
      role: 'Ex Prime',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      contribution: 'Led overall club expansions and hosted Bhopal heritage photowalk exhibitions.',
      currentProfession: 'Senior Media Director',
      linkedin: '#'
    },
    {
      name: 'Vaishnavi Shukla',
      role: 'Ex Co Prime',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      contribution: 'Directed lighting workshops and color grading portfolios for active members.',
      currentProfession: 'Independent Cinematographer',
      linkedin: '#'
    },
    {
      name: 'Anshul Kushvaha',
      role: 'Ex Chief',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      contribution: 'Automated club registration portals and integrated Pixie AI assistant systems.',
      currentProfession: 'Lead Web Engineer',
      linkedin: '#'
    },
    {
      name: 'Devarshish Jumle',
      role: 'Ex Chief',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      contribution: 'Managed live event coverage systems and college booking pipelines.',
      currentProfession: 'Cloud Consultant',
      linkedin: '#'
    }
  ],
  '2024-2025': [
    {
      name: 'Mayank Kothari',
      role: 'Ex President',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      contribution: 'Organized the initial three photo walks and set up equipment inventory standards.',
      currentProfession: 'Photographer at Pixel Studio',
      linkedin: '#'
    },
    {
      name: 'Aditi Jain',
      role: 'Ex Creative Head',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      contribution: 'Designed branding logo specifications and posters for campus events.',
      currentProfession: 'UI Designer at Vercel',
      linkedin: '#'
    }
  ],
  '2023-2024': [
    {
      name: 'Kabir Dev',
      role: 'Ex Tech Head',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      contribution: 'Launched the first v1.0 portfolio page and automated member registrations.',
      currentProfession: 'Backend Engineer at Stripe',
      linkedin: '#'
    }
  ]
};
