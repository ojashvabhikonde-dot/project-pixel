'use client';

import React, { useState, useEffect, Suspense } from 'react';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Lock, Mail, User, ShieldCheck, Camera, Upload, Trash2, 
  Sparkles, CheckCircle2, Plus, ArrowRight, Eye, EyeOff,
  AlertCircle, ArrowLeft, LogOut, Check, ExternalLink
} from 'lucide-react';
import { API_URL } from '@/config/api';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const PLATFORM_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
  { value: 'github', label: 'GitHub', placeholder: 'github.com/username' },
  { value: 'twitter', label: 'X / Twitter', placeholder: 'x.com/username' },
  { value: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@channel' },
  { value: 'portfolio', label: 'Portfolio / Website', placeholder: 'yourportfolio.com' },
  { value: 'behance', label: 'Behance', placeholder: 'behance.net/username' },
  { value: 'other', label: 'Other Link', placeholder: 'https://...' },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';
  const initialModeParam = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<'login' | 'register'>(initialModeParam);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [department, setDepartment] = useState('Information Technology');
  const [year, setYear] = useState('3rd Year');
  const [semester, setSemester] = useState('6');

  // Alumni & Faculty Fields
  const [tenureYear, setTenureYear] = useState('2025-2026');
  const [pastRole, setPastRole] = useState('Ex Prime');
  const [currentProfession, setCurrentProfession] = useState('Senior Media Director');
  const [designation, setDesignation] = useState('Faculty Coordinator');
  const [bio, setBio] = useState('');

  // Social Handles
  const [instagramUrl, setInstagramUrl] = useState('');
  const [extraHandles, setExtraHandles] = useState<{ platform: string; url: string }[]>([]);

  // Status
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('pixela_token');
    const savedUser = localStorage.getItem('pixela_user');
    if (savedToken && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        setCurrentUser(null);
      }
    }
  }, []);

  const totalHandlesCount = (instagramUrl.trim() ? 1 : 0) + extraHandles.length;

  const handleAddExtraHandle = () => {
    if (extraHandles.length < 2) {
      const usedPlatforms = extraHandles.map(h => h.platform);
      const available = PLATFORM_OPTIONS.find(p => !usedPlatforms.includes(p.value) && p.value !== 'other') || PLATFORM_OPTIONS[0];
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressedDataUrl = await compressImage(file, 500, 0.85);
        setAvatarUrl(compressedDataUrl);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = () => {
          setAvatarUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pixela_token');
    localStorage.removeItem('pixela_user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('pixela_auth_change'));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please provide both email and password.');
      setLoading(false);
      return;
    }

    if (mode === 'register' && !cleanName) {
      setError('Please provide your full name.');
      setLoading(false);
      return;
    }

    const formattedInstagram = instagramUrl.trim();
    const socialLinks = [];
    if (formattedInstagram) {
      socialLinks.push({ platform: 'instagram', url: formattedInstagram });
    }
    extraHandles.forEach(h => {
      if (h.url.trim()) {
        socialLinks.push({ platform: h.platform, url: h.url.trim() });
      }
    });

    const isRegister = mode === 'register';
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? {
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          role: role || 'member',
          avatarUrl,
          instagramUrl: formattedInstagram,
          socialLinks: socialLinks.slice(0, 3),
          semester: Number(semester) || 1,
          year: year || '1st Year',
          department: department || 'General',
          currentProfession,
          pastRole,
          tenureYear,
          designation,
          bio,
        }
      : { email: cleanEmail, password: cleanPassword };

    try {
      const targetApi = API_URL || 'https://project-pixel-u4xs.vercel.app';
      const res = await fetch(`${targetApi}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        throw new Error(`Server returned unexpected response (${res.status}). Please ensure backend is running at ${targetApi}.`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify your credentials or try again.');
      }

      // Save token and user details to localStorage
      localStorage.setItem('pixela_token', data.token);
      localStorage.setItem('pixela_user', JSON.stringify(data.user));
      setCurrentUser(data.user);

      // Dispatch global auth event so all open views immediately update
      window.dispatchEvent(new Event('pixela_auth_change'));
      window.dispatchEvent(new Event('storage'));

      // Un-blacklist if re-registering
      try {
        if (isRegister && data.user) {
          const userEmail = (data.user.email || '').toLowerCase().trim();
          const userId = String(data.user.id || data.user._id || '');
          const savedIds = localStorage.getItem('pixela_deleted_crew_ids');
          if (savedIds) {
            const parsed = JSON.parse(savedIds).filter((id: string) => id !== userId);
            localStorage.setItem('pixela_deleted_crew_ids', JSON.stringify(parsed));
          }
          const savedEmails = localStorage.getItem('pixela_deleted_crew_emails');
          if (savedEmails) {
            const parsed = JSON.parse(savedEmails).filter((e: string) => e.toLowerCase() !== userEmail);
            localStorage.setItem('pixela_deleted_crew_emails', JSON.stringify(parsed));
          }
        }
      } catch (e) {}

      const isSuperAdmin = data.user.email?.toLowerCase() === 'pixela@oriental.ac.in' || data.user.role === 'admin';

      if (isRegister) {
        setSuccessMsg(`Welcome to Pixela, ${data.user.name}! Your profile is now live on the crew roster.`);
        setTimeout(() => {
          if (redirectParam) {
            router.push(redirectParam);
          } else {
            router.push('/leadership');
          }
        }, 1200);
      } else {
        setSuccessMsg(`Welcome back, ${data.user.name}! Redirecting...`);
        setTimeout(() => {
          if (redirectParam) {
            router.push(redirectParam);
          } else if (isSuperAdmin) {
            router.push('/admin');
          } else {
            router.push('/profile');
          }
        }, 800);
      }
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        const targetApi = API_URL || 'https://project-pixel-u4xs.vercel.app';
        setError(`Cannot connect to backend server. Please verify the backend is running at ${targetApi}.`);
      } else {
        setError(err.message || 'Something went wrong. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-background">
      {/* Ambient background glow elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pixela-gradient-bg opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-primary/20 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <NextLink
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </NextLink>
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
            Pixela Auth Portal
          </span>
        </div>

        {/* If Already Logged In */}
        {currentUser && (
          <div className="mb-6 glass-panel rounded-2xl border border-white/10 p-5 text-white shadow-xl space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-800 border-2 border-primary shrink-0 flex items-center justify-center font-bold text-sm">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full object-cover" />
                ) : (
                  currentUser.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm truncate text-white">{currentUser.name}</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
              {(currentUser.role === 'admin' || currentUser.email?.toLowerCase() === 'pixela@oriental.ac.in') ? (
                <NextLink
                  href="/admin"
                  className="w-full text-center py-2 px-3 rounded-lg bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Admin Panel</span>
                </NextLink>
              ) : (
                <NextLink
                  href="/profile"
                  className="w-full text-center py-2 px-3 rounded-lg bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-white/90 transition-all flex items-center justify-center space-x-1.5"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>My Profile</span>
                </NextLink>
              )}

              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-lg bg-zinc-800/80 hover:bg-red-950/60 hover:text-red-400 text-zinc-300 font-semibold text-xs border border-zinc-700/60 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Switch / Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-8 text-white shadow-2xl relative">
          {/* Header */}
          <div className="text-center mb-6 space-y-1.5">
            <div className="h-12 w-12 rounded-full border-2 border-primary flex items-center justify-center mx-auto mb-2 shadow-lg shadow-primary/20 bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {mode === 'login' ? 'Sign In to Pixela' : 'Join the Pixela Crew'}
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              {mode === 'login'
                ? 'Access photographer portfolios, gallery uploads, and exclusive crew tools'
                : 'Register with your portfolio & social handles to join our creative roster'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register Crew / Member
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-400 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-green-950/70 border border-green-500/50 text-green-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration: Full Name */}
            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary transition-colors text-white"
                    placeholder="e.g. Ojashva Bhikonde"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary transition-colors text-white"
                  placeholder="e.g. user@oriental.ac.in"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Password <span className="text-red-400">*</span>
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-10 text-xs focus:outline-none focus:border-primary transition-colors text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Registration Specific Fields */}
            {mode === 'register' && (
              <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60 mt-3">
                {/* Role Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                    Membership Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-primary"
                  >
                    <option value="member">Active Crew Member (Featured on Roster)</option>
                    <option value="viewer">Viewer / Audience (Instant Access - No Approval)</option>
                    <option value="alumni">Club Alumni (Added to Alumni Timeline)</option>
                    <option value="faculty">Faculty Coordinator (Added to Faculty List)</option>
                  </select>
                  {role === 'member' && (
                    <p className="text-[10px] text-amber-400/90 mt-1 font-light leading-tight">
                      * Crew registrations appear on the leadership roster upon Super Admin approval.
                    </p>
                  )}
                  {role === 'viewer' && (
                    <p className="text-[10px] text-green-400/90 mt-1 font-light leading-tight">
                      * Audience accounts are auto-approved instantly with no approval needed.
                    </p>
                  )}
                </div>

                {/* Profile Photo */}
                {role !== 'viewer' && (
                  <div>
                    <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 font-mono flex items-center justify-between">
                      <span>Profile Photo</span>
                      {avatarUrl && (
                        <span className="text-[9px] text-green-400 flex items-center gap-1 font-normal">
                          <CheckCircle2 className="h-3 w-3" /> Photo Attached
                        </span>
                      )}
                    </label>

                    <div className="flex items-center space-x-3 bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800">
                      {avatarUrl ? (
                        <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-primary shrink-0 shadow-md">
                          <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-zinc-900 border border-dashed border-zinc-700 flex flex-col items-center justify-center shrink-0 text-zinc-500">
                          <Camera className="h-5 w-5 mb-0.5" />
                          <span className="text-[7px]">No Photo</span>
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5">
                        <label className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-semibold transition-colors cursor-pointer border border-zinc-700 w-full text-center">
                          <Upload className="h-3 w-3" />
                          <span>{avatarUrl ? 'Change Photo' : 'Upload Profile Photo'}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAvatarChange} 
                            className="hidden" 
                          />
                        </label>
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl('')}
                            className="flex items-center justify-center space-x-1 text-[9px] text-red-400 hover:text-red-300 w-full"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                            <span>Remove Photo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Media Handles */}
                {role !== 'viewer' && (
                  <div className="pt-2 border-t border-zinc-800/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <InstagramIcon className="h-3.5 w-3.5 text-[#ff5e95]" />
                        <span>Social Handles ({totalHandlesCount}/3)</span>
                      </label>
                    </div>

                    <div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 font-mono text-xs">
                          @
                        </span>
                        <input
                          type="text"
                          placeholder="Instagram username or URL"
                          value={instagramUrl}
                          onChange={(e) => setInstagramUrl(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-[#ff5e95] text-white"
                        />
                      </div>
                    </div>

                    {extraHandles.map((handle, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800">
                        <select
                          value={handle.platform}
                          onChange={(e) => handleExtraHandleChange(idx, 'platform', e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 rounded py-1 px-2 text-[10px] text-zinc-300 focus:outline-none font-mono"
                        >
                          {PLATFORM_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder={PLATFORM_OPTIONS.find(p => p.value === handle.platform)?.placeholder || 'Enter profile URL'}
                          value={handle.url}
                          onChange={(e) => handleExtraHandleChange(idx, 'url', e.target.value)}
                          className="flex-1 bg-zinc-900/80 border border-zinc-700/80 rounded py-1 px-2 text-xs text-white focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExtraHandle(idx)}
                          className="text-zinc-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    {extraHandles.length < 2 && (
                      <button
                        type="button"
                        onClick={handleAddExtraHandle}
                        className="w-full py-1.5 px-3 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-dashed border-zinc-700 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="h-3 w-3 text-primary" />
                        <span>Add Extra Handle (LinkedIn, GitHub, Portfolio)</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Role Specific Extra Details */}
                {role === 'member' && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/60">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Branch / Dept</label>
                      <input
                        type="text"
                        placeholder="e.g. IT, CSE"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-primary text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Year & Sem</label>
                      <div className="grid grid-cols-2 gap-1">
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2 text-[10px] focus:outline-none text-zinc-300"
                        >
                          <option value="1st Year">1st</option>
                          <option value="2nd Year">2nd</option>
                          <option value="3rd Year">3rd</option>
                          <option value="4th Year">4th</option>
                        </select>
                        <select
                          value={semester}
                          onChange={(e) => setSemester(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2 text-[10px] focus:outline-none text-zinc-300"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={String(s)}>{s} Sem</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full pixela-gradient-bg hover:opacity-90 text-white font-bold py-3 rounded-xl text-xs tracking-wider uppercase mt-4 transition-all shadow-xl focus:outline-none cursor-pointer flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Register Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-6 text-center text-xs text-zinc-400 border-t border-zinc-800/80 pt-4">
            {mode === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className="text-primary hover:underline font-bold cursor-pointer ml-1"
                >
                  Join the Crew
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-primary hover:underline font-bold cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-zinc-400 text-xs font-mono">
        Loading Pixela Portal...
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
