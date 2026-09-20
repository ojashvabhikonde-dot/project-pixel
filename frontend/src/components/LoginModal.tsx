'use client';

import React, { useState } from 'react';
import { 
  X, Lock, Mail, User, ShieldCheck, Camera, Upload, Trash2, 
  Sparkles, CheckCircle2, Plus, Globe, Link2, ExternalLink
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

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: any) => void;
  initialMode?: 'login' | 'register';
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialMode = 'register' 
}: LoginModalProps) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [department, setDepartment] = useState('Information Technology');
  const [year, setYear] = useState('3rd Year');
  const [semester, setSemester] = useState('6');
  
  // Alumni & Faculty specific fields
  const [tenureYear, setTenureYear] = useState('2025-2026');
  const [pastRole, setPastRole] = useState('Ex Prime');
  const [currentProfession, setCurrentProfession] = useState('Senior Media Director');
  const [designation, setDesignation] = useState('Faculty Coordinator');
  const [bio, setBio] = useState('');

  // Social Media Handles (Instagram is required + up to 2 extra handles = max 3 total)
  const [instagramUrl, setInstagramUrl] = useState('');
  const [extraHandles, setExtraHandles] = useState<{ platform: string; url: string }[]>([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccessMsg, setRegistrationSuccessMsg] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setIsRegister(initialMode === 'register');
      setError('');
      setRegistrationSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  const isSuperAdminEmail = email.trim().toLowerCase() === 'pixela@oriental.ac.in';
  const totalHandlesCount = (instagramUrl.trim() ? 1 : 0) + extraHandles.length;

  const handleAddExtraHandle = () => {
    if (extraHandles.length < 2) {
      // Find the next unused platform
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
      setAvatarFile(file);
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

  const removeAvatar = () => {
    setAvatarUrl('');
    setAvatarFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegistrationSuccessMsg('');
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please provide both email and password.');
      setLoading(false);
      return;
    }

    if (isRegister && !cleanName) {
      setError('Please provide your full name.');
      setLoading(false);
      return;
    }

    const formattedInstagram = instagramUrl.trim();

    // Assemble up to 3 social media handles
    const socialLinks = [];
    if (formattedInstagram) {
      socialLinks.push({ platform: 'instagram', url: formattedInstagram });
    }
    extraHandles.forEach(h => {
      if (h.url.trim()) {
        socialLinks.push({ platform: h.platform, url: h.url.trim() });
      }
    });

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
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
      const targetApi = API_URL || 'http://localhost:5000';
      const res = await fetch(`${targetApi}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        throw new Error(`Server returned unexpected response (${res.status}). Please ensure backend is running at http://localhost:5000.`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      // Save token and user details to localStorage
      localStorage.setItem('pixela_token', data.token);
      localStorage.setItem('pixela_user', JSON.stringify(data.user));
      
      if (isRegister && role === 'member' && !data.user.isApproved) {
        setRegistrationSuccessMsg('Registration submitted successfully! Your application has been sent to the Super Admin for roster approval.');
        setTimeout(() => {
          onSuccess(data.token, data.user);
          onClose();
        }, 1200);
      } else {
        onSuccess(data.token, data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 overflow-hidden rounded-2xl glass-panel border border-white/10 p-6 sm:p-8 text-white shadow-2xl">
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full pixela-gradient-bg opacity-25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full pixela-gradient-bg opacity-20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-12 w-12 rounded-full border-2 border-primary flex items-center justify-center mb-2 shadow-lg shadow-primary/20">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {isRegister ? 'Join Pixela Crew' : 'Welcome to Pixela'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
            {isRegister 
              ? 'Register with your photo & social handles to be featured on the official roster' 
              : 'Sign in to access gallery uploads, event hiring, and chatbot insights'}
          </p>
          {isSuperAdminEmail && (
            <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-bold tracking-wider uppercase font-mono animate-pulse">
              <Sparkles className="h-3 w-3" />
              <span>Super Admin Account Identified</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {registrationSuccessMsg && (
          <div className="mb-4 p-3 rounded-lg bg-green-950/60 border border-green-500/40 text-green-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{registrationSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-primary transition-colors text-white"
                  placeholder="e.g. Ojashva Bhikonde"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-primary transition-colors text-white"
                placeholder="ojashva.bhikonde@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-primary transition-colors text-white"
                placeholder={isSuperAdminEmail ? "Enter pixela@2026" : "••••••••"}
              />
            </div>
            {isSuperAdminEmail && (
              <p className="text-[10px] text-primary/80 mt-1 font-mono">
                Super Admin Password: <span className="font-bold text-primary">pixela@2026</span> (or your chosen password)
              </p>
            )}
          </div>

          {isRegister && (
            <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
              
              {/* Membership Role Selector (Crew, Viewer, Alumni, Faculty) */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Membership Role</label>
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
                    * Crew registrations require Super Admin approval before appearing on the Leadership page.
                  </p>
                )}
                {role === 'viewer' && (
                  <p className="text-[10px] text-green-400/90 mt-1 font-light leading-tight">
                    * Audience accounts are auto-approved instantly with no admin approval needed.
                  </p>
                )}
                {role === 'alumni' && (
                  <p className="text-[10px] text-amber-400/90 mt-1 font-light leading-tight">
                    * Alumni registrations require Super Admin approval. Once approved, you are automatically added to the Club Alumni list.
                  </p>
                )}
                {role === 'faculty' && (
                  <p className="text-[10px] text-amber-400/90 mt-1 font-light leading-tight">
                    * Faculty coordinator registrations require Super Admin approval. Once approved, you are automatically featured on the Faculty list.
                  </p>
                )}
              </div>

              {/* For Audience/Viewer: Simple instantaneous confirmation */}
              {role === 'viewer' && (
                <div className="bg-zinc-950/70 p-3 rounded-lg border border-green-500/20 text-center space-y-1">
                  <div className="flex items-center justify-center space-x-1.5 text-green-400 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Instant Audience Access</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-light">
                    As an Audience member, no photo or approval is needed. You get instant access to view the gallery, interact with AI Pixie, and explore club exhibitions.
                  </p>
                </div>
              )}

              {/* Profile Photo (For Crew, Alumni, Faculty) */}
              {role !== 'viewer' && (
                <div>
                  <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 font-mono flex items-center justify-between">
                    <span>Profile Photo</span>
                    {avatarUrl && <span className="text-[9px] text-green-400 flex items-center gap-1 font-normal"><CheckCircle2 className="h-3 w-3" /> Photo Selected</span>}
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
                          onClick={removeAvatar}
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

              {/* Social Media Handles Builder (For Crew, Alumni, Faculty) */}
              {role !== 'viewer' && (
                <div className="pt-2 border-t border-zinc-800/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <InstagramIcon className="h-3.5 w-3.5 text-[#ff5e95]" />
                      <span>Social Media Handles</span>
                    </label>
                    <span className="text-[9px] text-zinc-400 font-mono bg-zinc-800 px-2 py-0.5 rounded-full border border-white/5">
                      {totalHandlesCount}/3 Added
                    </span>
                  </div>

                  {/* 1. Instagram Handle (Standard / Primary) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-[#ff5e95] font-semibold flex items-center gap-1">
                        <InstagramIcon className="h-3 w-3" />
                        Instagram Profile URL / Handle <span className="text-zinc-500 font-normal">(Primary)</span>
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 font-mono text-xs">
                        @
                      </span>
                      <input
                        type="text"
                        placeholder="mr_ojashva or https://instagram.com/mr_ojashva"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-[#ff5e95] text-white"
                      />
                    </div>
                  </div>

                  {/* 2 & 3. Extra Social Media Handles (Up to 2 extra) */}
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
                        className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                        title="Remove handle"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add Handle Button */}
                  {extraHandles.length < 2 && (
                    <button
                      type="button"
                      onClick={handleAddExtraHandle}
                      className="w-full py-1.5 px-3 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-dashed border-zinc-700 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="h-3 w-3 text-primary" />
                      <span>+ Add Social Handle (LinkedIn, GitHub, X, Portfolio) • Max 3 Total</span>
                    </button>
                  )}
                </div>
              )}

              {/* ROLE-SPECIFIC FIELDS */}

              {/* 1. CREW MEMBER SPECIFIC FIELDS */}
              {role === 'member' && (
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-800/60">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Branch / Dept</label>
                    <input
                      type="text"
                      placeholder="e.g. IT, CSE, Mech"
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

              {/* 2. ALUMNI SPECIFIC FIELDS */}
              {role === 'alumni' && (
                <div className="space-y-3 pt-1 border-t border-zinc-800/60">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Tenure Year</label>
                      <select
                        value={tenureYear}
                        onChange={(e) => setTenureYear(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-zinc-300 focus:outline-none focus:border-primary"
                      >
                        <option value="2025-2026">2025-2026</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2023-2024">2023-2024</option>
                        <option value="2022-2023">2022-2023</option>
                        <option value="2021-2022">2021-2022</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Past Role in Pixela</label>
                      <input
                        type="text"
                        placeholder="e.g. Ex Prime, Ex Chief"
                        value={pastRole}
                        onChange={(e) => setPastRole(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-primary text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Current Profession / Job</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Media Director"
                        value={currentProfession}
                        onChange={(e) => setCurrentProfession(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-primary text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Branch / Degree</label>
                      <input
                        type="text"
                        placeholder="e.g. Information Technology"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-primary text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. FACULTY COORDINATOR SPECIFIC FIELDS */}
              {role === 'faculty' && (
                <div className="space-y-3 pt-1 border-t border-zinc-800/60">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. Faculty Coordinator / Advisor"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-primary text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Department</label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science & Engg."
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-primary text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Bio / Mentor Message</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Guiding and mentoring Pixela club in photography & media..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-primary text-white resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full pixela-gradient-bg hover:opacity-90 text-white font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase mt-3 transition-all shadow-lg focus:outline-none cursor-pointer"
          >
            {loading ? 'Processing...' : isRegister ? (role === 'viewer' ? 'Register Instant Account' : `Register as ${role === 'alumni' ? 'Alumni' : role === 'faculty' ? 'Faculty Coordinator' : 'Crew'}`) : 'Sign In to Pixela'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-400 border-t border-zinc-800/80 pt-4">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-primary hover:underline focus:outline-none ml-1 font-bold cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-primary hover:underline focus:outline-none ml-1 font-bold cursor-pointer"
              >
                Register as Crew
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

