'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Calendar, Image as ImageIcon, Users, BookOpen, AlertCircle,
  Check, X, Send, Database, BarChart3, UserPlus, Trash2, Search, Filter,
  ShieldAlert, Sparkles, Edit3, UserCheck, Shield, Award, Star, Camera,
  Zap, CheckCircle2, Sliders, ExternalLink, Plus, FileText, Download,
  Copy, RefreshCw, Table, FileCode, UploadCloud, FileUp
} from 'lucide-react';
import { API_URL } from '@/config/api';
import { exportAllRegistrationsPdf, exportCrewMemberDossierPdf } from '@/utils/pdfExport';

const AVAILABLE_BADGES = [
  'Verified Crew',
  'Prime Shooter',
  'Event Lead',
  'Cinematographer',
  'Drone Pilot',
  'Exhibition Curator',
  'Tech Head',
  'Lighting Specialist',
  'Lead Editor',
  'Portrait Master',
  'Top Contributor'
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'trackRecords' | 'tableFile'>('dashboard');
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
    instagramUrl: '',
    bio: '',
    avatarUrl: '',
    tenureYear: '2025-2026',
    pastRole: 'Ex Prime',
    currentProfession: 'Senior Media Director',
    designation: 'Faculty Coordinator'
  });
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [userSuccessMessage, setUserSuccessMessage] = useState('');

  // Bulk Crew Upload State (PDF / CSV / JSON)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploadingCrew, setIsUploadingCrew] = useState(false);
  const [bulkRole, setBulkRole] = useState('crew');
  const [bulkDept, setBulkDept] = useState('Information Technology');
  const [bulkYear, setBulkYear] = useState('3rd Year');
  const [bulkSemester, setBulkSemester] = useState(6);
  const [bulkUploadResult, setBulkUploadResult] = useState<any | null>(null);

  // Fast Approvals state
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [pendingSearch, setPendingSearch] = useState('');

  // Track Record Management Modal state
  const [selectedCrewForTrackRecord, setSelectedCrewForTrackRecord] = useState<any | null>(null);
  const [isSavingTrackRecord, setIsSavingTrackRecord] = useState(false);
  const [trackRecordForm, setTrackRecordForm] = useState<{
    cameraBody: string;
    primaryLens: string;
    secondaryLens: string;
    accessories: string;
    badges: string[];
    performanceRating: number;
    trackRecordNotes: string;
    specialization: string;
    newEventName: string;
    newEventRole: string;
    newEventDate: string;
    newEventLocation: string;
    newEventNotes: string;
  }>({
    cameraBody: '',
    primaryLens: '',
    secondaryLens: '',
    accessories: '',
    badges: ['Verified Crew'],
    performanceRating: 5,
    trackRecordNotes: '',
    specialization: 'Visual Creator',
    newEventName: '',
    newEventRole: 'Lead Shooter',
    newEventDate: '',
    newEventLocation: 'Campus',
    newEventNotes: ''
  });

  // RAG Chatbot Seeder state
  const [kbTitle, setKbTitle] = useState('');
  const [kbContent, setKbContent] = useState('');
  const [kbCategory, setKbCategory] = useState('Camera Settings');
  const [kbSuccess, setKbSuccess] = useState(false);

  // Persistent Registration Table File state
  const [tableMarkdown, setTableMarkdown] = useState<string>('');
  const [tableTotal, setTableTotal] = useState<number>(0);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [isSyncingFile, setIsSyncingFile] = useState<boolean>(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState<boolean>(false);
  const [viewRawMarkdown, setViewRawMarkdown] = useState<boolean>(false);

  // Authentication
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

    if (savedToken) {
      loadAdminData(savedToken);
      loadTableData(savedToken);

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

  const loadTableData = async (authToken?: string) => {
    const activeAuth = authToken || token;
    if (!activeAuth) return;
    setTableLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/registrations-table?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${activeAuth}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTableMarkdown(data.markdown || '');
        setTableTotal(data.totalCount || 0);
      }
    } catch (e) {
      console.error('Failed to fetch registrations table:', e);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSyncFileStorage = async () => {
    if (!token) return;
    setIsSyncingFile(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/sync-registrations-file`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserSuccessMessage(`⚡ ${data.message || 'File storage synchronized successfully!'}`);
        setTimeout(() => setUserSuccessMessage(''), 4000);
        await loadTableData(token);
        if (token) loadAdminData(token, true);
      }
    } catch (e) {
      console.error('Sync failed:', e);
    } finally {
      setIsSyncingFile(false);
    }
  };

  const handleDownloadCsv = () => {
    window.open(`${API_URL}/api/admin/registrations-csv`, '_blank');
  };

  const handleCopyMarkdown = () => {
    if (!tableMarkdown) return;
    navigator.clipboard.writeText(tableMarkdown);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const loadAdminData = async (authToken: string, isBackgroundSync = false) => {
    if (!isBackgroundSync) setLoading(true);
    try {
      // 1. Fetch bookings
      const bookingsRes = await fetch(`${API_URL}/api/bookings?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }

      // 2. Fetch pending photos
      const photosRes = await fetch(`${API_URL}/api/gallery/pending?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (photosRes.ok) {
        const photosData = await photosRes.json();
        setPendingPhotos(photosData);
      }

      // 3. Fetch pending members
      const membersRes = await fetch(`${API_URL}/api/members/pending?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setPendingMembers(membersData);
      }

      // 4. Fetch ALL users in the database
      const usersRes = await fetch(`${API_URL}/api/users?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAllUsers(usersData || []);
      } else {
        const fallbackRes = await fetch(`${API_URL}/api/members?t=${Date.now()}`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setAllUsers(fallbackData || []);
        }
      }
    } catch (err) {
      console.error('Failed to load admin panel data', err);
    } finally {
      if (!isBackgroundSync) setLoading(false);
    }
  };

  // ⚡ 1-Click Fast Approval of Individual Member (Optimistic UI)
  const handleApproveMember = async (memberId: string) => {
    // Optimistic UI update
    setPendingMembers(prev => prev.filter(m => (m._id !== memberId && m.id !== memberId)));
    setAllUsers(prev => prev.map(u => (u._id === memberId || u.id === memberId) ? { ...u, isApproved: true } : u));
    setUserSuccessMessage('Member access approved and synced with roster!');
    setTimeout(() => setUserSuccessMessage(''), 3000);

    try {
      await fetch(`${API_URL}/api/members/${memberId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isApproved: true })
      });
    } catch (err) {
      console.error('Failed to approve member:', err);
    }
  };

  // ⚡ 1-Click Fast Decline / Reject of Member (Optimistic UI)
  const handleDeclineMember = async (memberId: string) => {
    // Optimistic UI update
    setPendingMembers(prev => prev.filter(m => (m._id !== memberId && m.id !== memberId)));
    setUserSuccessMessage('Member request declined.');
    setTimeout(() => setUserSuccessMessage(''), 3000);

    try {
      await fetch(`${API_URL}/api/members/${memberId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Failed to decline member:', err);
    }
  };

  // ⚡ 1-Click Mass / Bulk Approval for all pending requests
  const handleBulkApprovePending = async () => {
    if (pendingMembers.length === 0) return;
    setIsBulkApproving(true);

    const pendingIds = pendingMembers.map(m => m._id || m.id);
    // Optimistically update
    setPendingMembers([]);
    setAllUsers(prev => prev.map(u => pendingIds.includes(u._id || u.id) ? { ...u, isApproved: true } : u));
    setUserSuccessMessage(`⚡ Approved all ${pendingIds.length} pending request(s)!`);
    setTimeout(() => setUserSuccessMessage(''), 4000);

    try {
      await fetch(`${API_URL}/api/members/bulk-approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userIds: pendingIds })
      });
    } catch (err) {
      console.error('Bulk approval failed:', err);
    } finally {
      setIsBulkApproving(false);
    }
  };

  // --- Track Record Editor Handlers ---
  const handleOpenTrackRecordModal = (member: any) => {
    setSelectedCrewForTrackRecord(member);
    setTrackRecordForm({
      cameraBody: member.gear?.cameraBody || '',
      primaryLens: member.gear?.primaryLens || '',
      secondaryLens: member.gear?.secondaryLens || '',
      accessories: Array.isArray(member.gear?.accessories) ? member.gear.accessories.join(', ') : '',
      badges: Array.isArray(member.badges) && member.badges.length > 0 ? member.badges : ['Verified Crew'],
      performanceRating: member.performanceRating || 5,
      trackRecordNotes: member.trackRecordNotes || '',
      specialization: member.specialization || 'Visual Creator',
      newEventName: '',
      newEventRole: 'Lead Shooter',
      newEventDate: new Date().toISOString().split('T')[0],
      newEventLocation: 'Oriental Campus',
      newEventNotes: ''
    });
  };

  const handleToggleBadge = (badge: string) => {
    setTrackRecordForm(prev => {
      const exists = prev.badges.includes(badge);
      if (exists) {
        return { ...prev, badges: prev.badges.filter(b => b !== badge) };
      }
      return { ...prev, badges: [...prev.badges, badge] };
    });
  };

  const handleSaveTrackRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrewForTrackRecord || !token) return;

    setIsSavingTrackRecord(true);
    const memberId = selectedCrewForTrackRecord._id || selectedCrewForTrackRecord.id;

    // Build event covered list if new event was filled
    const currentEvents = Array.isArray(selectedCrewForTrackRecord.eventsCovered) ? [...selectedCrewForTrackRecord.eventsCovered] : [];
    if (trackRecordForm.newEventName.trim()) {
      currentEvents.unshift({
        eventName: trackRecordForm.newEventName.trim(),
        role: trackRecordForm.newEventRole.trim() || 'Lead Shooter',
        date: trackRecordForm.newEventDate ? new Date(trackRecordForm.newEventDate) : new Date(),
        location: trackRecordForm.newEventLocation.trim() || 'Campus',
        notes: trackRecordForm.newEventNotes.trim()
      });
    }

    const accessoriesList = trackRecordForm.accessories
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);

    const payload = {
      gear: {
        cameraBody: trackRecordForm.cameraBody.trim(),
        primaryLens: trackRecordForm.primaryLens.trim(),
        secondaryLens: trackRecordForm.secondaryLens.trim(),
        accessories: accessoriesList
      },
      badges: trackRecordForm.badges,
      performanceRating: Number(trackRecordForm.performanceRating) || 5,
      trackRecordNotes: trackRecordForm.trackRecordNotes.trim(),
      specialization: trackRecordForm.specialization.trim(),
      eventsCovered: currentEvents
    };

    try {
      const res = await fetch(`${API_URL}/api/members/${memberId}/track-record`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        // Update state in allUsers
        setAllUsers(prev => prev.map(u => (u._id === memberId || u.id === memberId) ? { ...u, ...payload, eventsCovered: currentEvents } : u));
        setUserSuccessMessage(`Track record saved for ${selectedCrewForTrackRecord.name}!`);
        setSelectedCrewForTrackRecord(null);
        setTimeout(() => setUserSuccessMessage(''), 3500);
      } else {
        alert('Failed to save track record.');
      }
    } catch (err: any) {
      alert(`Error saving track record: ${err.message}`);
    } finally {
      setIsSavingTrackRecord(false);
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
          department: '',
          semester: 6,
          year: '3rd Year',
          instagramUrl: '',
          bio: '',
          avatarUrl: '',
          tenureYear: '2025-2026',
          pastRole: 'Ex Prime',
          currentProfession: 'Senior Media Director',
          designation: 'Faculty Coordinator'
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

  // 📤 1-Click Bulk Crew Upload & Auto-Approval Handler
  const handleBulkUploadCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a roster file (.pdf, .csv, .json, or .txt) to upload.');
      return;
    }
    if (!token) return;

    setIsUploadingCrew(true);
    setBulkUploadResult(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('defaultRole', bulkRole);
    formData.append('defaultDept', bulkDept);
    formData.append('defaultYear', bulkYear);
    formData.append('defaultSemester', String(bulkSemester));

    try {
      const res = await fetch(`${API_URL}/api/admin/bulk-upload-crew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setBulkUploadResult(data);
        setUserSuccessMessage(`⚡ ${data.message || `Successfully processed and auto-approved ${data.count} crew members!`}`);
        loadAdminData(token);
        loadTableData(token);
        setTimeout(() => setUserSuccessMessage(''), 8000);
      } else {
        alert(data.error || 'Failed to process crew roster upload.');
      }
    } catch (err: any) {
      alert(`Error during bulk crew upload: ${err.message}`);
    } finally {
      setIsUploadingCrew(false);
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

  const handleToggleApproval = async (targetId: string, currentApproved: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/members/${targetId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isApproved: !currentApproved })
      });
      if (res.ok) {
        setAllUsers(prev => prev.map(u => (u._id === targetId || u.id === targetId) ? { ...u, isApproved: !currentApproved } : u));
      } else {
        alert('Failed to update approval status.');
      }
    } catch (err) {
      alert('Network error while updating approval status.');
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
      await fetch(`${API_URL}/api/resources`, {
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
      (u.instagramUrl || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.specialization || '').toLowerCase().includes(userSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (userRoleFilter === 'all') return true;
    if (userRoleFilter === 'admin') return u.role === 'admin';
    if (userRoleFilter === 'leader') return ['president', 'vice_president', 'tech_head'].includes(u.role);
    if (userRoleFilter === 'crew') return ['member', 'crew'].includes(u.role);
    return u.role === userRoleFilter;
  });

  // Filtered Pending Requests
  const filteredPending = pendingMembers.filter(m => {
    if (!pendingSearch) return true;
    const q = pendingSearch.toLowerCase();
    return (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.department || '').toLowerCase().includes(q);
  });

  // Crew for Track Record Management
  const crewAndLeaders = allUsers.filter(u => 
    ['member', 'crew', 'photographer', 'tech_head', 'creative_head', 'photography_head', 'social_media_head', 'president', 'vice_president', 'admin'].includes(u.role)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

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
            Fast approvals, track records for each crew member, full MongoDB database control, and AI RAG knowledge.
          </p>
        </div>

        {/* Action Pills Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-primary text-primary-foreground font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Dashboard & Approvals
            </button>
            <button
              onClick={() => setActiveTab('trackRecords')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'trackRecords' ? 'bg-primary text-primary-foreground font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Crew Track Records ({crewAndLeaders.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('tableFile');
                loadTableData();
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tableFile' ? 'bg-primary text-primary-foreground font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Registration Table File</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'users' ? 'bg-primary text-primary-foreground font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Users ({allUsers.length})
            </button>
          </div>

          <button
            onClick={() => {
              setBulkUploadResult(null);
              setUploadFile(null);
              setShowBulkUploadModal(true);
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-orange-500/20 shrink-0"
            title="Upload a PDF roster or CSV file to register and auto-approve all crew members at once"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Crew Roster (PDF)</span>
          </button>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl pixela-gradient-bg text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20 shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Success Alert Banner */}
      {userSuccessMessage && (
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex items-center space-x-3 text-green-400 text-xs font-semibold animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
          <span>{userSuccessMessage}</span>
        </div>
      )}

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card border border-border/40 p-5 rounded-xl flex items-center space-x-4 shadow-sm">
          <Users className="h-7 w-7 text-primary shrink-0" />
          <div>
            <h3 className="text-2xl font-black text-white">{allUsers.length}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Total Accounts</p>
          </div>
        </div>
        <div className="bg-card border border-border/40 p-5 rounded-xl flex items-center space-x-4 shadow-sm">
          <Award className="h-7 w-7 text-primary shrink-0" />
          <div>
            <h3 className="text-2xl font-black text-white">{crewAndLeaders.length}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Active Crew Records</p>
          </div>
        </div>
        <div 
          onClick={() => { setActiveTab('tableFile'); loadTableData(); }}
          className="bg-card border border-primary/30 bg-primary/5 p-5 rounded-xl flex items-center space-x-4 shadow-sm cursor-pointer hover:border-primary transition-colors"
        >
          <Table className="h-7 w-7 text-primary shrink-0" />
          <div>
            <h3 className="text-2xl font-black text-white">{allUsers.length}</h3>
            <p className="text-[10px] text-primary uppercase tracking-widest font-semibold">Persistent File Table</p>
          </div>
        </div>
        <div className="bg-card border border-border/40 p-5 rounded-xl flex items-center space-x-4 shadow-sm">
          <ImageIcon className="h-7 w-7 text-primary shrink-0" />
          <div>
            <h3 className="text-2xl font-black text-white">{pendingPhotos.length}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Pending Gallery</p>
          </div>
        </div>
        <div className={`bg-card border p-5 rounded-xl flex items-center space-x-4 shadow-sm ${
          pendingMembers.length > 0 ? 'border-amber-500/50 bg-amber-500/5' : 'border-border/40'
        }`}>
          <ShieldAlert className={`h-7 w-7 shrink-0 ${pendingMembers.length > 0 ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
          <div>
            <h3 className="text-2xl font-black text-white">{pendingMembers.length}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Pending Requests</p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: CREW TRACK RECORDS & PERFORMANCE MANAGEMENT
          ========================================================================= */}
      {activeTab === 'trackRecords' && (
        <section className="bg-card border border-border/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-white">Crew Track Records & Gear Matrix</h2>
                <span className="text-xs px-2.5 py-0.5 bg-primary/20 text-primary rounded-full font-mono font-bold">
                  {crewAndLeaders.length} Tracked
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-light mt-1">
                Log equipment loadouts, covered event history, skill badges, and performance ratings for each crew member.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crewAndLeaders.map((member) => {
              const avatar = member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
              const badges = Array.isArray(member.badges) && member.badges.length > 0 ? member.badges : ['Verified Crew'];
              const eventsCount = Array.isArray(member.eventsCovered) ? member.eventsCovered.length : 0;
              const rating = member.performanceRating || 5;

              return (
                <div
                  key={member._id || member.id}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-700 overflow-hidden shrink-0">
                          <img src={avatar} alt={member.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm truncate">{member.name}</h4>
                          <p className="text-[10px] text-zinc-400 font-mono truncate">
                            {member.department || 'General'} • {member.year || '3rd Year'}
                          </p>
                          <span className="text-[9px] font-mono text-primary font-semibold block uppercase">
                            {member.role || 'CREW'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 bg-zinc-950 px-2 py-0.5 rounded-full border border-white/5 text-[11px] font-mono font-bold text-amber-400">
                        <span>{rating}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </div>
                    </div>

                    {/* Track Record Stats Strip with Event Coverage Date */}
                    <div className="space-y-1 bg-zinc-950/70 p-2.5 rounded-lg text-[10px] font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Events Covered:</span>
                        <span className="font-bold text-white">{eventsCount} total</span>
                      </div>
                      {Array.isArray(member.eventsCovered) && member.eventsCovered.length > 0 && (
                        <div className="flex items-center justify-between text-[9px] text-zinc-400 truncate border-t border-white/5 pt-1">
                          <span className="text-amber-400 font-semibold">Latest Date:</span>
                          <span className="text-zinc-200 truncate ml-1 font-bold">
                            {member.eventsCovered[0].date ? new Date(member.eventsCovered[0].date).toISOString().split('T')[0] : 'N/A'}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t border-white/5 pt-1">
                        <span className="text-zinc-500">Gear:</span>
                        <span className="font-bold text-zinc-300 truncate ml-1">{member.gear?.cameraBody || 'Standard'}</span>
                      </div>
                    </div>

                    {/* Badges pills */}
                    <div className="flex flex-wrap gap-1">
                      {badges.slice(0, 3).map((b: string, bIdx: number) => (
                        <span key={bIdx} className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-mono">
                          {b}
                        </span>
                      ))}
                      {badges.length > 3 && (
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full font-mono">
                          +{badges.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenTrackRecordModal(member)}
                      className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-zinc-700"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-primary" />
                      <span>Manage Record</span>
                    </button>
                    <button
                      onClick={() => exportCrewMemberDossierPdf(member)}
                      className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-pink-400 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors cursor-pointer border border-zinc-700"
                      title="Download Official Credentials PDF Dossier"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 2: DASHBOARD & FAST APPROVALS HUB
          ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Pending Access Requests & Approvals */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. Fast-Track Pending Access Requests */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <ShieldAlert className="h-5 w-5 text-amber-400" />
                    <span>Pending Access & Roster Requests</span>
                    <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-mono font-bold">
                      {pendingMembers.length}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-light mt-0.5">
                    Fast-track approvals: Approve individual applicants or all in a single click.
                  </p>
                </div>

                {pendingMembers.length > 0 && (
                  <button
                    onClick={handleBulkApprovePending}
                    disabled={isBulkApproving}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>{isBulkApproving ? 'Approving...' : '⚡ 1-Click Approve All'}</span>
                  </button>
                )}
              </div>

              {pendingMembers.length === 0 ? (
                <div className="py-8 text-center space-y-2 border border-dashed border-zinc-800 rounded-xl">
                  <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto" />
                  <p className="text-xs font-semibold text-zinc-300">All pending requests are approved!</p>
                  <p className="text-[11px] text-zinc-500">New crew registrations will appear here instantly in real-time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPending.map((member) => {
                    const memberId = member._id || member.id;
                    const isAlumni = member.role === 'alumni';
                    const isFaculty = member.role === 'faculty';
                    const roleBadge = isAlumni ? 'Club Alumni' : isFaculty ? 'Faculty' : 'Crew Member';
                    const badgeColor = isAlumni ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : isFaculty ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-primary/10 text-primary border-primary/30';

                    return (
                      <div
                        key={memberId}
                        className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-11 w-11 rounded-xl bg-zinc-950 border border-zinc-700 overflow-hidden shrink-0">
                            <img
                              src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                              alt={member.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-xs">{member.name}</h4>
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.2 rounded border uppercase ${badgeColor}`}>
                                {roleBadge}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              {member.department || 'General'} • {member.year || '3rd Year'} ({member.semester || 1} Sem)
                            </p>
                            <p className="text-[9px] text-zinc-500 font-mono">{member.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleApproveMember(memberId)}
                            className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-500 text-white py-1.5 px-3.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve Access</span>
                          </button>

                          <button
                            onClick={() => handleDeclineMember(memberId)}
                            className="flex-1 sm:flex-initial bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white py-1.5 px-3.5 rounded-lg text-xs font-bold transition-colors border border-red-800/40 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Pending Gallery Photo Approvals */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <span>Pending Gallery Prints ({pendingPhotos.length})</span>
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
                          <p className="text-[9px] text-zinc-400 mt-0.5">By {photo.photographer?.name || 'Pixela Crew'} • {photo.category}</p>
                        </div>
                        <button
                          onClick={() => handleApprovePhoto(photo._id)}
                          className="w-full bg-green-600 hover:bg-green-500 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve & Publish Print</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Event Booking Mail Inquiries */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Event Shoot Bookings ({bookings.length})</span>
              </h3>

              {bookings.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No event bookings received yet.</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-sm">{booking.eventType}</h4>
                          <p className="text-[10px] text-zinc-400">Venue: {booking.venue} • Date: {new Date(booking.eventDate).toLocaleDateString()}</p>
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
                      <p className="text-xs text-zinc-400 bg-zinc-950 p-2 rounded">{booking.details || 'No details provided.'}</p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Client: {booking.clientName} ({booking.clientEmail})</span>
                        {booking.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateBookingStatus(booking._id, 'accepted')}
                              className="bg-green-600 text-white p-1 rounded hover:bg-green-500 transition-colors"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(booking._id, 'declined')}
                              className="bg-red-600 text-white p-1 rounded hover:bg-red-500 transition-colors"
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

          </div>

          {/* Right Column: AI RAG Knowledge Seeder */}
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
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Category</label>
                  <select
                    value={kbCategory}
                    onChange={(e) => setKbCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Camera Settings">Camera Settings & Exposure</option>
                    <option value="Composition">Composition & Framing</option>
                    <option value="Lighting">Lighting & Golden Hour</option>
                    <option value="Color Grading">Post-Processing & Color Grading</option>
                    <option value="Club Guidelines">Pixela Club Guidelines & History</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Verified Technical Content</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Explain rules, technical parameters, aperture values..."
                    value={kbContent}
                    onChange={(e) => setKbContent(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-primary resize-none font-light"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full pixela-gradient-bg hover:opacity-90 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-opacity flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-primary/20"
                >
                  <Send className="h-3 w-3" />
                  <span>Publish to RAG Vector Base</span>
                </button>
              </form>
            )}
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 3: FULL USER & LEADERSHIP DATABASE
          ========================================================================= */}
      {activeTab === 'users' && (
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
                Super Admin full privileges: Add, edit role, assign track record, or delete any account from MongoDB.
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

              <button
                onClick={() => {
                  setBulkUploadResult(null);
                  setUploadFile(null);
                  setShowBulkUploadModal(true);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-semibold transition-colors cursor-pointer"
                title="Upload a PDF roster or CSV to register all crew at once"
              >
                <UploadCloud className="h-3.5 w-3.5 text-orange-400" />
                <span>Upload Roster (PDF)</span>
              </button>
            </div>
          </div>

          {/* Users Table / Grid */}
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-border/40 rounded-xl">
              <Users className="h-8 w-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-400">No matching users found.</p>
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
                          {u.instagramUrl && (
                            <a
                              href={u.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#ff5e95] hover:underline font-mono truncate block"
                            >
                              {u.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '')}
                            </a>
                          )}
                        </div>
                      </div>

                      {!isRootAdmin && (
                        <div className="shrink-0">
                          {u.isApproved ? (
                            <span className="text-[9px] bg-green-500/15 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                              <Check className="h-2.5 w-2.5" /> Approved
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleApproval(u._id || u.id, false)}
                              className="text-[9px] bg-amber-500/20 text-amber-300 hover:bg-green-600 hover:text-white border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm animate-pulse"
                            >
                              <UserCheck className="h-3 w-3" /> Approve Access
                            </button>
                          )}
                        </div>
                      )}
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

                    {/* Action Bar */}
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
                            <option value="creative_head">Creative Head</option>
                            <option value="photography_head">Photography Head</option>
                            <option value="crew">Crew Member</option>
                            <option value="member">General Member</option>
                            <option value="viewer">Viewer</option>
                            <option value="alumni">Alumni</option>
                            <option value="faculty">Faculty</option>
                          </select>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenTrackRecordModal(u)}
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors border border-zinc-700 text-[10px] font-semibold cursor-pointer"
                          title="Manage Track Record & Gear"
                        >
                          <Edit3 className="h-3 w-3 text-primary" />
                        </button>

                        {!isRootAdmin && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors border border-red-800/50 text-[10px] font-semibold cursor-pointer"
                            title="Delete User from Database"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          TAB 4: PERSISTENT REGISTRATION TABLE FILE & EXPORT (SUPER ADMIN)
          ========================================================================= */}
      {activeTab === 'tableFile' && (
        <section className="bg-card border border-border/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/30 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <Table className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-white">Crew & Member Registrations Table File</h2>
                <span className="text-xs px-2.5 py-0.5 bg-primary/20 text-primary rounded-full font-mono font-bold">
                  {allUsers.length} Entries Stored
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-light mt-1">
                Every registered member and crew is automatically stored on the server in table format (<code className="text-primary font-mono text-[11px]">crew_registrations_table.md</code>, <code className="text-primary font-mono text-[11px]">crew_registrations.csv</code>, and <code className="text-primary font-mono text-[11px]">registrations.json</code>).
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setBulkUploadResult(null);
                  setUploadFile(null);
                  setShowBulkUploadModal(true);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                title="Upload a PDF roster or CSV to register and auto-approve all crew members at once"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Upload Crew Roster (PDF)</span>
              </button>

              <button
                onClick={() => exportAllRegistrationsPdf(allUsers)}
                className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                title="Export complete registration directory & event coverage log to PDF"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Export PDF Report</span>
              </button>

              <button
                onClick={handleDownloadCsv}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-zinc-700 cursor-pointer"
                title="Download CSV spreadsheet of all registered crew"
              >
                <Download className="h-3.5 w-3.5 text-green-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleSyncFileStorage}
                disabled={isSyncingFile}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-zinc-700 cursor-pointer disabled:opacity-50"
                title="Force bi-directional synchronization with server table files"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-primary ${isSyncingFile ? 'animate-spin' : ''}`} />
                <span>{isSyncingFile ? 'Syncing...' : 'Sync Table File'}</span>
              </button>

              <button
                onClick={handleCopyMarkdown}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-zinc-700 cursor-pointer"
                title="Copy Markdown formatted table to clipboard"
              >
                {copiedMarkdown ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-primary" />}
                <span>{copiedMarkdown ? 'Copied!' : 'Copy MD Table'}</span>
              </button>

              <button
                onClick={() => setViewRawMarkdown(!viewRawMarkdown)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors border cursor-pointer ${
                  viewRawMarkdown ? 'bg-primary text-primary-foreground border-primary' : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>{viewRawMarkdown ? 'View Table UI' : 'View Raw Markdown'}</span>
              </button>
            </div>
          </div>

          {/* Storage Telemetry Pill Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-950/70 p-4 rounded-xl border border-zinc-800/80 text-xs">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse shrink-0"></span>
              <span className="text-zinc-400">Server Table File:</span>
              <span className="font-mono text-white text-[11px] truncate">backend/data/crew_registrations_table.md</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0"></span>
              <span className="text-zinc-400">Spreadsheet File:</span>
              <span className="font-mono text-white text-[11px] truncate">backend/data/crew_registrations.csv</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-primary shrink-0"></span>
              <span className="text-zinc-400">Sync Status:</span>
              <span className="font-bold text-green-400">Live Persistent Disk Mode</span>
            </div>
          </div>

          {/* Search Filter */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter registration records by name, email, role, gear, department..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary"
              />
            </div>
            <span className="text-xs text-zinc-400 font-mono shrink-0">
              Showing {allUsers.filter(u => {
                if (!tableSearch) return true;
                const q = tableSearch.toLowerCase();
                return (u.name || '').toLowerCase().includes(q) ||
                  (u.email || '').toLowerCase().includes(q) ||
                  (u.department || '').toLowerCase().includes(q) ||
                  (u.role || '').toLowerCase().includes(q) ||
                  (u.gear?.cameraBody || '').toLowerCase().includes(q);
              }).length} of {allUsers.length}
            </span>
          </div>

          {/* View Mode 1: Raw Markdown File Preview */}
          {viewRawMarkdown ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono text-[11px]">backend/data/crew_registrations_table.md</span>
                <span className="text-[10px]">Markdown Table Format</span>
              </div>
              <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl overflow-x-auto text-[11px] font-mono text-zinc-300 leading-relaxed max-h-[500px]">
                {tableMarkdown || 'Loading persistent registration markdown table...'}
              </pre>
            </div>
          ) : (
            /* View Mode 2: Interactive Table Grid */
            <div className="border border-border/40 rounded-xl overflow-hidden shadow-inner bg-zinc-950/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/50 bg-zinc-900/80 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="py-3 px-3 w-10 text-center">#</th>
                      <th className="py-3 px-4">Member Name & ID</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-4">Department & Sem</th>
                      <th className="py-3 px-3">Instagram / Social</th>
                      <th className="py-3 px-4">Camera & Gear</th>
                      <th className="py-3 px-3">Badges</th>
                      <th className="py-3 px-4">Event Coverage Dates</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Registration Date</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 font-light text-zinc-300">
                    {allUsers
                      .filter(u => {
                        if (!tableSearch) return true;
                        const q = tableSearch.toLowerCase();
                        return (u.name || '').toLowerCase().includes(q) ||
                          (u.email || '').toLowerCase().includes(q) ||
                          (u.department || '').toLowerCase().includes(q) ||
                          (u.role || '').toLowerCase().includes(q) ||
                          (u.gear?.cameraBody || '').toLowerCase().includes(q);
                      })
                      .map((u, idx) => {
                        const userId = u._id || u.id;
                        const isApproved = u.isApproved;
                        const dateStr = u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-08-01';
                        const isRoot = u.email?.toLowerCase() === 'pixela@oriental.ac.in';
                        const events = Array.isArray(u.eventsCovered) ? u.eventsCovered : [];

                        return (
                          <tr key={userId} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="py-3 px-3 text-center font-mono text-[11px] text-zinc-500 font-bold">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2.5">
                                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-700 overflow-hidden shrink-0">
                                  <img
                                    src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                                    alt={u.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {isRoot && (
                                      <span className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded font-mono font-bold">
                                        SUPER ADMIN
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-zinc-500 font-mono">{userId}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-zinc-300">
                              <code>{u.email}</code>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                                u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                ['president', 'tech_head', 'creative_head'].includes(u.role) ? 'bg-primary/10 text-primary border-primary/30' :
                                'bg-zinc-800 text-zinc-300 border-zinc-700'
                              }`}>
                                {u.role || 'member'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[11px]">
                              <span className="font-medium text-white">{u.department || 'General'}</span>
                              <div className="text-[10px] text-zinc-500 font-mono">{u.year || '1st Year'} • Sem {u.semester || 1}</div>
                            </td>
                            <td className="py-3 px-3">
                              {u.instagramUrl ? (
                                <a
                                  href={u.instagramUrl.startsWith('http') ? u.instagramUrl : `https://instagram.com/${u.instagramUrl.replace(/^@/, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-[#ff5e95] hover:underline font-mono inline-flex items-center gap-1"
                                >
                                  <span>{u.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '')}</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              ) : (
                                <span className="text-zinc-600 text-[10px] font-mono">None</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-[11px]">
                              <div className="font-semibold text-zinc-200">
                                {u.gear?.cameraBody || 'Standard Gear'}
                              </div>
                              {u.gear?.primaryLens && (
                                <div className="text-[10px] text-zinc-500 font-mono">{u.gear.primaryLens}</div>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(u.badges) && u.badges.length > 0 ? u.badges.slice(0, 2) : ['Verified Crew']).map((b: string, bIdx: number) => (
                                  <span key={bIdx} className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded font-mono">
                                    {b}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[11px]">
                              {events.length > 0 ? (
                                <div className="space-y-1">
                                  {events.slice(0, 2).map((ev: any, evIdx: number) => (
                                    <div key={evIdx} className="text-[10px] font-mono leading-tight">
                                      <span className="text-amber-400 font-semibold">{ev.date ? new Date(ev.date).toISOString().split('T')[0] : 'Covered'}:</span>{' '}
                                      <span className="text-zinc-300 font-medium">{ev.eventName || 'Event'}</span>
                                      <span className="text-zinc-500 text-[9px] block">({ev.role || 'Shooter'})</span>
                                    </div>
                                  ))}
                                  {events.length > 2 && (
                                    <span className="text-[9px] text-zinc-500 font-mono">+{events.length - 2} more</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-zinc-600 text-[10px] font-mono">No events logged</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {isApproved ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-green-500/10 text-green-400 border border-green-500/30">
                                  <Check className="h-3 w-3" />
                                  <span>Approved</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>Pending</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-[10px] text-zinc-500">
                              {dateStr}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                {!isApproved && (
                                  <button
                                    onClick={() => handleApproveMember(userId)}
                                    className="p-1.5 bg-green-950/80 hover:bg-green-600 text-green-300 hover:text-white rounded-lg transition-colors border border-green-800/50 cursor-pointer"
                                    title="Quick Approve"
                                  >
                                    <Check className="h-3 w-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => exportCrewMemberDossierPdf(u)}
                                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-pink-400 hover:text-white rounded-lg transition-colors border border-zinc-700 cursor-pointer"
                                  title="Download Crew Dossier PDF"
                                >
                                  <FileText className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleOpenTrackRecordModal(u)}
                                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors border border-zinc-700 cursor-pointer"
                                  title="Edit Track Record & Event Coverage"
                                >
                                  <Edit3 className="h-3 w-3 text-primary" />
                                </button>
                                {!isRoot && (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    className="p-1.5 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors border border-red-800/50 cursor-pointer"
                                    title="Delete from Roster & Table File"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          TRACK RECORD & CREW GEAR MANAGEMENT MODAL (SUPER ADMIN ONLY)
          ========================================================================= */}
      {selectedCrewForTrackRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 overflow-hidden rounded-2xl glass-panel border border-white/15 p-6 sm:p-8 text-white shadow-2xl space-y-6 text-left">
            <button
              onClick={() => setSelectedCrewForTrackRecord(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border/40 pb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Edit Crew Track Record: {selectedCrewForTrackRecord.name}
                </h3>
                <p className="text-xs text-zinc-400">
                  Update equipment loadouts, assign achievement badges, and log event coverage track records.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveTrackRecord} className="space-y-5">
              
              {/* 1. Camera & Gear Loadout */}
              <div className="space-y-3 bg-zinc-950/70 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Camera className="h-4 w-4" />
                  <span>Equipment & Gear Loadout</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Primary Camera Body</label>
                    <input
                      type="text"
                      placeholder="e.g. Sony A7 IV, Nikon Z6 II"
                      value={trackRecordForm.cameraBody}
                      onChange={(e) => setTrackRecordForm({ ...trackRecordForm, cameraBody: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Primary Lens</label>
                    <input
                      type="text"
                      placeholder="e.g. FE 24-70mm f/2.8 GM"
                      value={trackRecordForm.primaryLens}
                      onChange={(e) => setTrackRecordForm({ ...trackRecordForm, primaryLens: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Secondary Lens</label>
                    <input
                      type="text"
                      placeholder="e.g. FE 85mm f/1.4 GM"
                      value={trackRecordForm.secondaryLens}
                      onChange={(e) => setTrackRecordForm({ ...trackRecordForm, secondaryLens: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Accessories / Drones (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. DJI RS 3, Godox Flash, Drone"
                      value={trackRecordForm.accessories}
                      onChange={(e) => setTrackRecordForm({ ...trackRecordForm, accessories: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Achievement Badges Selector */}
              <div className="space-y-2.5 bg-zinc-950/70 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  <span>Assigned Badges & Honors</span>
                </h4>

                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_BADGES.map((b) => {
                    const isSelected = trackRecordForm.badges.includes(b);
                    return (
                      <button
                        type="button"
                        key={b}
                        onClick={() => handleToggleBadge(b)}
                        className={`text-[11px] font-mono px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-bold border-primary shadow-sm'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Performance Score & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Performance Rating (1 - 5 Stars)</label>
                  <select
                    value={trackRecordForm.performanceRating}
                    onChange={(e) => setTrackRecordForm({ ...trackRecordForm, performanceRating: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5.0 - Outstanding)</option>
                    <option value={4}>⭐⭐⭐⭐ (4.0 - Highly Active)</option>
                    <option value={3}>⭐⭐⭐ (3.0 - Regular Contributor)</option>
                    <option value={2}>⭐⭐ (2.0 - Developing)</option>
                    <option value={1}>⭐ (1.0 - Probation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Specialization Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Cinematographer"
                    value={trackRecordForm.specialization}
                    onChange={(e) => setTrackRecordForm({ ...trackRecordForm, specialization: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* 4. Log New Event Coverage Entry */}
              <div className="space-y-3 bg-zinc-950/70 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Log Event Coverage Milestone (Optional)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Event Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Shutter Stories Exhibition"
                      value={trackRecordForm.newEventName}
                      onChange={(e) => setTrackRecordForm({ ...trackRecordForm, newEventName: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Assigned Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Exhibition Curator"
                      value={trackRecordForm.newEventRole}
                      onChange={(e) => setTrackRecordForm({ ...trackRecordForm, newEventRole: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={trackRecordForm.newEventDate}
                      onChange={(e) => setTrackRecordForm({ ...trackRecordForm, newEventDate: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCrewForTrackRecord(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTrackRecord}
                  className="px-5 py-2 rounded-xl pixela-gradient-bg text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Award className="h-4 w-4" />
                  <span>{isSavingTrackRecord ? 'Saving Record...' : 'Save Track Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD USER MODAL (SUPER ADMIN ONLY)
          ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg my-8 overflow-hidden rounded-2xl glass-panel border border-white/10 p-6 sm:p-8 text-white shadow-2xl">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 rounded-full pixela-gradient-bg flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Add New User or Leader</h3>
                <p className="text-xs text-zinc-400">Directly provision an account into Pixela MongoDB database.</p>
              </div>
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
                    <option value="tech_head">Tech Head</option>
                    <option value="creative_head">Creative Head</option>
                    <option value="photography_head">Photography Head</option>
                    <option value="alumni">Club Alumni</option>
                    <option value="faculty">Faculty Coordinator</option>
                    <option value="president">President</option>
                    <option value="vice_president">Vice President</option>
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
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Instagram Profile URL / Handle</label>
                <input
                  type="text"
                  placeholder="e.g. mr_ojashva or https://instagram.com/mr_ojashva"
                  value={newUser.instagramUrl}
                  onChange={(e) => setNewUser({ ...newUser, instagramUrl: e.target.value })}
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

      {/* =========================================================================
          1-CLICK CREW BULK UPLOAD MODAL (PDF / CSV / JSON)
          ========================================================================= */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 overflow-hidden rounded-2xl glass-panel border border-white/15 p-6 sm:p-8 text-white shadow-2xl space-y-6 text-left">
            <button
              onClick={() => {
                setShowBulkUploadModal(false);
                setBulkUploadResult(null);
                setUploadFile(null);
              }}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Title & Subtitle */}
            <div className="flex items-center space-x-3 border-b border-border/40 pb-4">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>1-Click Crew Registration via PDF / Roster</span>
                  <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    INSTANT AUTO-APPROVAL
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Upload a PDF document, CSV spreadsheet, or JSON roster. All crew members are extracted, registered, and automatically approved without delay.
                </p>
              </div>
            </div>

            {/* Success Result Summary (if uploaded) */}
            {bulkUploadResult && (
              <div className="bg-green-500/10 border border-green-500/40 rounded-xl p-4 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-bold">Roster Processed Successfully!</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {bulkUploadResult.message}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
                  <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block uppercase">Total Processed</span>
                    <span className="font-bold text-white text-base font-mono">{bulkUploadResult.count}</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block uppercase">Newly Added</span>
                    <span className="font-bold text-green-400 text-base font-mono">{bulkUploadResult.newlyRegisteredCount}</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block uppercase">Updated</span>
                    <span className="font-bold text-blue-400 text-base font-mono">{bulkUploadResult.updatedCount}</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block uppercase">Approval Status</span>
                    <span className="font-bold text-emerald-400 text-xs">100% Approved</span>
                  </div>
                </div>

                {Array.isArray(bulkUploadResult.users) && bulkUploadResult.users.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold block">
                      Imported Crew List ({bulkUploadResult.users.length})
                    </span>
                    <div className="max-h-36 overflow-y-auto divide-y divide-zinc-800/80 border border-zinc-800 rounded-lg bg-zinc-950/60 text-xs">
                      {bulkUploadResult.users.map((u: any, idx: number) => (
                        <div key={idx} className="p-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="font-semibold text-white truncate block">{u.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono truncate block">{u.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded capitalize">
                              {u.role || 'crew'}
                            </span>
                            <span className="text-[10px] font-mono bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <Check className="h-2.5 w-2.5" /> Approved
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleBulkUploadCrew} className="space-y-5">
              {/* File Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Select Roster File (.pdf, .csv, .json, .txt) *
                </label>
                <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  uploadFile ? 'border-primary/60 bg-primary/5' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/40'
                }`}>
                  <input
                    type="file"
                    accept=".pdf,.csv,.json,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                        setBulkUploadResult(null);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <div className="h-12 w-12 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-primary">
                      {uploadFile ? <CheckCircle2 className="h-6 w-6 text-green-400" /> : <FileUp className="h-6 w-6" />}
                    </div>
                    {uploadFile ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white flex items-center justify-center gap-2">
                          <span>{uploadFile.name}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full font-mono font-bold">
                            {(uploadFile.size / 1024).toFixed(1)} KB
                          </span>
                        </p>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          Ready for 1-click parsing & auto-registration. Click or drop another file to change.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">
                          Drop your crew roster file here, or <span className="text-primary underline">browse</span>
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          Supports multi-page PDF documents, Markdown tables, CSV sheets, and JSON arrays
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">.PDF</span>
                          <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">.CSV</span>
                          <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">.JSON</span>
                          <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">.TXT</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Roster Defaults */}
              <div className="space-y-3 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                  <Sliders className="h-3.5 w-3.5 text-primary" />
                  <span>Default Fallback Settings (for unassigned columns)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Default Role</label>
                    <select
                      value={bulkRole}
                      onChange={(e) => setBulkRole(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="crew">Crew Member (Active Roster)</option>
                      <option value="member">General Member</option>
                      <option value="photographer">Photographer</option>
                      <option value="tech_head">Tech Head</option>
                      <option value="creative_head">Creative Head</option>
                      <option value="photography_head">Photography Head</option>
                      <option value="alumni">Club Alumni</option>
                      <option value="faculty">Faculty Coordinator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Default Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Information Technology"
                      value={bulkDept}
                      onChange={(e) => setBulkDept(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Default Year</label>
                    <select
                      value={bulkYear}
                      onChange={(e) => setBulkYear(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 space-y-1">
                  <span className="font-bold text-green-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Auto-Approved
                  </span>
                  <p className="text-zinc-400 text-[10px] leading-relaxed">
                    Zero waiting time. All crew members imported by the admin are automatically approved and immediately visible in Leadership & Roster.
                  </p>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 space-y-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Default Password
                  </span>
                  <p className="text-zinc-400 text-[10px] leading-relaxed">
                    Credentials initialized to <code className="text-white font-mono">pixela@2026</code>. Members can log in directly and customize their profile.
                  </p>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 space-y-1">
                  <span className="font-bold text-blue-400 flex items-center gap-1">
                    <Table className="h-3 w-3" /> Persistent Table Sync
                  </span>
                  <p className="text-zinc-400 text-[10px] leading-relaxed">
                    Instantly writes to <code className="text-white font-mono">crew_registrations_table.md</code>, CSV files, and MongoDB database.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkUploadModal(false);
                    setBulkUploadResult(null);
                    setUploadFile(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || isUploadingCrew}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  {isUploadingCrew ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Parsing & Registering All Crew...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Register & Auto-Approve All Crew</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
