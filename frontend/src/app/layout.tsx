'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, User, LogOut, Menu, X, ShieldAlert, Award, Sun, Moon } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import '@/app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    // Read local auth state
    const savedToken = localStorage.getItem('pixela_token');
    const savedUser = localStorage.getItem('pixela_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    // Enforce Dark Theme
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('pixela_token');
    localStorage.removeItem('pixela_user');
    setToken(null);
    setUser(null);
  };

  return (
    <html lang="en">
      <head>
        <title>Pixela Photography Club | Behind The Glass</title>
        <meta name="description" content="Explore stories frozen in time, crew portfolios, photography resources, and interact with Pixie, our RAG photography assistant." />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-background text-foreground antialiased transition-colors duration-300">
        <header className="fixed top-0 left-0 right-0 z-40 bg-background/70 backdrop-blur-md border-b border-border/40 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <NextLink href="/" className="flex items-center space-x-2 group">
                  <span className="text-xl font-bold tracking-tight text-foreground group-hover:opacity-85 transition-opacity">
                    Pixe<span className="pixela-gradient font-black">la</span>
                  </span>
                </NextLink>
              </div>

              {/* Navigation Items */}
              <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider">
                <NextLink href="/" className={`transition-colors py-1 ${isActive('/') ? 'text-foreground border-b border-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Home</NextLink>
                <NextLink href="/about" className={`transition-colors py-1 ${isActive('/about') ? 'text-foreground border-b border-foreground' : 'text-muted-foreground hover:text-foreground'}`}>About</NextLink>
                <NextLink href="/leadership" className={`transition-colors py-1 ${isActive('/leadership') ? 'text-foreground border-b border-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Leadership</NextLink>
                <NextLink href="/gallery" className={`transition-colors py-1 ${isActive('/gallery') ? 'text-foreground border-b border-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Gallery</NextLink>
                <NextLink href="/assistant" className={`transition-colors py-1 ${isActive('/assistant') ? 'text-foreground border-b border-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Pixie AI</NextLink>
                <NextLink href="/hire" className={`transition-colors py-1 ${isActive('/hire') ? 'text-foreground border-b border-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Hire Us</NextLink>
              </nav>

              {/* User Profiles / Access */}
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-3 bg-card/60 rounded-full py-1 pl-2 pr-3 border border-border/40">
                    <div className="h-6 w-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs text-foreground font-medium truncate max-w-[80px]">{user.name}</span>
                    {user.role === 'admin' && (
                      <NextLink href="/admin" className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30">
                        Admin
                      </NextLink>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                      title="Sign Out"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="text-xs bg-white text-black hover:bg-white/95 transition-colors font-bold px-5 py-2 rounded-full shadow-md cursor-pointer"
                  >
                    Join Club
                  </button>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center space-x-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-card border-b border-border/40 px-4 pt-2 pb-4 space-y-2">
              <NextLink href="/" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-sm ${isActive('/') ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>Home</NextLink>
              <NextLink href="/about" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-sm ${isActive('/about') ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>About</NextLink>
              <NextLink href="/leadership" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-sm ${isActive('/leadership') ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>Leadership</NextLink>
              <NextLink href="/gallery" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-sm ${isActive('/gallery') ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>Gallery</NextLink>
              <NextLink href="/assistant" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-sm ${isActive('/assistant') ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>Pixie AI</NextLink>
              <NextLink href="/hire" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-sm ${isActive('/hire') ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>Hire Us</NextLink>
              <div className="pt-2 border-t border-border/40">
                {user ? (
                  <div className="flex items-center justify-between py-2 text-sm text-foreground">
                    <span>{user.name}</span>
                    <button onClick={handleLogout} className="flex items-center text-red-500">
                      <LogOut className="h-4 w-4 mr-1" /> Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsLoginOpen(true);
                    }}
                    className="w-full bg-white text-black font-bold text-center py-2.5 rounded-full text-sm cursor-pointer"
                  >
                    Join Club
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Global wrapper with padding for header */}
        <main className="min-h-screen pt-16 relative z-10">
          {children}
        </main>

        <footer className="bg-card border-t border-border/40 py-12 relative z-10 text-muted-foreground transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 pb-6 border-b border-border/30">
              {/* Logo / Title */}
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  Pixe<span className="pixela-gradient font-black">la</span>
                </span>
              </div>
              {/* Footer Socials */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <a 
                  href="https://www.instagram.com/pixela.jpeg?igsh=dXl3eG94ejViNzBj" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-foreground transition-colors"
                >
                  Instagram
                </a>
                <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
                <a 
                  href="https://www.linkedin.com/company/pixelaphotographyclub/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-foreground transition-colors"
                >
                  LinkedIn
                </a>
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              </div>
            </div>
            {/* Copyright & Watermark */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-[11px] text-zinc-500">
              <p>© {new Date().getFullYear()} Pixela Photography Club. Behind the Glass.</p>
              <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400">
                <span>Designed by</span>
                <a 
                  href="https://portfolio-ojashva.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="watermark-signature text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] via-[#ff5e95] to-[#ffaa5e] animate-gradient-text hover:opacity-85 transition-opacity cursor-pointer"
                  title="Open Ojashva Bhikonde Portfolio"
                >
                  Ojashva Bhikonde
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* Dynamic Global Login Overlay Interceptor */}
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      </body>
    </html>
  );
}
