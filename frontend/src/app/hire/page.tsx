'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Calendar, MapPin, Send, HelpCircle, CheckCircle, Clock } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import { API_URL } from '@/config/api';

export default function HirePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('College Fest');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Read local auth state
    const savedToken = localStorage.getItem('pixela_token');
    if (savedToken) setToken(savedToken);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Gate: Check if user is logged in
    if (!token) {
      setIsLoginOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientName: name,
          clientEmail: email,
          clientPhone: phone,
          eventType,
          eventDate,
          venue,
          details
        })
      });

      if (!res.ok) throw new Error('Failed to submit booking');

      setSuccess(true);
      // Clear fields
      setName('');
      setEmail('');
      setPhone('');
      setEventDate('');
      setVenue('');
      setDetails('');
    } catch (err) {
      alert('Failed to send booking request. Please check connections.');
    } finally {
      setLoading(false);
    }
  };

  const [error, setError] = useState('');

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16 bg-background text-left">
      
      {/* Page Header */}
      <div className="text-center space-y-4 pb-6 border-b border-border/30">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">
          Client Requests
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase leading-none">
          Book Pixela Crew
        </h1>
        <p className="max-w-xl mx-auto text-xs md:text-sm text-zinc-400 font-light leading-relaxed">
          Hire our elite photography and videography team to cover your college seminars, tech fests, sports events, or hackathons.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left Side Details */}
        <div className="lg:col-span-5 space-y-8">
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Why Hire Pixela?</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm uppercase tracking-wider">Professional Equipment</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-light">
                  We use full-frame cameras, prime lenses, dynamic gimbal stabilizer setups, and high-end drone recording kits.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm uppercase tracking-wider">Post-Processing Experts</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-light">
                  Our crew holds advanced training in Adobe Lightroom color grading, Photoshop composition, and DaVinci Resolve color pipelines.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm uppercase tracking-wider">Live Alerts & Fast Setup</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-light">
                  Once you book, leaders get notified inside the club dashboard instantly and verify setup dates immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing FAQ notice */}
          <div className="bg-card/25 border border-border/50 rounded p-5 space-y-2">
            <h5 className="font-bold text-white text-sm flex items-center space-x-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="uppercase tracking-wider">Shoot Logistics Fee</span>
            </h5>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              Pixela is a student-run club under the Oriental Group. Basic campus coverages are fully sponsored; special private fests or print works are billed based on project scope.
            </p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="lg:col-span-7 bg-card/25 border border-border/50 rounded p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full pixela-gradient-bg opacity-5 blur-2xl pointer-events-none" />
          
          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="h-14 w-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto text-green-500">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">Booking Requested!</h3>
              <p className="text-sm text-zinc-405 max-w-sm mx-auto leading-relaxed font-light">
                Your shoot request has been submitted. An email notification alert has been sent to the Pixela President, and we will verify dates with you shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 text-xs font-semibold text-primary hover:underline"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ojas Gupta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950/85 border border-border/40 focus:border-white/20 text-white rounded px-4 py-2 text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950/85 border border-border/40 focus:border-white/20 text-white rounded px-4 py-2 text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950/85 border border-border/40 focus:border-white/20 text-white rounded px-4 py-2 text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Event Category</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-zinc-950/85 border border-border/40 focus:border-white/20 text-zinc-300 rounded px-4 py-2 text-sm focus:outline-none transition-colors"
                  >
                    <option value="College Fest">College Fest</option>
                    <option value="Seminar">Seminar / Conference</option>
                    <option value="Sports">Sports Fest</option>
                    <option value="Private Event">Private Exhibition</option>
                    <option value="Product Shoot">Product / Portfolio Shoot</option>
                    <option value="Other">Other Category</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Event Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-zinc-950/85 border border-border/40 focus:border-white/20 text-zinc-300 rounded px-4 py-2 text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Event Venue</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Campus Grounds / Hall"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-zinc-950/85 border border-border/40 focus:border-white/20 text-white rounded px-4 py-2 text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Shoot Requirements / Details</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about the event schedule, timing, expected gathering, and deliverables (e.g. aftermovie, print photos, live stories)..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-zinc-950/85 border border-border/40 focus:border-white/20 text-white rounded px-4 py-2 text-sm focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-black hover:bg-zinc-200 transition-colors rounded-full font-bold uppercase tracking-wider text-xs cursor-pointer shadow-lg flex items-center justify-center space-x-2"
              >
                <Send className="h-4.5 w-4.5" />
                <span>{loading ? 'Submitting Shoot Request...' : 'Send Shoot Request'}</span>
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Global Login Modal Interceptor */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={(newToken) => {
          setToken(newToken);
          // Wait briefly, then proceed or user submits form
        }}
      />
    </div>
  );
}
