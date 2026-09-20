'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Camera, Mail, Shield, CheckCircle2, AlertCircle, Save,
  Lock, Eye, EyeOff, Sparkles, Upload, Trash2, Plus, Globe,
  Link2, ExternalLink, ArrowLeft, Image as ImageIcon, Award,
  Clock, BookOpen, GraduationCap, Briefcase
} from 'lucide-react';
import { API_URL } from '@/config/api';

const PLATFORM_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
  { value: 'github', label: 'GitHub', placeholder: 'github.com/username' },
  { value: 'twitter', label: 'X / Twitter', placeholder: 'x.com/username' },
  { value: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@channel' },
  { value: 'portfolio', label: 'Portfolio / Website', placeholder: 'yourportfolio.com' },
  { value: 'behance', label: 'Behance', placeholder: 'behance.net/username' },
  { value: 'other', label: 'Other Link', placeholder: 'https://...' },
];

export default function ProfilePage() {
  const router = useRouter();

  // Auth State
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [department, setDepartment] = useState('Information Technology');
  const [year, setYear] = useState('3rd Year');
  const [semester, setSemester] = useState(6);
  const [specialization, setSpecialization] = useState('Visual Creator');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  
  // Social Links
  const [instagramUrl, setInstagramUrl] = useState('');
  const [extraHandles, setExtraHandles] = useState<{ platform: string; url: string }[]>([]);

  // Alumni & Faculty Fields
  const [tenureYear, setTenureYear] = useState('');
  const [pastRole, setPastRole] = useState('');
  const [currentProfession, setCurrentProfession] = useState('');
  const [designation, setDesignation] = useState('');

  // Security / Password Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // User Gallery Photos
  const [userPhotos, setUserPhotos] = useState<any[]>([]);

  useEffect(() => {
    const savedToken = localStorage.getItem('pixela_token');
    const savedUser = localStorage.getItem('pixela_user');

    if (!savedToken || !savedUser) {
      setLoading(false);
      return;
    }

    setToken(savedToken);
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);
    populateForm(parsedUser);

    fetchFreshProfile(savedToken);
  }, []);

  const populateForm = (userData: any) => {
    setName(userData.name || '');
    setEmail(userData.email || '');
    setAvatarUrl(userData.avatarUrl || '');
    setBio(userData.bio || '');
    setDepartment(userData.department || 'Information Technology');
    setYear(userData.year || '3rd Year');
    setSemester(userData.semester || 6);
    setSpecialization(userData.specialization || 'Visual Creator');
    
    // Skills
    if (Array.isArray(userData.skills)) {
      setSkills(userData.skills);
    } else if (typeof userData.skills === 'string') {
      setSkills(userData.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
    }

    // Social handles
    setInstagramUrl(userData.instagramUrl || '');
    if (Array.isArray(userData.socialLinks)) {
      const filtered = userData.socialLinks
        .filter((s: any) => s.platform !== 'instagram' && s.url)
        .map((s: any) => ({ platform: s.platform || 'portfolio', url: s.url }));
      setExtraHandles(filtered.slice(0, 2));
    }

    // Alumni / Faculty fields
    setTenureYear(userData.tenureYear || '');
    setPastRole(userData.pastRole || '');
    setCurrentProfession(userData.currentProfession || '');
    setDesignation(userData.designation || '');
  };

  const fetchFreshProfile = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/profile?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Cache-Control': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          populateForm(data.user);
          localStorage.setItem('pixela_user', JSON.stringify(data.user));
        }
        if (Array.isArray(data.photos)) {
          setUserPhotos(data.photos);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch fresh profile from API:', err);
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file: File, maxWidth = 500, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImage(file, 500, 0.85);
        setAvatarUrl(compressed);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = () => setAvatarUrl(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const clean = newSkillInput.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddExtraHandle = () => {
    if (extraHandles.length < 2) {
      const used = extraHandles.map(h => h.platform);
      const available = PLATFORM_OPTIONS.find(p => !used.includes(p.value) && p.value !== 'other') || PLATFORM_OPTIONS[0];
      setExtraHandles([...extraHandles, { platform: available.value, url: '' }]);
    }
  };

  const handleRemoveExtraHandle = (index: number) => {
    setExtraHandles(extraHandles.filter((_, i) => i !== index));
  };

  const handleExtraHandleChange = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...extraHandles];
    updated[index][field] = value;
    setExtraHandles(updated);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');

    if (!name.trim()) {
      setSaveError('Full Name cannot be empty.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setSaveError('Passwords do not match. Please verify.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setSaveError('New password must be at least 6 characters.');
      return;
    }

    setSaving(true);

    try {
      const payload: any = {
        name: name.trim(),
        avatarUrl,
        bio: bio.trim(),
        department,
        year,
        semester: Number(semester) || 1,
        specialization,
        skills,
        instagramUrl: instagramUrl.trim(),
        socialLinks: extraHandles.filter(h => h.url.trim()),
        tenureYear,
        pastRole,
        currentProfession,
        designation
      };

      if (newPassword) {
        payload.password = newPassword.trim();
      }

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setUser(data.user);
      localStorage.setItem('pixela_user', JSON.stringify(data.user));
      setSaveSuccess('Profile successfully updated! All changes are now live.');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 font-mono tracking-wider uppercase">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
        <div className="h-16 w-16 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">Profile Access Required</h2>
        <p className="text-xs text-zinc-400 font-light leading-relaxed">
          Please log in to your Pixela account to view and customize your official photographer profile, handles, and gallery submissions.
        </p>
        <NextLink
          href="/"
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-all cursor-pointer shadow-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </NextLink>
      </div>
    );
  }

  const isSuperAdmin = user.email?.toLowerCase() === 'pixela@oriental.ac.in' || user.role === 'admin';
  const isLeader = ['president', 'vice_president', 'tech_head'].includes(user.role);
  const isAlumni = user.role === 'alumni';
  const isFaculty = user.role === 'faculty';

  const roleLabel = isSuperAdmin ? 'Super Administrator'
    : user.role === 'president' ? 'Club President'
    : user.role === 'vice_president' ? 'Vice President'
    : user.role === 'tech_head' ? 'Tech & Automation Head'
    : isAlumni ? 'Club Alumni'
    : isFaculty ? 'Faculty Coordinator'
    : user.role === 'viewer' ? 'Audience Member'
    : 'Pixela Crew Member';

  const currentAvatar = avatarUrl || user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-background text-left">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono bg-primary/10 border border-primary/30 px-2.5 py-0.5 rounded-full">
              Member Profile Editor
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center space-x-2">
            <span>My Creative Profile</span>
          </h1>
          <p className="text-xs text-zinc-400 font-light">
            Manage your personal credentials, bio, gear specialties, and social handles featured across the Pixela platform.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <NextLink
            href="/leadership"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-card border border-border/50 text-xs font-semibold text-zinc-300 hover:text-white hover:border-white/20 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View Public Roster</span>
          </NextLink>
          {isSuperAdmin && (
            <NextLink
              href="/admin"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-primary/20 border border-primary/40 text-xs font-bold text-primary hover:bg-primary/30 transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Panel</span>
            </NextLink>
          )}
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center space-x-3 text-green-400 text-xs font-semibold animate-in fade-in duration-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-xs font-semibold animate-in fade-in duration-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Hero Profile Overview Card */}
      <div className="relative overflow-hidden rounded-2xl glass-panel border border-white/10 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full pixela-gradient-bg opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full pixela-gradient-bg opacity-15 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar with live upload overlay */}
          <div className="relative group shrink-0">
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-zinc-950 overflow-hidden border-2 border-primary/40 shadow-xl shadow-primary/10">
              <img src={currentAvatar} alt={name} className="h-full w-full object-cover" />
            </div>
            <label 
              htmlFor="avatar-upload"
              className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold uppercase tracking-wider text-white gap-1"
            >
              <Camera className="h-5 w-5 text-primary" />
              <span>Change</span>
            </label>
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarFile}
            />
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white truncate">{name || user.name}</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-primary/20 text-primary border border-primary/30 uppercase">
                {roleLabel}
              </span>
              {user.isApproved ? (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-green-500/15 text-green-400 border border-green-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Official Roster Verified
                </span>
              ) : (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Pending Admin Review
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400 font-mono flex items-center justify-center md:justify-start gap-1.5">
              <Mail className="h-3.5 w-3.5 text-zinc-500" />
              <span>{user.email}</span>
            </p>

            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed italic font-light pt-1">
              "{bio || 'No bio provided yet. Add your creative vision, camera gear, and story below!'}"
            </p>

            {/* Tags preview */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <span className="text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
                🏛️ {department} • {year} ({semester} Sem)
              </span>
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#ff5e95] bg-[#ff5e95]/10 border border-[#ff5e95]/30 px-2.5 py-1 rounded-lg hover:underline flex items-center gap-1 font-mono"
                >
                  <span>📷</span>
                  <span>{instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '')}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Editor Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Personal, Academic & Creative Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Basic Details Card */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 sm:p-7 space-y-5 shadow-lg">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-border/30 pb-3">
                <User className="h-4 w-4 text-primary" />
                <span>Basic Personal Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary"
                    placeholder="e.g. Ojashva Bhikonde"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                    Email Address (Account ID)
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-500 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* Avatar URL alternative */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                  Avatar Image (Upload or Direct Image URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary font-mono text-[11px]"
                  />
                  <label 
                    htmlFor="avatar-upload-btn"
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0 flex items-center space-x-1"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload File</span>
                  </label>
                  <input 
                    id="avatar-upload-btn" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarFile}
                  />
                </div>
              </div>

              {/* Bio Statement */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                  Bio / Creative Philosophy
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your photography style, favorite camera bodies, lenses, or visual storytelling perspective..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>
            </div>

            {/* 2. Academic & Specialization Card */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 sm:p-7 space-y-5 shadow-lg">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-border/30 pb-3">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>Academic & Campus Specialization</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                    Department / Branch
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="AIML">AIML / Data Science</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Oriental Group">Oriental Group / General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                    Academic Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Faculty">Faculty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                    Current Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>{s}th Semester</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                  Photography Specialization
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Street & Candid Photography, Cinematography, Drone Pilot, Studio Lighting"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Skills Tags Editor */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                  Skills & Software Tags (Press Enter or Click + to add)
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="e.g. Adobe Lightroom, Sony Alpha, Color Grading, 50mm Prime"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3.5 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-medium"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-zinc-500 hover:text-red-400 ml-1 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-[11px] text-zinc-500 italic">No skill tags added yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Alumni & Faculty Specific Section (Conditional) */}
            {(isAlumni || isFaculty) && (
              <div className="bg-card border border-border/40 rounded-2xl p-6 sm:p-7 space-y-5 shadow-lg">
                <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-border/30 pb-3">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span>{isAlumni ? 'Alumni Credentials' : 'Faculty Credentials'}</span>
                </h3>

                {isAlumni ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                        Tenure Year
                      </label>
                      <input
                        type="text"
                        value={tenureYear}
                        onChange={(e) => setTenureYear(e.target.value)}
                        placeholder="2024-2025"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                        Past Role in Club
                      </label>
                      <input
                        type="text"
                        value={pastRole}
                        onChange={(e) => setPastRole(e.target.value)}
                        placeholder="Ex Prime / Lead Curator"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                        Current Profession
                      </label>
                      <input
                        type="text"
                        value={currentProfession}
                        onChange={(e) => setCurrentProfession(e.target.value)}
                        placeholder="Senior Cinematographer"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                      Faculty Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="Faculty Coordinator & Mentor"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Social Links & Security */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Social Media Handles */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-border/30 pb-3">
                <Globe className="h-4 w-4 text-primary" />
                <span>Social Presence (Max 3)</span>
              </h3>

              {/* Instagram Handle */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono flex items-center justify-between">
                  <span>Instagram Handle</span>
                  <span className="text-[#ff5e95] text-[9px] font-bold">Roster Required</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 font-mono text-xs">@</span>
                  <input
                    type="text"
                    value={instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '').replace(/^@/, '')}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="your_handle"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              {/* Extra Handles */}
              {extraHandles.map((handle, idx) => (
                <div key={idx} className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <select
                      value={handle.platform}
                      onChange={(e) => handleExtraHandleChange(idx, 'platform', e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-white rounded px-2 py-1 text-[11px] font-medium focus:outline-none focus:border-primary"
                    >
                      {PLATFORM_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveExtraHandle(idx)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                      title="Remove link"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={handle.url}
                    onChange={(e) => handleExtraHandleChange(idx, 'url', e.target.value)}
                    placeholder="Profile URL or username"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              ))}

              {extraHandles.length < 2 && (
                <button
                  type="button"
                  onClick={handleAddExtraHandle}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Extra Link (LinkedIn, GitHub, Web)</span>
                </button>
              )}
            </div>

            {/* Change Password / Security */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-border/30 pb-3">
                <Lock className="h-4 w-4 text-primary" />
                <span>Security / Password</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep unchanged"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-3 pr-9 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {newPassword && (
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl pixela-gradient-bg text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Profile Updates</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* User Contributed Gallery Photos Section */}
      <section className="bg-card border border-border/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <span>My Gallery Submissions</span>
              <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-mono font-bold">
                {userPhotos.length}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 font-light mt-0.5">
              Photographs you submitted for public display in the Pixela Shutter Stories Gallery.
            </p>
          </div>
          <NextLink
            href="/gallery"
            className="inline-flex items-center space-x-1 text-xs text-primary hover:underline font-semibold"
          >
            <span>Go to Gallery & Upload</span>
            <ExternalLink className="h-3 w-3" />
          </NextLink>
        </div>

        {userPhotos.length === 0 ? (
          <div className="py-10 text-center space-y-2 border border-dashed border-border/40 rounded-xl">
            <ImageIcon className="h-8 w-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-400">No gallery prints submitted yet.</p>
            <p className="text-xs text-zinc-600 font-light">
              Visit the Gallery page to upload your high-resolution polaroids and landscape shots!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userPhotos.map((photo) => (
              <div
                key={photo._id || photo.id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden group hover:border-zinc-700 transition-colors flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                  <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 right-2">
                    {photo.isApproved ? (
                      <span className="text-[9px] bg-green-500/90 text-white font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                        Approved
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/90 text-black font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                        Review Pending
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-white text-xs truncate">{photo.title}</h4>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Category: {photo.category || 'General'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
