'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Heart, Download, Share2, Upload, X, Sliders, CheckCircle } from 'lucide-react';
import LoginModal from '@/components/LoginModal';

const CATEGORIES = [
  'All', 'Nature', 'Street', 'Portrait', 'Wildlife', 'Architecture', 'Macro', 'Drone', 'Events', 'Night', 'Black and White'
];

export default function GalleryPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Upload Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Nature');
  const [camera, setCamera] = useState('');
  const [lens, setLens] = useState('');
  const [aperture, setAperture] = useState('f/2.8');
  const [shutterSpeed, setShutterSpeed] = useState('1/125s');
  const [iso, setIso] = useState(400);
  const [focalLength, setFocalLength] = useState('50mm');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    // Set local token/user
    const savedToken = localStorage.getItem('pixela_token');
    const savedUser = localStorage.getItem('pixela_user');
    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));

    fetchPhotos();
  }, []);

  const fetchPhotos = () => {
    fetch('http://localhost:5000/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setPhotos(data);
        } else {
          setPhotos(MOCK_PHOTOS);
        }
      })
      .catch(() => {
        setPhotos(MOCK_PHOTOS);
      });
  };

  const handleUploadClick = () => {
    if (!token) {
      setIsLoginOpen(true);
    } else {
      setIsUploadOpen(true);
    }
  };

  const handleLike = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) {
      setIsLoginOpen(true);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/gallery/${photoId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Reload photos list
        fetchPhotos();
        if (selectedPhoto && selectedPhoto._id === photoId) {
          setSelectedPhoto((prev: any) => ({
            ...prev,
            likes: data.isLiked 
              ? [...prev.likes, user.id] 
              : prev.likes.filter((id: string) => id !== user.id)
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('camera', camera);
    formData.append('lens', lens);
    formData.append('aperture', aperture);
    formData.append('shutterSpeed', shutterSpeed);
    formData.append('iso', String(iso));
    formData.append('focalLength', focalLength);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      const res = await fetch('http://localhost:5000/api/gallery/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      
      setUploadSuccess(true);
      setTimeout(() => {
        setIsUploadOpen(false);
        setUploadSuccess(false);
        // Clear fields
        setTitle('');
        setDescription('');
        setCamera('');
        setLens('');
        setSelectedFile(null);
        fetchPhotos();
      }, 1500);
    } catch (err) {
      alert('Photo upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Filter photos by category
  const filteredPhotos = photos.filter(photo => 
    activeCategory === 'All' ? true : photo.category === activeCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-background">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/30">
        <div className="space-y-3">
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none select-none transition-all duration-700 hover:tracking-normal cursor-default">
            Behind the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5885ff] via-[#ff5e95] to-[#ffaa5e] animate-gradient-text drop-shadow-[0_0_20px_rgba(255,94,149,0.2)]">Glass</span>.
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm font-light max-w-xl leading-relaxed">
            Explore the intersection of light, shadow, and human experience. A curated collection of photographic moments captured by our global community.
          </p>
        </div>

        <button
          onClick={handleUploadClick}
          className="inline-flex items-center space-x-2 bg-white text-black font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Photo</span>
        </button>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        {/* Category filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] font-bold uppercase tracking-wider px-5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-[#dce4ec] text-[#080707]' 
                  : 'bg-zinc-900/60 border border-border/40 text-zinc-500 hover:text-white hover:border-white/10'
              }`}
            >
              {cat === 'All' ? 'All Collections' : cat}
            </button>
          ))}
        </div>

        {/* Sort indicator */}
        <div className="flex items-center text-[10px] font-bold text-zinc-500 tracking-widest uppercase cursor-pointer hover:text-white transition-colors">
          <span>Sort By Recent</span>
          <span className="ml-1 text-[8px] font-bold">▼</span>
        </div>
      </div>

      {/* Masonry Photographs Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-24 text-zinc-650 space-y-2 border border-dashed border-border/40 rounded-lg">
          <ImageIcon className="h-8 w-8 mx-auto text-zinc-700" />
          <p className="text-xs">No photos found under this category.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 pt-6">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo._id || index}
              onClick={() => setSelectedPhoto(photo)}
              className="break-inside-avoid relative overflow-hidden rounded bg-card border border-border/40 group cursor-pointer hover:border-white/20 transition-all duration-300 shadow-md"
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-left">
                <span className="text-[9px] bg-zinc-900/80 text-zinc-300 px-2 py-0.5 rounded-sm w-max mb-1.5 font-medium tracking-wider uppercase font-mono border border-white/5">
                  {photo.category}
                </span>
                <h4 className="font-bold text-white text-sm leading-tight truncate">{photo.title}</h4>
                <p className="text-[10px] text-zinc-450 mt-0.5">By {photo.photographer?.name || 'Pixela Crew'}</p>
                
                {/* Meta options overlay */}
                <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-2 text-zinc-300 text-[10px]">
                  <button 
                    onClick={(e) => handleLike(photo._id, e)}
                    className="flex items-center space-x-1.5 hover:text-white"
                  >
                    <Heart className={`h-3.5 w-3.5 ${photo.likes?.includes(user?.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{photo.likes?.length || 0}</span>
                  </button>
                  <span className="text-[9px] text-zinc-450 uppercase font-mono">{photo.camera || 'Sony'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ready to showcase your work bottom CTA */}
      <div className="text-center py-20 border-t border-border/30 mt-20 space-y-6">
        <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Ready to showcase your work?</h3>
        <div className="flex justify-center items-center gap-4">
          <button 
            onClick={handleUploadClick}
            className="px-8 py-3 rounded-full bg-white text-black hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
          >
            Submit Portfolio
          </button>
          <button 
            onClick={() => alert("FAQ section coming soon!")}
            className="px-8 py-3 rounded-full bg-transparent border border-white/20 text-white hover:bg-white/5 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            View FAQ
          </button>
        </div>
      </div>

      {/* Image Details Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded glass-panel border border-white/10 flex flex-col md:flex-row shadow-2xl">
            {/* Left Image half */}
            <div className="md:w-3/5 bg-zinc-950 flex items-center justify-center min-h-[300px] md:max-h-[500px]">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-w-full max-h-[500px] object-contain"
              />
            </div>

            {/* Right details half */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between text-white space-y-6">
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-sm w-max font-medium tracking-wider uppercase font-mono">
                    {selectedPhoto.category}
                  </span>
                  <h2 className="text-xl font-bold tracking-tight mt-2">{selectedPhoto.title}</h2>
                  <p className="text-zinc-400 text-xs mt-1 font-light leading-relaxed">
                    {selectedPhoto.description || 'No description provided.'}
                  </p>
                </div>

                <div className="border-t border-zinc-900 pt-4 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-semibold">Photographer</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold">
                      {(selectedPhoto.photographer?.name || 'P').charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{selectedPhoto.photographer?.name || 'Pixela Crew'}</span>
                  </div>
                </div>

                {/* EXIF Data Panel */}
                <div className="border-t border-zinc-900 pt-4 space-y-3">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center space-x-1.5 font-semibold">
                    <Sliders className="h-3.5 w-3.5 text-primary" />
                    <span>EXIF Parameters / Settings</span>
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-background p-2 rounded border border-border/40">
                      <p className="text-zinc-500 text-[10px]">Camera Body</p>
                      <p className="text-zinc-300 font-medium truncate mt-0.5">{selectedPhoto.camera || 'Sony Alpha'}</p>
                    </div>
                    <div className="bg-background p-2 rounded border border-border/40">
                      <p className="text-zinc-500 text-[10px]">Lens Attachment</p>
                      <p className="text-zinc-300 font-medium truncate mt-0.5">{selectedPhoto.lens || 'Sony G Master'}</p>
                    </div>
                    <div className="bg-background p-2 rounded border border-border/40">
                      <p className="text-zinc-500 text-[10px]">Aperture / ISO</p>
                      <p className="text-zinc-300 font-medium mt-0.5">{selectedPhoto.settings?.aperture || 'f/2.8'} • ISO {selectedPhoto.settings?.iso || 400}</p>
                    </div>
                    <div className="bg-background p-2 rounded border border-border/40">
                      <p className="text-zinc-500 text-[10px]">Shutter / Focal</p>
                      <p className="text-zinc-300 font-medium mt-0.5">{selectedPhoto.settings?.shutterSpeed || '1/125s'} • {selectedPhoto.settings?.focalLength || '50mm'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Handles */}
              <div className="flex items-center space-x-3 border-t border-zinc-900 pt-4">
                <button
                  onClick={(e) => handleLike(selectedPhoto._id, e)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-805 rounded text-xs font-semibold transition-colors"
                >
                  <Heart className={`h-4 w-4 ${selectedPhoto.likes?.includes(user?.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>Like ({selectedPhoto.likes?.length || 0})</span>
                </button>
                <a
                  href={selectedPhoto.imageUrl}
                  download={selectedPhoto.title}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-805 rounded transition-colors"
                  title="Download Image"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => alert('Link copied to clipboard!')}
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-805 rounded transition-colors"
                  title="Share Photograph"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal Drawer */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-lg glass-panel border border-white/10 p-6 text-white shadow-2xl">
            <button 
              onClick={() => setIsUploadOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold tracking-tight mb-4">Upload Photograph</h2>

            {uploadSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <h3 className="font-bold text-lg">Upload Successful!</h3>
                <p className="text-zinc-400 text-xs">Waiting for admin panel approval.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Image File</label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-1.5 px-3 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Skyline Frame"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-1.5 px-3 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-1.5 px-3 text-xs text-zinc-300 focus:outline-none focus:border-primary"
                    >
                      {CATEGORIES.slice(1).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Camera Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Sony A7 III"
                      value={camera}
                      onChange={(e) => setCamera(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-1.5 px-3 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Lens Description</label>
                    <input
                      type="text"
                      placeholder="e.g. FE 50mm f/1.8"
                      value={lens}
                      onChange={(e) => setLens(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-1.5 px-3 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 bg-zinc-900/30 p-3 rounded-md border border-zinc-800/50">
                  <div>
                    <label className="block text-[9px] text-zinc-400 uppercase">Aperture</label>
                    <input
                      type="text"
                      value={aperture}
                      onChange={(e) => setAperture(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-sm py-1 px-1.5 text-[10px] text-center focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-zinc-400 uppercase">Shutter</label>
                    <input
                      type="text"
                      value={shutterSpeed}
                      onChange={(e) => setShutterSpeed(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-sm py-1 px-1.5 text-[10px] text-center focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-zinc-400 uppercase">ISO</label>
                    <input
                      type="number"
                      value={iso}
                      onChange={(e) => setIso(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-sm py-1 px-1.5 text-[10px] text-center focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-zinc-400 uppercase">Focal L.</label>
                    <input
                      type="text"
                      value={focalLength}
                      onChange={(e) => setFocalLength(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-sm py-1 px-1.5 text-[10px] text-center focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full pixela-gradient-bg hover:opacity-90 text-white font-medium py-2 rounded-md text-sm transition-colors mt-2"
                >
                  {uploading ? 'Uploading Frame...' : 'Submit to Admin Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global Login Interceptor wrapper */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={(newToken, newUser) => {
          setToken(newToken);
          setUser(newUser);
          setIsUploadOpen(true);
        }}
      />
    </div>
  );
}

// Fallback Mock Data
const MOCK_PHOTOS = [
  {
    _id: '1',
    title: 'Himalayan Ridge',
    category: 'Nature',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    photographer: { name: 'Aarav Sharma' },
    camera: 'Sony A7R III',
    lens: 'FE 24-75mm f/2.8 GM',
    settings: { aperture: 'f/8', shutterSpeed: '1/250s', iso: 100, focalLength: '24mm' },
    likes: [],
  },
  {
    _id: '2',
    title: 'Rainy Neon Reflex',
    category: 'Street',
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop&q=80',
    photographer: { name: 'Rohan Mehra' },
    camera: 'Sony A7 III',
    lens: 'FE 50mm f/1.8',
    settings: { aperture: 'f/1.8', shutterSpeed: '1/160s', iso: 800, focalLength: '50mm' },
    likes: [],
  },
  {
    _id: '3',
    title: 'Aperture Geometry',
    category: 'Architecture',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    photographer: { name: 'Nisha Verma' },
    camera: 'Canon EOS R5',
    lens: 'RF 24-70mm f/2.8 L',
    settings: { aperture: 'f/2.8', shutterSpeed: '1/125s', iso: 400, focalLength: '35mm' },
    likes: [],
  }
];
