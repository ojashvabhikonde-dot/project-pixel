'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { API_URL } from '@/config/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: any) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('1st Year');
  const [semester, setSemester] = useState('1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { name, email, password, role, semester: Number(semester), year, department }
      : { email, password };

    try {
      const res = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save token and user details to localStorage
      localStorage.setItem('pixela_token', data.token);
      localStorage.setItem('pixela_user', JSON.stringify(data.user));
      
      onSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg glass-panel border border-white/10 p-6 text-white shadow-2xl">
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full pixela-gradient-bg opacity-30 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full pixela-gradient-bg opacity-20 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Shutter Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-full border-2 border-primary flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isRegister ? 'Join Pixela Crew' : 'Welcome to Pixela'}
          </h2>
          <p className="text-sm text-zinc-400 text-center mt-1">
            {isRegister 
              ? 'Create an account to join events & upload to gallery' 
              : 'Sign in to access gallery uploads, event hiring, and chatbot insights'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-3 bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50">
              <div className="col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">Role / Profile</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-1.5 px-3 text-xs text-zinc-300 focus:outline-none focus:border-primary"
                >
                  <option value="member">Active Crew Member</option>
                  <option value="viewer">Viewer / Audience</option>
                  <option value="alumni">Club Alumni</option>
                  <option value="faculty">Faculty Coordinator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Branch / Dept</label>
                <input
                  type="text"
                  placeholder="e.g. CSE"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full pixela-gradient-bg hover:opacity-90 text-white font-medium py-2 rounded-md text-sm mt-2 transition-all shadow-md focus:outline-none"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-400 border-t border-zinc-800 pt-4">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => setIsRegister(false)}
                className="text-primary hover:underline focus:outline-none ml-1 font-semibold"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button 
                onClick={() => setIsRegister(true)}
                className="text-primary hover:underline focus:outline-none ml-1 font-semibold"
              >
                Register Here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
