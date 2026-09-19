'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Globe, Camera, Layers, Calendar, ChevronRight, Trash2, Plus, Users, ShieldAlert, Sparkles, UserPlus } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import { API_URL } from '@/config/api';

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

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const TwitterX = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const extractInstagramUrl = (member: any) => {
  if (member.instagramUrl && member.instagramUrl.trim()) return member.instagramUrl.trim();
  if (member.instagram && member.instagram !== '#' && member.instagram.trim()) return member.instagram.trim();
  if (Array.isArray(member.socialLinks)) {
    const ig = member.socialLinks.find((s: any) => s.platform === 'instagram' && s.url && s.url.trim());
    if (ig) return ig.url.trim();
  }
  return null;
};

const getInstagramHandle = (url: string | null, name: string) => {
  if (!url) return '';
  const clean = url
    .replace(/\/$/, '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .replace(/^@/, '')
    .split('?')[0];
  return clean ? `@${clean}` : '';
};

const extractSocialLinks = (member: any) => {
  const links: { platform: string; url: string }[] = [];
  const igUrl = extractInstagramUrl(member);
  if (igUrl && igUrl !== '#') {
    links.push({ platform: 'instagram', url: igUrl });
  }

  if (Array.isArray(member.socialLinks)) {
    member.socialLinks.forEach((s: any) => {
      if (s.url && s.url !== '#' && s.platform !== 'instagram' && links.length < 3) {
        links.push({ platform: s.platform, url: s.url });
      }
    });
  }

  // Check individual fields if not in socialLinks
  if (member.linkedinUrl || member.linkedin) {
    const url = member.linkedinUrl || member.linkedin;
    if (url && url !== '#' && !links.some(l => l.platform === 'linkedin') && links.length < 3) {
      links.push({ platform: 'linkedin', url });
    }
  }
  if (member.githubUrl || member.github) {
    const url = member.githubUrl || member.github;
    if (url && url !== '#' && !links.some(l => l.platform === 'github') && links.length < 3) {
      links.push({ platform: 'github', url });
    }
  }
  if (member.portfolioUrl || member.portfolio) {
    const url = member.portfolioUrl || member.portfolio;
    if (url && url !== '#' && !links.some(l => l.platform === 'portfolio') && links.length < 3) {
      links.push({ platform: 'portfolio', url });
    }
  }

  return links.slice(0, 3);
};

export default function LeadershipPage() {
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [crewMembers, setCrewMembers] = useState<any[]>([]);
  const [alumniMembers, setAlumniMembers] = useState<any[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: 'crew' | 'alumni' | 'faculty' } | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('pixela_token');
    const savedUser = localStorage.getItem('pixela_user');
    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));

    fetchLeadershipData();

    // Auto real-time sync polling every 5 seconds so new crew, faculty, and alumni appear instantly for all users
    const pollInterval = setInterval(() => {
      fetchLeadershipData(true);
    }, 5000);

    const onFocus = () => fetchLeadershipData(true);
    window.addEventListener('focus', onFocus);
    window.addEventListener('visibilitychange', onFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  const fetchLeadershipData = async (isBackgroundSync = false) => {
    if (!isBackgroundSync) setLoadingData(true);
    try {
      // 1. Fetch Crew Members
      const crewRes = await fetch(`${API_URL}/api/members?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (crewRes.ok) {
        const data = await crewRes.json();
        setCrewMembers(data || []);
      }

      // 2. Fetch Alumni Members
      const alumniRes = await fetch(`${API_URL}/api/alumni?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (alumniRes.ok) {
        const data = await alumniRes.json();
        setAlumniMembers(data || []);
      }

      // 3. Fetch Faculty Coordinators
      const facultyRes = await fetch(`${API_URL}/api/faculty?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (facultyRes.ok) {
        const data = await facultyRes.json();
        setFacultyMembers(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch leadership data:', err);
    } finally {
      if (!isBackgroundSync) setLoadingData(false);
    }
  };

  const isSuperAdmin = user?.email?.toLowerCase() === 'pixela@oriental.ac.in' || user?.role === 'admin';

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;

    if (type === 'crew') {
      setCrewMembers(prev => prev.filter(m => (m._id !== id && m.id !== id)));
    } else if (type === 'alumni') {
      setAlumniMembers(prev => prev.filter(m => (m._id !== id && m.id !== id)));
    } else if (type === 'faculty') {
      setFacultyMembers(prev => prev.filter(m => (m._id !== id && m.id !== id)));
    }
    setItemToDelete(null);

    try {
      if (token) {
        await fetch(`${API_URL}/api/members/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // Build dynamic merged alumni dataset grouped by tenure year
  const allTenureYears = Array.from(new Set([
    '2025-2026',
    '2024-2025',
    '2023-2024',
    ...alumniMembers.map(a => a.tenureYear).filter(Boolean)
  ]));

  const mergedAlumni: Record<string, any[]> = { ...ALUMNI };
  alumniMembers.forEach(alumnus => {
    const year = alumnus.tenureYear || '2025-2026';
    if (!mergedAlumni[year]) {
      mergedAlumni[year] = [];
    }
    // Prevent duplicate entries
    const alreadyExists = mergedAlumni[year].some(
      (item: any) => (item._id && item._id === alumnus._id) || item.name === alumnus.name
    );
    if (!alreadyExists) {
      mergedAlumni[year].push({
        _id: alumnus._id || alumnus.id,
        name: alumnus.name,
        role: alumnus.pastRole || alumnus.specialization || 'Ex Leader',
        photo: alumnus.avatarUrl || alumnus.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        currentProfession: alumnus.currentProfession || 'Visual Media Professional',
        department: alumnus.department,
        linkedin: alumnus.socialLinks?.find((s: any) => s.platform === 'linkedin')?.url || alumnus.linkedinUrl || '#',
        instagram: extractInstagramUrl(alumnus) || '#',
        socialLinks: extractSocialLinks(alumnus),
        isDynamic: true,
      });
    }
  });

  // Default Faculty Coordinator list merged with dynamic registrations
  const displayFaculty = facultyMembers.length > 0 ? facultyMembers : DEFAULT_FACULTY;

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-20 bg-background">
      
      {/* 1. Page Header */}
      <div className="text-center space-y-4 pb-6 border-b border-border/30">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">
          Creative Directors & Mentors
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase leading-none">
          Club Leadership
        </h1>
        <p className="max-w-xl mx-auto text-xs md:text-sm text-zinc-400 font-light leading-relaxed">
          Meet the creative directors, mentors, and technicians behind Pixela. Directing workshops, building tech systems, and curating exhibitions.
        </p>
      </div>

      {/* 2. Core Leaders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {LEADERS.map((leader, i) => (
          <div 
            key={i} 
            className="bg-card/25 border border-border/50 rounded overflow-hidden group hover:border-white/20 transition-all duration-300 shadow-xl relative flex flex-col justify-between"
          >
            {/* Image section with relative hover gradient overlay */}
            <div className="relative aspect-[4/5] bg-zinc-950 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover group-hover:scale-102 transition-transform duration-500" 
                style={{ 
                  backgroundImage: `url('${leader.photo}')`,
                  backgroundPosition: leader.photoPosition || 'center center'
                }}
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
              {leader.linkedin && leader.linkedin !== '#' && (
                <a href={leader.linkedin} target="_blank" rel="noreferrer" className="hover:text-[#0a66c2] transition-colors" title="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {leader.instagram && leader.instagram !== '#' && (
                <a href={leader.instagram} target="_blank" rel="noreferrer" className="hover:text-[#ff5e95] transition-colors" title="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {leader.email && leader.email !== '#' && (
                <a href={`mailto:${leader.email}`} className="hover:text-white transition-colors" title="Email">
                  <Mail className="h-4 w-4" />
                </a>
              )}
              {leader.portfolio && leader.portfolio !== '#' && (
                <a href={leader.portfolio} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors" title="Portfolio">
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 2.2 Faculty Coordinators & Mentors Section */}
      <section className="space-y-8 border-t border-border/30 pt-16 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">
              Academic Mentorship
            </span>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <span>Faculty Coordinators & Mentors</span>
              <span className="text-xs px-2.5 py-0.5 bg-primary/10 border border-primary/30 text-primary rounded-full font-mono font-bold">
                {displayFaculty.length}
              </span>
            </h2>
            <p className="text-zinc-500 text-xs font-light">
              Guiding faculty members and department liaisons shaping Pixela's institutional excellence.
            </p>
          </div>

          <button
            onClick={() => setIsLoginOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-border/60 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md self-start sm:self-auto"
          >
            <UserPlus className="h-3.5 w-3.5 text-primary" />
            <span>Register as Faculty</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayFaculty.map((fac, idx) => {
            const photoUrl = fac.avatarUrl || fac.photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80';
            const igUrl = extractInstagramUrl(fac);
            const igHandle = getInstagramHandle(igUrl, fac.name);
            const socialLinks = extractSocialLinks(fac);
            const isDynamic = !!(fac._id || fac.id);

            return (
              <div 
                key={fac._id || fac.id || idx}
                className="bg-card/30 border border-border/50 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                {/* Super Admin Delete Button */}
                {isSuperAdmin && isDynamic && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete({ id: fac._id || fac.id, name: fac.name, type: 'faculty' });
                    }}
                    className="absolute top-3 right-3 z-20 p-1.5 bg-red-950/90 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-md cursor-pointer border border-red-500/40 opacity-0 group-hover:opacity-100"
                    title={`Delete faculty profile of ${fac.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-zinc-950 border border-primary/30 shrink-0 shadow-md">
                      <img src={photoUrl} alt={fac.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono block">
                        {fac.designation || 'Faculty Coordinator'}
                      </span>
                      <h4 className="text-lg font-bold text-white uppercase tracking-tight">{fac.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">{fac.department || 'Oriental Group of Institutes'}</p>
                    </div>
                  </div>

                  {fac.bio && (
                    <p className="text-xs text-zinc-400 font-light leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-white/5">
                      "{fac.bio}"
                    </p>
                  )}
                </div>

                {/* Social Links Bar */}
                <div className="pt-4 mt-4 border-t border-border/30 flex items-center justify-between">
                  {igHandle ? (
                    <a
                      href={igUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-[#ff5e95] hover:underline font-mono flex items-center gap-1"
                    >
                      <Instagram className="h-3 w-3" />
                      <span>{igHandle}</span>
                    </a>
                  ) : (
                    <span className="text-[9px] font-mono text-zinc-500">Pixela Faculty</span>
                  )}

                  <div className="flex items-center gap-1.5">
                    {socialLinks.map((link, sIdx) => {
                      let iconEl = <Globe className="h-3.5 w-3.5 text-primary" />;
                      if (link.platform === 'instagram') iconEl = <Instagram className="h-3.5 w-3.5 text-[#ff5e95]" />;
                      if (link.platform === 'linkedin') iconEl = <Linkedin className="h-3.5 w-3.5 text-[#0a66c2]" />;
                      if (link.platform === 'github') iconEl = <Github className="h-3.5 w-3.5 text-zinc-200" />;
                      if (link.platform === 'twitter' || link.platform === 'x') iconEl = <TwitterX className="h-3.5 w-3.5 text-[#1da1f2]" />;
                      if (link.platform === 'youtube') iconEl = <YoutubeIcon className="h-3.5 w-3.5 text-[#ff0000]" />;

                      return (
                        <a
                          key={sIdx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/5 transition-all duration-200"
                          title={link.platform}
                        >
                          {iconEl}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2.5 Active Crew Section (Dynamic Crew List) */}
      <section className="space-y-8 border-t border-border/30 pt-16 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">
              Active Members
            </span>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <span>The Pixela Crew</span>
              <span className="text-xs px-2.5 py-0.5 bg-primary/10 border border-primary/30 text-primary rounded-full font-mono font-bold">
                {crewMembers.length}
              </span>
            </h2>
            <p className="text-zinc-500 text-xs font-light">
              Registered visual creators and technicians driving our everyday captures.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                <span>Super Admin: Delete Permissions Enabled</span>
              </span>
            )}
            <button
              onClick={() => setIsLoginOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Join as Crew</span>
            </button>
          </div>
        </div>

        {/* Dynamic Crew Display */}
        {loadingData ? (
          <div className="py-16 text-center text-zinc-500 font-mono text-xs animate-pulse">
            Loading active crew members...
          </div>
        ) : crewMembers.length === 0 ? (
          <div className="bg-card/20 border border-dashed border-border/60 rounded-xl p-12 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white uppercase tracking-tight">No Crew Members Registered Yet</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto font-light leading-relaxed">
                Register as an Active Crew Member with your profile photo and Instagram / social handles to be featured on this official roster.
              </p>
            </div>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              <span>Register Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {crewMembers.map((member, i) => {
              const photoUrl = member.avatarUrl || member.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
              const igUrl = extractInstagramUrl(member);
              const igHandle = getInstagramHandle(igUrl, member.name);
              const socialLinks = extractSocialLinks(member);

              return (
                <div 
                  key={member._id || member.id || i} 
                  className="bg-card/30 border border-border/50 rounded-xl p-3 text-center group hover:border-white/20 transition-all duration-300 flex flex-col justify-between shadow-lg relative overflow-hidden"
                >
                  {/* Super Admin Delete Button */}
                  {isSuperAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete({ id: member._id || member.id, name: member.name, type: 'crew' });
                      }}
                      className="absolute top-2 right-2 z-20 p-1.5 bg-red-950/90 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-md cursor-pointer border border-red-500/40 opacity-0 group-hover:opacity-100"
                      title={`Delete crew profile of ${member.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}

                  <div>
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-zinc-950 mb-2.5 border border-white/5">
                      <img 
                        src={photoUrl} 
                        alt={member.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    <div className="space-y-1">
                      {/* Instagram handle in place of specialization */}
                      {igHandle ? (
                        <a
                          href={igUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[9px] font-bold text-[#ff5e95] hover:underline font-mono block truncate flex items-center justify-center gap-1"
                          title={`Instagram: ${igHandle}`}
                        >
                          <Instagram className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{igHandle}</span>
                        </a>
                      ) : (
                        <span className="text-[8px] font-bold text-primary uppercase tracking-wider font-mono block truncate">
                          Pixela Crew
                        </span>
                      )}

                      <h4 className="text-xs font-bold text-white truncate" title={member.name}>{member.name}</h4>
                      
                      <p className="text-[8px] text-zinc-500 font-mono truncate">
                        {member.department || member.dept || 'General'}
                        {(member.department || member.dept) && (member.semester || member.year) ? ' • ' : ''}
                        {member.semester ? `${member.semester} Sem` : member.year || ''}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Crew Social Links Bar */}
                  <div className="pt-2 mt-2 border-t border-border/30 flex items-center justify-center gap-1.5">
                    {socialLinks.length > 0 ? (
                      socialLinks.map((link, idx) => {
                        let iconEl = <Globe className="h-3.5 w-3.5 text-primary" />;
                        let hoverClass = 'hover:text-primary';
                        if (link.platform === 'instagram') {
                          iconEl = <Instagram className="h-3.5 w-3.5 text-[#ff5e95]" />;
                          hoverClass = 'hover:border-[#ff5e95]/60';
                        } else if (link.platform === 'linkedin') {
                          iconEl = <Linkedin className="h-3.5 w-3.5 text-[#0a66c2]" />;
                          hoverClass = 'hover:border-[#0a66c2]/60';
                        } else if (link.platform === 'github') {
                          iconEl = <Github className="h-3.5 w-3.5 text-zinc-200" />;
                          hoverClass = 'hover:border-white/60';
                        } else if (link.platform === 'twitter' || link.platform === 'x') {
                          iconEl = <TwitterX className="h-3.5 w-3.5 text-[#1da1f2]" />;
                          hoverClass = 'hover:border-[#1da1f2]/60';
                        } else if (link.platform === 'youtube') {
                          iconEl = <YoutubeIcon className="h-3.5 w-3.5 text-[#ff0000]" />;
                          hoverClass = 'hover:border-[#ff0000]/60';
                        }

                        return (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`p-1 rounded-md bg-zinc-900/90 hover:bg-zinc-800 border border-white/5 ${hoverClass} transition-all duration-200 hover:scale-115 shadow-sm cursor-pointer`}
                            title={`Open ${link.platform.toUpperCase()} (${link.url})`}
                          >
                            {iconEl}
                          </a>
                        );
                      })
                    ) : (
                      <span className="text-[8px] font-mono text-zinc-600">Pixela Member</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-sm w-full space-y-5 text-white shadow-2xl text-left">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                <span>Delete {itemToDelete.type.toUpperCase()} Profile</span>
              </h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                As Super Admin, are you sure you want to delete <span className="font-semibold text-white">"{itemToDelete.name}"</span> from the official Pixela database? This action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteItem}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-lg shadow-red-900/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Ex Leaders & Alumni Grid with Timeline Switcher */}
      <div className="space-y-10 bg-card/25 border border-border/50 rounded-2xl p-6 sm:p-12 relative overflow-hidden text-left shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pixela-gradient-bg opacity-10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/30">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">
              Legacy & History
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">Club Alumni</h2>
              <span className="text-xs px-2.5 py-0.5 bg-primary/10 border border-primary/30 text-primary rounded-full font-mono font-bold">
                {mergedAlumni[selectedYear]?.length || 0} Members
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-light">
              Filtering ex-leaders who established Pixela's foundation and shaped its journey.
            </p>
          </div>

          {/* Timeline filter switch */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {allTenureYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  selectedYear === year 
                    ? 'bg-white text-zinc-950 shadow-md font-bold' 
                    : 'bg-zinc-900/60 border border-border/40 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                {year} Tenure
              </button>
            ))}
          </div>
        </div>

        {/* Display filtered alumni */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pt-2">
          {(mergedAlumni[selectedYear] || []).map((alumnus, i) => {
            const isDynamic = !!(alumnus._id || alumnus.isDynamic);
            const igUrl = alumnus.instagram && alumnus.instagram !== '#' ? alumnus.instagram : null;
            const igHandle = getInstagramHandle(igUrl, alumnus.name);

            return (
              <div key={alumnus._id || i} className="bg-card/30 border border-border/50 rounded-xl p-6 sm:p-7 flex flex-col sm:flex-row gap-6 items-center relative overflow-hidden group hover:border-white/20 transition-all duration-300 shadow-xl">
                {/* Super Admin Delete Button */}
                {isSuperAdmin && isDynamic && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete({ id: alumnus._id, name: alumnus.name, type: 'alumni' });
                    }}
                    className="absolute top-3 right-3 z-20 p-1.5 bg-red-950/90 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-md cursor-pointer border border-red-500/40 opacity-0 group-hover:opacity-100"
                    title={`Delete alumni profile of ${alumnus.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}

                <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-lg bg-zinc-950 shrink-0 overflow-hidden border border-white/10 shadow-md group-hover:scale-102 transition-transform duration-300 mx-auto sm:mx-0">
                  <div 
                    className="absolute inset-0 bg-cover bg-no-repeat"
                    style={{ 
                      backgroundImage: `url('${alumnus.photo}')`,
                      backgroundPosition: alumnus.photoPosition || 'center center',
                      backgroundSize: alumnus.photoSize || 'cover'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:hidden" />
                </div>
                <div className="space-y-3 flex-1 w-full">
                  <div>
                    <span className="text-[10px] sm:text-xs text-primary font-bold uppercase tracking-widest font-mono block">
                      {alumnus.role}
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">{alumnus.name}</h4>
                    {alumnus.department && (
                      <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{alumnus.department}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 border-t border-border/30 pt-3 mt-1">
                    <span className="font-mono text-[11px] sm:text-xs text-zinc-400">
                      <span className="text-zinc-500">Now:</span> {alumnus.currentProfession}
                    </span>
                    <div className="flex items-center space-x-3">
                      {igUrl && (
                        <a href={igUrl} target="_blank" rel="noreferrer" className="flex items-center text-xs font-semibold text-zinc-400 hover:text-[#ff5e95] transition-colors" title={`Instagram: ${igHandle || alumnus.name}`}>
                          <Instagram className="h-4 w-4 mr-1 text-[#ff5e95]" /> {igHandle || 'Insta'}
                        </a>
                      )}
                      {alumnus.linkedin && alumnus.linkedin !== '#' && (
                        <a href={alumnus.linkedin} target="_blank" rel="noreferrer" className="flex items-center text-xs font-semibold text-zinc-400 hover:text-[#0a66c2] transition-colors" title="LinkedIn">
                          <Linkedin className="h-4 w-4 mr-1 text-[#0a66c2]" /> LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Login Interceptor wrapper */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={(newToken, newUser) => {
          setToken(newToken);
          setUser(newUser);
          fetchLeadershipData();
        }}
      />

    </div>
  );
}

const DEFAULT_FACULTY = [
  {
    name: 'Dr. S. K. Gupta',
    designation: 'Senior Faculty Advisor & Mentor',
    department: 'Department of Computer Science & Engineering',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    bio: 'Guiding Pixela photography and cinematic club activities, institutional exhibitions, and visual storytelling excellence since 2022.',
    instagram: 'https://www.instagram.com/oriental_bhopal',
    socialLinks: [
      { platform: 'instagram', url: 'https://www.instagram.com/oriental_bhopal' },
      { platform: 'linkedin', url: 'https://www.linkedin.com' }
    ]
  }
];

interface Leader {
  name: string;
  role: string;
  dept?: string;
  semester?: number;
  photo: string;
  photoPosition?: string;
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
    photo: '/sarthak.jpg',
    photoPosition: 'center 15%',
    bio: 'Oversees overall club operations, sets equipment standards, and directs visual aftermovies for prime college events.',
    skills: ['Cinematography', 'Lightroom', 'Direction'],
    email: 'sarthakgargav3@gmail.com',
    linkedin: 'https://www.linkedin.com/in/sarthak-gargav-6a95a42b7?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    instagram: 'https://www.instagram.com/shuttterbugg_?igsh=MTQ1aXh4Z2I3eWd6Zw==',
    portfolio: '#',
  },
  {
    name: 'Anugya Jha',
    role: 'Co Prime',
    photo: '/anugya.jpg',
    photoPosition: 'center 18%',
    bio: 'Curates photography guidelines, hosts campus photowalks, and supervises exhibition curation entries.',
    skills: ['Portraiture', 'Social Media', 'Curation'],
    email: 'anugyajha0411@gmail.com',
    linkedin: 'https://www.linkedin.com/in/anugya-jha-ba4a02342',
    instagram: 'https://www.instagram.com/anugyajhaaaa',
    portfolio: '#',
  },
  {
    name: 'Ojashva Bhikonde',
    role: 'Chief',
    photo: '/ojashva.jpg',
    photoPosition: 'center 20%',
    bio: 'Directs full-stack web architectures, Pixie AI integration, and automates real-time event booking alerts.',
    skills: ['Photographer', 'Tech Guy', 'Event Planner'],
    email: 'ojashva.bhikonde@gmail.com',
    linkedin: 'https://www.linkedin.com/in/ojashva-bhikonde-947a48331',
    instagram: 'https://www.instagram.com/mr_ojashva?igsh=emwwdGl4M2Nxd21u',
    portfolio: 'https://portfolio-ojashva.vercel.app/',
  }
];

// Mock Alumni timelines matching years
const ALUMNI: Record<string, any[]> = {
  '2025-2026': [
    {
      name: 'Dev Bhagat',
      role: 'Ex Prime',
      photo: '/dev_bhagat.jpg',
      photoPosition: '47% 26%',
      photoSize: '260%',
      currentProfession: 'Senior Media Director',
      linkedin: 'https://www.linkedin.com/in/dev-bhagat-386a27281?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      instagram: 'https://www.instagram.com/sirffdev?igsh=MWJwbm9rejk3M3prNg=='
    },
    {
      name: 'Vaishnavi Shukla',
      role: 'Ex Co Prime',
      photo: '/vaishnavi_shukla.jpg',
      photoPosition: 'center 18%',
      currentProfession: 'Independent Cinematographer',
      linkedin: 'https://www.linkedin.com/in/vaishnavi-shukla-b623ab290?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      instagram: 'https://www.instagram.com/_thecurlylens_?igsh=MWNjZ2w2dDRrd21naA=='
    },
    {
      name: 'Anshul Kushwaha',
      role: 'Ex Chief',
      photo: '/anshul_kushwaha.jpg',
      photoPosition: '50% 28%',
      photoSize: '220%',
      currentProfession: 'Lead Web Engineer',
      linkedin: 'https://www.linkedin.com/in/anshul-kushwaha-771430295?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      instagram: 'https://www.instagram.com/_anshhulerror404_?igsh=MWczdXQ0MXJ2MTV0YQ=='
    },
    {
      name: 'Devashish Jumle',
      role: 'Ex Chief',
      photo: '/devashish_jumle.jpg',
      photoPosition: 'center 48%',
      photoSize: '240%',
      currentProfession: 'Cloud Consultant',
      linkedin: 'https://www.linkedin.com/in/devashish-j-2512a7216?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      instagram: 'https://www.instagram.com/theshutterbug_devashish?igsh=N2EybmJyNm44MWNw'
    },
    {
      name: 'Om Pachori',
      role: 'Ex Chief',
      photo: '/om_pachori.jpg',
      photoPosition: '50% 15%',
      photoSize: '160%',
      currentProfession: 'Visual Designer & Editor',
      linkedin: 'https://www.linkedin.com/in/om-pachori-b30b703b2?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      instagram: 'https://www.instagram.com/_ompachori?igsh=anlxb2E3aGlpeWZ2'
    },
    {
      name: 'Prem Raj',
      role: 'Ex Chief',
      photo: '/prem_raj.jpg',
      photoPosition: 'center 36%',
      photoSize: 'cover',
      currentProfession: 'Cinematographer & Media Specialist',
      linkedin: 'https://www.linkedin.com/in/maipremraj?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      instagram: 'https://www.instagram.com/mai.premraj?igsh=MWJ2MW50eGd5ZWo2bQ=='
    }
  ],
  '2024-2025': [
    {
      name: 'Shivansh Yadav',
      role: 'Ex Prime',
      photo: '/shivansh_yadav.jpg',
      photoPosition: '45% 22%',
      photoSize: '210%',
      currentProfession: 'Cinematographer & Creative Producer',
      linkedin: '#',
      instagram: 'https://www.instagram.com/theshivanshyadav?igsh=MW50cmR3Zm03OGQ2aQ=='
    },
    {
      name: 'Shrey Shrivastava',
      role: 'Ex Co Prime',
      photo: '/shrey_shrivastava.jpg',
      photoPosition: '50% 18%',
      photoSize: '200%',
      currentProfession: 'Visual Designer & Media Strategist',
      linkedin: '#',
      instagram: 'https://www.instagram.com/shrey.draft?igsh=MXV3a2FoMTVmbXh5Ng=='
    }
  ],
  '2023-2024': [
    {
      name: 'Ishu Yadav',
      role: 'Ex Prime',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      photoPosition: 'center center',
      currentProfession: 'Founder & Creative Director',
      linkedin: '#',
      instagram: '#'
    },
    {
      name: 'Gourav Choudhary',
      role: 'Ex Co Prime',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      photoPosition: 'center center',
      currentProfession: 'Media Consultant & Visual Artist',
      linkedin: '#',
      instagram: '#'
    }
  ]
};
