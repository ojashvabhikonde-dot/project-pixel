'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Calendar, Image as ImageIcon, Users, BookOpen, AlertCircle, 
  Check, X, Send, Database, BarChart3, UserPlus, Trash2, Search, Filter, 
  ShieldAlert, Sparkles, Edit3, UserCheck, Shield
} from 'lucide-react';
import { API_URL } from '@/config/api';

export default function AdminPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<any[]>([]);
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  
  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
    department: 'Information Technology',
    semester: 6,
    year: '3rd Year',
    specialization: 'Visual Creator & Photographer',
    bio: '',
    avatarUrl: ''
  });
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [userSuccessMessage, setUserSuccessMessage] = useState('');

  // RAG Chatbot Seeder state
  const [kbTitle, setKbTitle] = useState('');
  const [kbContent, setKbContent] = useState('');
  const [kbCategory, setKbCategory] = useState('Camera Settings');
  const [kbSuccess, setKbSuccess] = useState(false);

  // Authentication
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pixela_token');
    const savedUser = localStorage.getItem('pixela_user');
    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));

    if (savedToken) {
      loadAdminData(savedToken);

      // Auto-sync admin panel every 5 seconds
      const pollInterval = setInterval(() => {
        loadAdminData(savedToken, true);
      }, 5000);

      const onFocus = () => loadAdminData(savedToken, true);
      window.addEventListener('focus', onFocus);
      window.addEventListener('visibilitychange', onFocus);

      return () => {
        clearInterval(pollInterval);
        window.removeEventListener('focus', onFocus);
        window.removeEventListener('visibilitychange', onFocus);
      };
    } else {
      setLoading(false);
    }
  }, []);

  const loadAdminData = async (authToken: string, isBackgroundSync = false) => {
    if (!isBackgroundSync) setLoading(true);
    try {
      // 1. Fetch bookings
      const bookingsRes = await fetch(`${API_URL}/api/bookings`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }

      // 2. Fetch pending photos
      const photosRes = await fetch(`${API_URL}/api/gallery/pending`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (photosRes.ok) {
        const photosData = await photosRes.json();
        setPendingPhotos(photosData);
      }

      // 3. Fetch pending members
      const membersRes = await fetch(`${API_URL}/api/members/pending`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setPendingMembers(membersData);
      }

      // 4. Fetch ALL users in the database (Admins, Leaders, Crew, Members)
      const usersRes = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAllUsers(usersData || []);
      } else {
        // Fallback to members if /users fails
        const fallbackRes = await fetch(`${API_URL}/api/members`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setAllUsers(fallbackData || []);
        }
      }
    } catch (err) {
      console.error('Failed to load admin panel data', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Super Admin User Operations ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim() || !token) return;

    setIsSubmittingUser(true);
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      const data = await res.json();
      if (res.ok) {
        setUserSuccessMessage(`Successfully added ${newUser.name} with role "${newUser.role}"!`);
        setShowAddUserModal(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'member',
          department: 'Information Technology',
          semester: 6,
          year: '3rd Year',
          specialization: 'Visual Creator & Photographer',
          bio: '',
          avatarUrl: ''
        });
        loadAdminData(token);
        setTimeout(() => setUserSuccessMessage(''), 4000);
      } else {
        alert(data.error || 'Failed to add user.');
      }
    } catch (err: any) {
      alert(`Error creating user: ${err.message}`);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (targetUser: any) => {
    const targetId = targetUser._id || targetUser.id;
    const isRootAdmin = targetUser.email?.toLowerCase() === 'pixela@oriental.ac.in';
    
    if (isRootAdmin) {
      alert('The Primary Super Admin root account (pixela@oriental.ac.in) cannot be deleted for security purposes.');
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete user "${targetUser.name}" (${targetUser.email}) from the database?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/${targetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setAllUsers(prev => prev.filter(u => (u._id !== targetId && u.id !== targetId)));
        setUserSuccessMessage(`User "${targetUser.name}" deleted successfully.`);
        setTimeout(() => setUserSuccessMessage(''), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user.');
      }
    } catch (err: any) {
      alert(`Error deleting user: ${err.message}`);
    }
  };

  const handleChangeRole = async (targetId: string, newRole: string) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${targetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        setAllUsers(prev => prev.map(u => (u._id === targetId || u.id === targetId) ? { ...u, role: newRole } : u));
      } else {
        alert('Failed to update user role.');
      }
    } catch (err) {
      alert('Network error while changing role.');
    }
  };

  const handleApprovePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/gallery/${photoId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPendingPhotos(prev => prev.filter(p => p._id !== photoId));
      }
    } catch (err) {
      alert('Failed to approve photograph.');
    }
  };

  const handleApproveMember = async (memberId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/members/${memberId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPendingMembers(prev => prev.filter(m => m._id !== memberId));
        loadAdminData(token || '');
      }
    } catch (err) {
      alert('Failed to approve crew member.');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status } : b));
      }
    } catch (err) {
      alert('Failed to update booking status.');
    }
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbTitle.trim() || !kbContent.trim() || !token) return;

    try {
      const res = await fetch(`${API_URL}/api/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: kbTitle, content: kbContent, category: kbCategory })
      });

      setKbSuccess(true);
      setTimeout(() => {
        setKbSuccess(false);
        setKbTitle('');
        setKbContent('');
      }, 1500);
    } catch (err) {
      alert('Failed to add knowledge.');
    }
  };

  const isSuperAdmin = user?.email?.toLowerCase() === 'pixela@oriental.ac.in' || user?.role === 'admin' || user?.role === 'president';

  if (!token || !isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-zinc-400 font-light">
          Only approved Pixela Administrators or Super Admin (pixela@oriental.ac.in) can view the database analytics dashboard.
        </p>
      </div>
    );
  }

  // Filtered Users List
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.specialization || '').toLowerCase().includes(userSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (userRoleFilter === 'all') return true;
    if (userRoleFilter === 'admin') return u.role === 'admin';
    if (userRoleFilter === 'leader') return ['president', 'vice_president', 'tech_head'].includes(u.role);
    if (userRoleFilter === 'crew') return ['member', 'crew'].includes(u.role);
    return u.role === userRoleFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono bg-primary/10 border border-primary/30 px-2.5 py-0.5 rounded-full">
              Super Admin Authority
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center space-x-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <span>Admin Command Panel</span>
          </h1>
          <p className="text-xs text-zinc-400 font-light">
            Full root control: Add, edit, or delete any user, booking, photo approval, and AI RAG knowledge.
          </p>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl pixela-gradient-bg text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20 shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New User / Leader</span>
        </button>
      </div>

      {/* Success Alert Banner */}
      {userSuccessMessage && (
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex items-center space-x-3 text-green-400 text-xs font-semibold animate-in fade-in duration-300">
          <Check className="h-4 w-4 shrink-0" />
          <span>{userSuccessMessage}</span>
        </div>
      )}

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-card border border-border/40 p-5 rounded-xl flex items-center space-x-4 shadow-sm">
          <Users className="h-8 w-8 text-primary shrink-0" />
          <div>
            <h3 className="text-2xl font-black text-white">{allUsers.length}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Total System Users</p>
          </div>
        </div>
        <div className="bg-card border border-border/40 p-5 rounded-xl flex items-center space-x-4 shadow-sm">
          <Calendar className="h-8 w-8 text-primary shrink-0" />
          <div>
            <h3 className="text-2xl font-black text-white">{bookings.length}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Shoot Bookings</p>
          </div>
        </div>
        <div className="bg-card border border-border/40 p-5 rounded-xl flex items-center space-x-4 shadow-sm">
          <ImageIcon className="h-8 w-8 text-primary shrink-0" />
          <div>
            <h3 className="text-2xl font-black text-white">{pendingPhotos.length}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Pending Gallery Prints</p>
          </div>
        </div>
        <div className="bg-card border border-border/40 p-5 rounded-xl flex items-center space-x-4 shadow-sm">
          <ShieldAlert className="h-8 w-8 text-secondary shrink-0" />
          <div>
            <h3 className="text-2xl font-black text-white">{pendingMembers.length}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Pending Requests</p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SUPER ADMIN COMPLETE USER & CREW MANAGEMENT ROSTER
          ========================================================================= */}
      <section className="bg-card border border-border/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-white">Full User & Leadership Database</h2>
              <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-mono font-bold">
                {filteredUsers.length}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-light mt-1">
              Super Admin full privileges: Add, edit role, or permanently delete any user or leader from MongoDB.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search name, email, dept..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 space-x-1 text-[11px]">
              {['all', 'admin', 'leader', 'crew'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setUserRoleFilter(tab)}
                  className={`px-3 py-1 rounded-md font-medium uppercase text-[10px] tracking-wider transition-colors capitalize ${
                    userRoleFilter === tab ? 'bg-primary text-primary-foreground font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab === 'all' ? 'All Users' : tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table / Grid */}
        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center space-y-2 border border-dashed border-border/40 rounded-xl">
            <Users className="h-8 w-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-400">No matching users found.</p>
            <p className="text-xs text-zinc-600 font-light">Try adjusting your search query or role filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => {
              const isRootAdmin = u.email?.toLowerCase() === 'pixela@oriental.ac.in';
              const avatar = u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

              return (
                <div
                  key={u._id || u.id}
                  className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-zinc-700 transition-colors shadow-sm relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-zinc-950 overflow-hidden border border-zinc-700 shrink-0">
                        <img src={avatar} alt={u.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-white text-sm truncate">{u.name}</h4>
                          {isRootAdmin && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                              ROOT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono truncate">{u.email}</p>
                        <p className="text-[10px] text-primary font-mono truncate">{u.specialization || 'Visual Creator'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-400 bg-zinc-950/60 p-2 rounded-lg space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Dept:</span>
                      <span className="font-medium text-zinc-300 truncate">{u.department || 'IT'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Year / Sem:</span>
                      <span className="font-medium text-zinc-300">{u.year || '1st Year'} ({u.semester || 1} Sem)</span>
                    </div>
                  </div>

                  {/* Super Admin Action Bar: Role Dropdown + Delete Button */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/60">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <span className="text-[9px] text-zinc-500 uppercase font-mono">Role:</span>
                      {isRootAdmin ? (
                        <span className="text-[10px] font-bold text-primary uppercase font-mono">Super Admin</span>
                      ) : (
                        <select
                          value={u.role || 'member'}
                          onChange={(e) => handleChangeRole(u._id || u.id, e.target.value)}
                          className="bg-zinc-950 border border-zinc-700 text-white rounded px-2 py-0.5 text-[10px] font-medium focus:outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="admin">Admin</option>
                          <option value="president">President</option>
                          <option value="vice_president">Vice President</option>
                          <option value="tech_head">Tech Head</option>
                          <option value="crew">Crew Member</option>
                          <option value="member">General Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )}
                    </div>

                    {!isRootAdmin && (
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="inline-flex items-center space-x-1 p-1.5 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors border border-red-800/50 text-[10px] font-semibold cursor-pointer shrink-0"
                        title="Delete User from Database"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Approvals & Bookings & RAG Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Approvals lists */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Booking Notifications / Alerts */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Event Booking Mail Alerts</span>
            </h3>
            
            {bookings.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No event bookings received yet.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{booking.eventType}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Venue: {booking.venue} • Date: {new Date(booking.eventDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-semibold border ${
                        booking.status === 'accepted' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : booking.status === 'declined'
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : 'bg-primary/10 text-primary border-primary/20 animate-pulse'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed font-light bg-zinc-950 p-2 rounded">
                      {booking.details || 'No additional requirements specified.'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                      <span>Client: {booking.clientName} ({booking.clientEmail})</span>
                      
                      {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleUpdateBookingStatus(booking._id, 'accepted')}
                            className="bg-green-600 hover:bg-green-500 text-white p-1 rounded transition-colors"
                            title="Accept request"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => handleUpdateBookingStatus(booking._id, 'declined')}
                            className="bg-red-600 hover:bg-red-500 text-white p-1 rounded transition-colors"
                            title="Decline request"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Pending Gallery Approvals */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <span>Pending Gallery Approvals</span>
            </h3>

            {pendingPhotos.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No photographs waiting for review.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingPhotos.map((photo) => (
                  <div key={photo._id} className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl overflow-hidden flex flex-col justify-between">
                    <img src={photo.imageUrl} alt={photo.title} className="w-full h-32 object-cover" />
                    <div className="p-3 space-y-2">
                      <div>
                        <h4 className="font-bold text-white text-xs truncate">{photo.title}</h4>
                        <p className="text-[9px] text-zinc-400 mt-0.5">By {photo.photographer?.name} • Category: {photo.category}</p>
                      </div>
                      <div className="flex space-x-2 pt-1.5 border-t border-zinc-800/50">
                        <button
                          onClick={() => handleApprovePhoto(photo._id)}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white py-1 rounded text-[10px] font-semibold transition-colors flex items-center justify-center space-x-1"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve Print</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Pending Members Registrations */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Crew Access Requests ({pendingMembers.length})</span>
            </h3>

            {pendingMembers.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No pending member registrations.</p>
            ) : (
              <div className="space-y-3">
                {pendingMembers.map((member) => (
                  <div key={member._id} className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white text-xs">{member.name}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{member.department} • {member.year} ({member.semester} Sem)</p>
                      <p className="text-[9px] text-secondary font-semibold uppercase mt-0.5">{member.role}</p>
                    </div>
                    <button
                      onClick={() => handleApproveMember(member._id)}
                      className="bg-primary hover:opacity-90 text-primary-foreground py-1 px-4 rounded-md text-[10px] font-semibold transition-opacity flex items-center space-x-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve Access</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: RAG Bot Knowledge Seeder */}
        <div className="lg:col-span-4 bg-card border border-border/40 rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full pixela-gradient-bg opacity-5 blur-2xl pointer-events-none" />
          
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Pixie RAG Knowledge Seeder</span>
          </h3>

          <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
            Directly insert verified photography facts and guides into MongoDB. Pixie references this knowledge to answer user queries with high accuracy.
          </p>

          {kbSuccess ? (
            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl text-center space-y-2">
              <Check className="h-8 w-8 text-green-500 mx-auto" />
              <p className="text-xs text-white font-semibold">Knowledge Added Successfully!</p>
            </div>
          ) : (
            <form onSubmit={handleAddKnowledge} className="space-y-3">
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Snippet Title / Concept</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leading Lines Guide"
                  value={kbTitle}
                  onChange={(e) => setKbTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-1.5 px-3 text-xs focus:outline-none focus:border-primary text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Topic Category</label>
                <select
                  value={kbCategory}
                  onChange={(e) => setKbCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-1.5 px-3 text-xs text-zinc-300 focus:outline-none focus:border-primary"
                >
                  <option value="Camera Settings">Camera Settings</option>
                  <option value="Composition">Composition</option>
                  <option value="Editing">Editing & Presets</option>
                  <option value="Gear Recommendations">Gear Recommendations</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Fact Content / Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Insert the photography or filmmaking fact here. Keep it concise, clear, and factual..."
                  value={kbContent}
                  onChange={(e) => setKbContent(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-1.5 px-3 text-xs focus:outline-none focus:border-primary text-white resize-none font-light"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-md pixela-gradient-bg text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Seed AI Knowledge Base</span>
              </button>
            </form>
          )}
        </div>

      </div>

      {/* =========================================================================
          ADD USER / LEADER MODAL
          ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border/80 w-full max-w-lg rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-white">Add New User or Leader</h3>
              </div>
              <p className="text-xs text-zinc-400 font-light">
                Directly provision a new account with custom role, credentials, and auto-approval.
              </p>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@pixela.club"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Default: pixela@2026"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Assigned Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="member">General Member</option>
                    <option value="crew">Crew Member (Active Roster)</option>
                    <option value="president">President</option>
                    <option value="vice_president">Vice President</option>
                    <option value="tech_head">Tech Head</option>
                    <option value="admin">Administrator</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. IT, CS, EC"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={newUser.semester}
                    onChange={(e) => setNewUser({ ...newUser, semester: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Year</label>
                  <select
                    value={newUser.year}
                    onChange={(e) => setNewUser({ ...newUser, year: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Specialization / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Wildlife Cinematographer, Portrait Specialist"
                  value={newUser.specialization}
                  onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Avatar / Photo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. /ojashva.jpg or https://images.unsplash.com/..."
                  value={newUser.avatarUrl}
                  onChange={(e) => setNewUser({ ...newUser, avatarUrl: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Bio</label>
                <textarea
                  rows={2}
                  placeholder="Short bio or description..."
                  value={newUser.bio}
                  onChange={(e) => setNewUser({ ...newUser, bio: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary resize-none font-light"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-5 py-2 rounded-xl pixela-gradient-bg text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isSubmittingUser ? 'Adding...' : 'Add User Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
