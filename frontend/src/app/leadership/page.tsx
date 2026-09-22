'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail, Globe, Camera, Layers, Calendar, ChevronRight, Trash2, Plus, Users,
  ShieldAlert, Sparkles, UserPlus, Check, X, Search, Star, Award, ShieldCheck,
  ExternalLink, SlidersHorizontal, ArrowRight, Eye, Briefcase, Zap, CheckCircle2,
  AlertCircle, FileText
} from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import { API_URL } from '@/config/api';
import { exportCrewMemberDossierPdf } from '@/utils/pdfExport';

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
  const [loadingData, setLoadingData] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: 'crew' | 'alumni' } | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Fast Approvals state for Super Admin
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [showApprovalDrawer, setShowApprovalDrawer] = useState(false);
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [processingMemberId, setProcessingMemberId] = useState<string | null>(null);
  const [approvalBannerMsg, setApprovalBannerMsg] = useState('');

  // Crew Track Record Dossier Modal state
  const [selectedCrewDossier, setSelectedCrewDossier] = useState<any | null>(null);

  // Search & Branch Filter state
  const [crewSearch, setCrewSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  useEffect(() => {
    const savedToken = localStorage.getItem('pixela_token');
    const savedUser = localStorage.getItem('pixela_user');
    if (savedToken) setToken(savedToken);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    }

    fetchLeadershipData();
    if (savedToken) {
      fetchPendingMembers(savedToken);
    }

    // Auto real-time sync polling every 5 seconds so new crew and approvals appear instantly
    const pollInterval = setInterval(() => {
      fetchLeadershipData(true);
      const currentToken = localStorage.getItem('pixela_token');
      if (currentToken) fetchPendingMembers(currentToken, true);
    }, 5000);

    const onFocus = () => {
      fetchLeadershipData(true);
      const currentToken = localStorage.getItem('pixela_token');
      if (currentToken) fetchPendingMembers(currentToken, true);
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('visibilitychange', onFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  const isSuperAdmin = user?.email?.toLowerCase() === 'pixela@oriental.ac.in' || user?.role === 'admin' || user?.role === 'president';

  const fetchLeadershipData = async (isBackgroundSync = false) => {
    if (!isBackgroundSync) setLoadingData(true);
    try {
      // 1. Fetch Crew Members with full track record telemetry
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
    } catch (err) {
      console.error('Failed to fetch leadership data:', err);
    } finally {
      if (!isBackgroundSync) setLoadingData(false);
    }
  };

  const fetchPendingMembers = async (authToken: string, isSilent = false) => {
    try {
      const res = await fetch(`${API_URL}/api/members/pending?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingMembers(data || []);
      }
    } catch (e) {
      if (!isSilent) console.warn('Failed to fetch pending requests:', e);
    }
  };

  // ⚡ Fast 1-Click Individual Approval (Optimistic UI)
  const handleInstantApprove = async (member: any) => {
    const memberId = member._id || member.id;
    setProcessingMemberId(memberId);

    // Optimistic UI updates
    setPendingMembers(prev => prev.filter(m => (m._id !== memberId && m.id !== memberId)));
    setCrewMembers(prev => {
      const exists = prev.some(m => (m._id === memberId || m.id === memberId));
      if (exists) {
        return prev.map(m => (m._id === memberId || m.id === memberId) ? { ...m, isApproved: true } : m);
      }
      return [{ ...member, isApproved: true, photosCount: member.photosCount || 0, badges: member.badges || ['Verified Crew'] }, ...prev];
    });

    setApprovalBannerMsg(`Approved ${member.name} to official crew roster!`);
    setTimeout(() => setApprovalBannerMsg(''), 3500);

    try {
      if (token) {
        await fetch(`${API_URL}/api/members/${memberId}/approve`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isApproved: true })
        });
        fetchLeadershipData(true);
      }
    } catch (err) {
      console.error('Error approving member:', err);
    } finally {
      setProcessingMemberId(null);
    }
  };

  // ⚡ Fast 1-Click Decline / Reject (Optimistic UI)
  const handleInstantDecline = async (member: any) => {
    const memberId = member._id || member.id;
    setProcessingMemberId(memberId);

    // Optimistic UI updates
    setPendingMembers(prev => prev.filter(m => (m._id !== memberId && m.id !== memberId)));
    setApprovalBannerMsg(`Declined request for ${member.name}.`);
    setTimeout(() => setApprovalBannerMsg(''), 3500);

    try {
      if (token) {
        await fetch(`${API_URL}/api/members/${memberId}/reject`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('Error declining member:', err);
    } finally {
      setProcessingMemberId(null);
    }
  };

  // ⚡ Fast 1-Click Mass / Bulk Approval (Optimistic UI)
  const handleInstantApproveAll = async () => {
    if (pendingMembers.length === 0) return;
    setIsApprovingAll(true);

    const pendingCopy = [...pendingMembers];
    // Optimistically approve all
    setPendingMembers([]);
    setCrewMembers(prev => {
      const newAdditions = pendingCopy.map(m => ({
        ...m,
        isApproved: true,
        photosCount: m.photosCount || 0,
        badges: m.badges || ['Verified Crew']
      }));
      return [...newAdditions, ...prev];
    });

    setApprovalBannerMsg(`⚡ Successfully approved all ${pendingCopy.length} crew applicants!`);
    setTimeout(() => setApprovalBannerMsg(''), 4000);

    try {
      if (token) {
        await fetch(`${API_URL}/api/members/bulk-approve`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({})
        });
        fetchLeadershipData(true);
      }
    } catch (err) {
      console.error('Bulk approval failed:', err);
    } finally {
      setIsApprovingAll(false);
      setShowApprovalDrawer(false);
    }
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;

    if (type === 'crew') {
      setCrewMembers(prev => prev.filter(m => (m._id !== id && m.id !== id)));
    } else if (type === 'alumni') {
      setAlumniMembers(prev => prev.filter(m => (m._id !== id && m.id !== id)));
    }
    if (selectedCrewDossier?._id === id || selectedCrewDossier?.id === id) {
      setSelectedCrewDossier(null);
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

  // Unique departments for filter pills
  const departmentsList = ['All', ...Array.from(new Set(crewMembers.map(m => m.department || m.dept).filter(Boolean)))];

  // Filtered Crew List based on search & department
  const filteredCrew = crewMembers.filter(member => {
    const query = crewSearch.toLowerCase().trim();
    const dept = (member.department || member.dept || '').toLowerCase();
    const name = (member.name || '').toLowerCase();
    const spec = (member.specialization || '').toLowerCase();
    const skills = Array.isArray(member.skills) ? member.skills.join(' ').toLowerCase() : '';
    const badges = Array.isArray(member.badges) ? member.badges.join(' ').toLowerCase() : '';

    const matchesSearch = !query || name.includes(query) || dept.includes(query) || spec.includes(query) || skills.includes(query) || badges.includes(query);
    const matchesDept = selectedDeptFilter === 'All' || (member.department || member.dept) === selectedDeptFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-20 bg-background relative">

      {/* Super Admin Live Feedback Toast */}
      {approvalBannerMsg && (
        <div className="fixed top-20 right-6 z-[90] bg-zinc-950 border border-green-500/50 text-green-400 p-4 rounded-xl shadow-2xl flex items-center space-x-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          <span>{approvalBannerMsg}</span>
        </div>
      )}

      {/* Super Admin Quick-Approval Floating Alert Bar */}
      {isSuperAdmin && pendingMembers.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 animate-pulse">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
                  Fast-Track Admin Action
                </span>
                <span className="text-xs font-black text-amber-400 font-mono">
                  {pendingMembers.length} Request{pendingMembers.length > 1 ? 's' : ''} Pending
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-light mt-0.5">
                Applicants are waiting for roster approval to appear on the official leadership page.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setShowApprovalDrawer(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5 text-zinc-400" />
              <span>Review Requests ({pendingMembers.length})</span>
            </button>

            <button
              onClick={handleInstantApproveAll}
              disabled={isApprovingAll}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>{isApprovingAll ? 'Approving...' : '⚡ 1-Click Approve All'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="text-center space-y-4 pb-6 border-b border-border/30">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">
          Creative Directors & Visual Roster
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase leading-none">
          Club Leadership
        </h1>
        <p className="max-w-xl mx-auto text-xs md:text-sm text-zinc-400 font-light leading-relaxed">
          Meet the minds behind the shutter. Our leaders direct workshops, build tech systems, manage bookings, and edit cinematics.
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

      {/* 2.5 Active Crew Section (Dynamic Crew List + Search + Track Record Dossier) */}
      <section className="space-y-8 border-t border-border/30 pt-16 text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">
              Active Members & Track Records
            </span>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <span>The Pixela Crew</span>
              <span className="text-xs px-2.5 py-0.5 bg-primary/10 border border-primary/30 text-primary rounded-full font-mono font-bold">
                {crewMembers.length} Active
              </span>
            </h2>
            <p className="text-zinc-500 text-xs font-light">
              Registered visual creators, technicians, and cinematographers. Click any card to inspect their complete track record & equipment dossier.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <button
                onClick={() => setShowApprovalDrawer(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-primary/15 border border-primary/40 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/25 transition-all cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Approvals Hub ({pendingMembers.length})</span>
              </button>
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

        {/* Search & Department Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
          <div className="relative flex-1 max-w-md">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search crew name, branch, skills, badges..."
              value={crewSearch}
              onChange={(e) => setCrewSearch(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary"
            />
          </div>

          {departmentsList.length > 1 && (
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {departmentsList.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDeptFilter(dept)}
                  className={`text-[10px] font-mono px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedDeptFilter === dept
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Crew Grid Display */}
        {loadingData ? (
          <div className="py-16 text-center text-zinc-500 font-mono text-xs animate-pulse">
            Loading active crew members & track records...
          </div>
        ) : filteredCrew.length === 0 ? (
          <div className="bg-card/20 border border-dashed border-border/60 rounded-xl p-12 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white uppercase tracking-tight">
                {crewSearch || selectedDeptFilter !== 'All' ? 'No Matching Crew Members Found' : 'No Crew Members Registered Yet'}
              </h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto font-light leading-relaxed">
                {crewSearch || selectedDeptFilter !== 'All' 
                  ? 'Try clearing your search query or selecting a different department filter.'
                  : 'Register as an Active Crew Member with your profile photo and Instagram handle to be featured on this official roster.'}
              </p>
            </div>
            {crewSearch || selectedDeptFilter !== 'All' ? (
              <button
                onClick={() => { setCrewSearch(''); setSelectedDeptFilter('All'); }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-zinc-900 border border-zinc-700 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <span>Reset Filters</span>
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                <span>Register Now</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredCrew.map((member, i) => {
              const photoUrl = member.avatarUrl || member.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
              const igUrl = extractInstagramUrl(member);
              const igHandle = getInstagramHandle(igUrl, member.name);
              const socialLinks = extractSocialLinks(member);
              const photosCount = member.photosCount || 0;
              const eventsCount = member.eventsCount || (member.eventsCovered?.length || 0);

              return (
                <div 
                  key={member._id || member.id || i} 
                  onClick={() => setSelectedCrewDossier(member)}
                  className="bg-card/30 border border-border/50 rounded-xl p-3 text-center group hover:border-primary/50 transition-all duration-300 flex flex-col justify-between shadow-lg relative overflow-hidden cursor-pointer hover:shadow-primary/5 hover:-translate-y-0.5"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      
                      {/* Track Record Pill on Card */}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[8px] font-mono font-bold text-white/90">
                        {photosCount > 0 ? (
                          <span className="bg-black/75 px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-0.5">
                            <Camera className="h-2.5 w-2.5 text-primary" /> {photosCount}
                          </span>
                        ) : (
                          <span className="bg-black/75 px-1.5 py-0.5 rounded border border-white/10 text-zinc-400">
                            Crew
                          </span>
                        )}
                        {eventsCount > 0 && (
                          <span className="bg-black/75 px-1.5 py-0.5 rounded border border-white/10 text-amber-300">
                            🎯 {eventsCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {/* Instagram handle or Specialization */}
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
                          {member.specialization || 'Pixela Crew'}
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
                      <span className="text-[8px] font-mono text-zinc-600">Track Record Dossier</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================================
          CREW MEMBER TRACK RECORD & DOSSIER MODAL
          ========================================================================= */}
      {selectedCrewDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 overflow-hidden rounded-2xl glass-panel border border-white/15 p-6 sm:p-8 text-white shadow-2xl space-y-6 text-left">
            {/* Close & Action Buttons */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <button
                onClick={() => exportCrewMemberDossierPdf(selectedCrewDossier)}
                className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                title="Download Official Credentials PDF Dossier"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Export PDF Dossier</span>
              </button>
              <button
                onClick={() => setSelectedCrewDossier(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-border/40 pb-6 pt-2">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-zinc-950 border-2 border-primary/50 shrink-0 shadow-xl">
                <img
                  src={selectedCrewDossier.avatarUrl || selectedCrewDossier.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                  alt={selectedCrewDossier.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified Pixela Crew</span>
                  </span>
                  <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full border border-white/5">
                    {selectedCrewDossier.role?.toUpperCase() || 'MEMBER'}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight truncate">
                  {selectedCrewDossier.name}
                </h3>

                <p className="text-xs text-zinc-400 font-mono">
                  {selectedCrewDossier.department || 'General'}
                  {(selectedCrewDossier.department) && (selectedCrewDossier.semester || selectedCrewDossier.year) ? ' • ' : ''}
                  {selectedCrewDossier.year || '3rd Year'} {selectedCrewDossier.semester ? `(${selectedCrewDossier.semester} Sem)` : ''}
                </p>

                {/* Social Handles Bar */}
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  {extractSocialLinks(selectedCrewDossier).map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      {link.platform === 'instagram' && <Instagram className="h-3 w-3 text-[#ff5e95]" />}
                      {link.platform === 'linkedin' && <Linkedin className="h-3 w-3 text-[#0a66c2]" />}
                      {link.platform === 'github' && <Github className="h-3 w-3 text-zinc-200" />}
                      <span className="capitalize">{link.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Track Record KPI Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl space-y-1 text-center">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Gallery Prints</span>
                <p className="text-xl font-black text-white">{selectedCrewDossier.photosCount || 0}</p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl space-y-1 text-center">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Events Covered</span>
                <p className="text-xl font-black text-amber-400">
                  {selectedCrewDossier.eventsCount || (selectedCrewDossier.eventsCovered?.length || 0)}
                </p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl space-y-1 text-center">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Performance Rating</span>
                <p className="text-xl font-black text-primary flex items-center justify-center gap-1">
                  <span>{selectedCrewDossier.performanceRating || 5}</span>
                  <Star className="h-3.5 w-3.5 fill-primary" />
                </p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl space-y-1 text-center">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Member Since</span>
                <p className="text-xs font-mono font-bold text-zinc-300 mt-1">
                  {new Date(selectedCrewDossier.joinDate || selectedCrewDossier.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Badges & Specialization */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono block">
                Honors & Badges
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedCrewDossier.badges || ['Verified Crew', 'Prime Shooter']).map((badge: string, bIdx: number) => (
                  <span
                    key={bIdx}
                    className="inline-flex items-center space-x-1 text-[10px] bg-primary/10 border border-primary/30 text-primary px-2.5 py-1 rounded-full font-mono font-semibold"
                  >
                    <Award className="h-3 w-3" />
                    <span>{badge}</span>
                  </span>
                ))}
                {selectedCrewDossier.specialization && (
                  <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 rounded-full font-mono">
                    Specialization: {selectedCrewDossier.specialization}
                  </span>
                )}
              </div>
            </div>

            {/* Camera Gear Loadout */}
            {(selectedCrewDossier.gear?.cameraBody || selectedCrewDossier.gear?.primaryLens) && (
              <div className="bg-zinc-950/70 border border-zinc-800 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-primary" />
                  <span>Equipment & Gear Loadout</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300 font-mono">
                  {selectedCrewDossier.gear.cameraBody && (
                    <div><span className="text-zinc-500">Camera:</span> {selectedCrewDossier.gear.cameraBody}</div>
                  )}
                  {selectedCrewDossier.gear.primaryLens && (
                    <div><span className="text-zinc-500">Primary Lens:</span> {selectedCrewDossier.gear.primaryLens}</div>
                  )}
                  {selectedCrewDossier.gear.secondaryLens && (
                    <div><span className="text-zinc-500">Secondary:</span> {selectedCrewDossier.gear.secondaryLens}</div>
                  )}
                  {Array.isArray(selectedCrewDossier.gear.accessories) && selectedCrewDossier.gear.accessories.length > 0 && (
                    <div><span className="text-zinc-500">Accessories:</span> {selectedCrewDossier.gear.accessories.join(', ')}</div>
                  )}
                </div>
              </div>
            )}

            {/* Mini Gallery Showcase */}
            {Array.isArray(selectedCrewDossier.recentPhotos) && selectedCrewDossier.recentPhotos.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block">
                  Recent Gallery Captures ({selectedCrewDossier.recentPhotos.length})
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedCrewDossier.recentPhotos.map((photo: any, pIdx: number) => (
                    <div key={photo._id || pIdx} className="aspect-square rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 relative group">
                      <img src={photo.imageUrl} alt={photo.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 flex flex-col justify-end text-[9px] text-white">
                        <span className="font-bold truncate">{photo.title}</span>
                        <span className="text-primary text-[8px] font-mono">{photo.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Coverage Timeline Logs with Explicit Coverage Dates */}
            {Array.isArray(selectedCrewDossier.eventsCovered) && selectedCrewDossier.eventsCovered.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    <span>Crew Event Coverage Dates & Milestones ({selectedCrewDossier.eventsCovered.length})</span>
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedCrewDossier.eventsCovered.map((evt: any, eIdx: number) => (
                    <div key={eIdx} className="bg-zinc-900/70 p-3 rounded-xl border border-zinc-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">{evt.eventName}</span>
                          <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded font-mono">
                            {evt.role || 'Lead Shooter'}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400">
                          {evt.location || 'Oriental Campus'} {evt.notes ? `• ${evt.notes}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1.5 bg-zinc-950 px-2.5 py-1 rounded-lg border border-white/5 shrink-0 self-start sm:self-center">
                        <Calendar className="h-3 w-3 text-amber-400" />
                        <span className="text-[10px] font-mono font-bold text-zinc-200">
                          {evt.date ? new Date(evt.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Covered'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs text-zinc-500 font-mono text-center">
                Registered active crew member. Event coverage dates will be recorded upon milestone completion.
              </div>
            )}

            {/* Bio */}
            {selectedCrewDossier.bio && (
              <div className="text-xs text-zinc-300 font-light leading-relaxed bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                <span className="text-[9px] font-bold text-zinc-500 uppercase font-mono block mb-1">Creator Bio</span>
                {selectedCrewDossier.bio}
              </div>
            )}

            {/* Super Admin Control Footer */}
            {isSuperAdmin && (
              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <span className="text-[10px] font-mono text-amber-400">Super Admin Controls Active</span>
                <button
                  onClick={() => {
                    setItemToDelete({ id: selectedCrewDossier._id || selectedCrewDossier.id, name: selectedCrewDossier.name, type: 'crew' });
                  }}
                  className="px-3 py-1.5 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white rounded-lg text-xs font-semibold border border-red-800/40 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove from Official Roster</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUPER ADMIN FAST-TRACK APPROVAL DRAWER / MODAL
          ========================================================================= */}
      {showApprovalDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl my-8 overflow-hidden rounded-2xl glass-panel border border-white/15 p-6 sm:p-8 text-white shadow-2xl space-y-6 text-left">
            <button
              onClick={() => setShowApprovalDrawer(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Pending Crew Access Requests</h3>
                <p className="text-xs text-zinc-400">Review applicants and instantly authorize them to appear on the roster.</p>
              </div>
            </div>

            {pendingMembers.length === 0 ? (
              <div className="py-12 text-center space-y-3 border border-dashed border-border/40 rounded-xl">
                <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">All Caught Up!</h4>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">There are no pending crew registration requests at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-xs font-mono text-zinc-300">
                    <span className="font-bold text-amber-400">{pendingMembers.length}</span> crew member(s) awaiting approval
                  </span>
                  <button
                    onClick={handleInstantApproveAll}
                    disabled={isApprovingAll}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{isApprovingAll ? 'Approving...' : 'Approve All'}</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {pendingMembers.map((member) => {
                    const memberId = member._id || member.id;
                    const isProcessing = processingMemberId === memberId;
                    const igUrl = extractInstagramUrl(member);
                    const igHandle = getInstagramHandle(igUrl, member.name);

                    return (
                      <div
                        key={memberId}
                        className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-700 overflow-hidden shrink-0">
                            <img
                              src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                              alt={member.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-xs">{member.name}</h4>
                            <p className="text-[10px] text-zinc-400 font-mono">
                              {member.department || 'General'} • {member.year || '3rd Year'} ({member.semester || 1} Sem)
                            </p>
                            {igHandle && (
                              <p className="text-[10px] text-[#ff5e95] font-mono flex items-center gap-1 mt-0.5">
                                <Instagram className="h-2.5 w-2.5" /> {igHandle}
                              </p>
                            )}
                            <p className="text-[9px] text-zinc-500 font-mono">{member.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleInstantApprove(member)}
                            disabled={isProcessing}
                            className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => handleInstantDecline(member)}
                            disabled={isProcessing}
                            className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1 border border-red-800/40 cursor-pointer disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
          if (newToken) fetchPendingMembers(newToken);
        }}
      />

    </div>
  );
}

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
