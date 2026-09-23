import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { GalleryPhoto } from '../models/GalleryPhoto.js';
import { Event } from '../models/Event.js';
import { Booking } from '../models/Booking.js';
import { Blog } from '../models/Blog.js';
import { Resource } from '../models/Resource.js';
import { ChatbotKnowledge } from '../models/ChatbotKnowledge.js';
import { chatPixie, critiquePhoto } from '../controllers/aiController.js';
import {
  loadRegistrationsFromFile,
  saveRegistrationToFile,
  saveAllRegistrationsToFile,
  deleteRegistrationFromFile,
  updateRegistrationStatusInFile,
  getRegistrationsTableMarkdown,
  getRegistrationsCsv
} from '../config/fileStorage.js';
import { PDFParse } from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Multer in-memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

/* ==========================================================================
   IN-MEMORY DATA STORE (Zero-downtime fallback synced with persistent file storage)
   ========================================================================== */

const memoryStore = {
  users: loadRegistrationsFromFile(),

  photos: [
    {
      _id: 'photo_001',
      title: 'Himalayan Ridge Horizon',
      description: 'Sunset hitting the mountain valley horizon in Mussoorie.',
      category: 'Nature',
      imageUrl: '/hero_mountain.jpg',
      photographer: {
        _id: 'user_superadmin_pixela',
        name: 'Pixela Super Admin',
        email: 'pixela@oriental.ac.in',
        avatarUrl: '/ojashva.jpg',
      },
      camera: 'Nikon D750',
      lens: 'NIKKOR 24-120mm f/4G',
      settings: { aperture: 'f/8', shutterSpeed: '1/400s', iso: 100, focalLength: '35mm' },
      likes: [],
      downloadsCount: 42,
      isApproved: true,
      createdAt: new Date(),
    },
    {
      _id: 'photo_002',
      title: 'Ghat Street Rhythms',
      description: 'Vibrant street scene and bazaars at the ghat entrance.',
      category: 'Street',
      imageUrl: '/hero_street.jpg',
      photographer: {
        _id: 'user_superadmin_pixela',
        name: 'Pixela Photography Club',
        email: 'pixela@oriental.ac.in',
        avatarUrl: '/ojashva.jpg',
      },
      camera: 'Sony A7 III',
      lens: 'FE 35mm f/1.4 GM',
      settings: { aperture: 'f/2.8', shutterSpeed: '1/250s', iso: 200, focalLength: '35mm' },
      likes: [],
      downloadsCount: 28,
      isApproved: true,
      createdAt: new Date(),
    },
    {
      _id: 'photo_003',
      title: 'Flora & Camouflage',
      description: 'Macro perspective of a chameleon resting inside a shoe on a jackfruit tree.',
      category: 'Macro',
      imageUrl: '/hero_nature.jpg',
      photographer: {
        _id: 'user_superadmin_pixela',
        name: 'Pixela Photography Club',
        email: 'pixela@oriental.ac.in',
        avatarUrl: '/ojashva.jpg',
      },
      camera: 'Canon EOS R5',
      lens: 'RF 100mm f/2.8L Macro',
      settings: { aperture: 'f/2.8', shutterSpeed: '1/320s', iso: 200, focalLength: '100mm' },
      likes: [],
      downloadsCount: 65,
      isApproved: true,
      createdAt: new Date(),
    },
    {
      _id: 'photo_004',
      title: 'Holy Ganga Promenade',
      description: 'Pilgrims and visitors walking along the sacred river walkway at dusk.',
      category: 'Events',
      imageUrl: '/hero_river.jpg',
      photographer: {
        _id: 'user_superadmin_pixela',
        name: 'Pixela Photography Club',
        email: 'pixela@oriental.ac.in',
        avatarUrl: '/ojashva.jpg',
      },
      camera: 'Fujifilm X-T4',
      lens: 'XF 16-55mm f/2.8',
      settings: { aperture: 'f/5.6', shutterSpeed: '1/500s', iso: 160, focalLength: '23mm' },
      likes: [],
      downloadsCount: 51,
      isApproved: true,
      createdAt: new Date(),
    },
    {
      _id: 'photo_005',
      title: 'Hillside Haven Estate',
      description: 'Bird-eye top view of hillside cottage and green rooflines.',
      category: 'Architecture',
      imageUrl: '/hero_villa.jpg',
      photographer: {
        _id: 'user_superadmin_pixela',
        name: 'Pixela Super Admin',
        email: 'pixela@oriental.ac.in',
        avatarUrl: '/ojashva.jpg',
      },
      camera: 'Sony A7R IV',
      lens: 'FE 16-35mm f/2.8 GM',
      settings: { aperture: 'f/7.1', shutterSpeed: '1/320s', iso: 100, focalLength: '24mm' },
      likes: [],
      downloadsCount: 39,
      isApproved: true,
      createdAt: new Date(),
    },
  ],

  bookings: [
    {
      _id: 'booking_001',
      clientName: 'Oriental Tech Fest Committee',
      clientEmail: 'fest@oriental.ac.in',
      clientPhone: '+91 98765 43210',
      eventType: 'College Fest',
      eventDate: new Date('2026-09-15'),
      venue: 'Main Auditorium, Oriental Campus',
      details: 'Full day photography and cinematic aftermovie coverage needed.',
      status: 'pending',
      createdAt: new Date(),
    },
  ],

  events: [
    {
      _id: 'event_001',
      title: 'Shutter Stories Photography Exhibition',
      slug: 'shutter-stories-exhibition',
      type: 'Exhibition',
      bannerUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop&q=80',
      description: 'Pixela presents its first-ever self-organized public photography exhibition at Oriental Campus.',
      fullDescription: 'Shutter Stories displays curated polaroids, landscape frames, and wildlife prints captured entirely by the Pixela Crew.',
      venue: 'Oriental Campus Auditorium Hall, Bhopal',
      date: new Date('2026-08-21T10:00:00+05:30'),
      schedule: [
        { time: '10:00 AM', title: 'Inauguration Ceremony & Lighting of Lamp', speaker: 'Faculty Coordinator' },
        { time: '11:00 AM', title: 'Exhibition Gallery Walkthrough', speaker: 'Pixela Super Admin' },
        { time: '02:00 PM', title: 'Creative Keynote & Interactive Q&A', speaker: 'Pixela Super Admin' },
        { time: '04:00 PM', title: 'Closing Remarks & Certificate Distribution', speaker: 'Faculty Coordinator' },
      ],
      speakers: [
        { name: 'Dr. S. K. Gupta', bio: 'Senior Faculty Advisor & Mentor', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
      ],
      registrations: [],
      status: 'upcoming',
      createdAt: new Date(),
    },
  ],

  resources: [],
  blogs: [],
};

// JWT authentication middleware
const protect = async (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith('Bearer')) {
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pixela_secret_key_2026_shutter_stories');

      if (isDbConnected()) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch (e) {
          req.user = null;
        }
      }

      if (!req.user) {
        // Look up in memoryStore
        const memUser = memoryStore.users.find(u => String(u._id) === String(decoded.id));
        if (memUser) {
          const { passwordHash, ...safeUser } = memUser;
          req.user = safeUser;
        }
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// Admin validation middleware
const adminOnly = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'admin' ||
      req.user.role === 'president' ||
      req.user.email?.toLowerCase() === 'pixela@oriental.ac.in')
  ) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admins only.' });
  }
};

/* ==========================================================================
   AUTH ENDPOINTS
   ========================================================================== */

const formatSocialUrl = (platform, url) => {
  if (!url) return '';
  const clean = url.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  if (platform === 'instagram') {
    const handle = clean.replace(/^@/, '');
    return `https://www.instagram.com/${handle}`;
  }
  if (platform === 'linkedin') {
    return `https://www.linkedin.com/in/${clean.replace(/^@/, '')}`;
  }
  if (platform === 'github') {
    return `https://github.com/${clean.replace(/^@/, '')}`;
  }
  if (platform === 'twitter' || platform === 'x') {
    return `https://x.com/${clean.replace(/^@/, '')}`;
  }
  return `https://${clean}`;
};

router.post('/auth/register', async (req, res) => {
  const { 
    name, email, password, role, semester, year, department, bio, skills, specialization, 
    avatarUrl, instagramUrl, socialLinks, currentProfession, pastRole, tenureYear, designation 
  } = req.body;
  try {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const cleanPassword = (password || '').trim();

    if (!normalizedEmail || !cleanPassword) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Check if registering with super admin email
    const isSuperAdminEmail = normalizedEmail === 'pixela@oriental.ac.in';
    const isAudience = role === 'viewer';
    const finalRole = isSuperAdminEmail ? 'admin' : (role || 'member');
    // Super Admin and Audience (Viewers) are auto-approved. Crew members, alumni, and faculty are approved by Super Admin.
    const finalApproval = isSuperAdminEmail || isAudience ? true : false;

    // Process Instagram & Social links
    const formattedInsta = formatSocialUrl('instagram', instagramUrl || (isSuperAdminEmail ? 'https://www.instagram.com/mr_ojashva' : ''));
    let finalSocialLinks = Array.isArray(socialLinks) ? socialLinks.map(s => ({
      platform: s.platform || 'other',
      url: formatSocialUrl(s.platform, s.url)
    })) : [];

    if (formattedInsta && !finalSocialLinks.some(s => s.platform === 'instagram')) {
      finalSocialLinks.unshift({ platform: 'instagram', url: formattedInsta });
    }
    finalSocialLinks = finalSocialLinks.slice(0, 3);

    const safeDepartment = department || (role === 'faculty' ? 'Information Technology' : 'General');
    const safeSpecialization = specialization || (isSuperAdminEmail ? 'Lead Admin & Curator' : 'Visual Creator');
    const safeAvatar = avatarUrl || (isSuperAdminEmail ? '/ojashva.jpg' : '');
    const safeBio = bio || (isSuperAdminEmail ? 'Super Administrator of Pixela Photography Club.' : '');
    const skillsArray = Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);

    let createdUserPayload = null;
    let savedDbUser = null;

    if (isDbConnected()) {
      try {
        const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let existingUser = await User.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } });
        if (existingUser) {
          if (isSuperAdminEmail) {
            existingUser.role = 'admin';
            existingUser.isApproved = true;
            if (cleanPassword) existingUser.password = cleanPassword;
            if (safeAvatar) existingUser.avatarUrl = safeAvatar;
            if (formattedInsta) existingUser.instagramUrl = formattedInsta;
            if (finalSocialLinks.length > 0) existingUser.socialLinks = finalSocialLinks;
            await existingUser.save();
            savedDbUser = existingUser;
            const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET || 'pixela_secret_key_2026_shutter_stories', { expiresIn: '30d' });
            createdUserPayload = {
              token,
              user: {
                id: existingUser._id,
                _id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                avatarUrl: existingUser.avatarUrl,
                specialization: existingUser.specialization,
                instagramUrl: existingUser.instagramUrl,
                socialLinks: existingUser.socialLinks || [],
                department: existingUser.department,
                semester: existingUser.semester,
                year: existingUser.year,
                currentProfession: existingUser.currentProfession,
                pastRole: existingUser.pastRole,
                tenureYear: existingUser.tenureYear,
                designation: existingUser.designation,
                isApproved: existingUser.isApproved,
              },
            };
          } else {
            return res.status(400).json({ error: 'User with this email already exists. Please sign in instead.' });
          }
        } else {
          const user = await User.create({
            name: name || (isSuperAdminEmail ? 'Pixela Super Admin' : 'Pixela Member'),
            email: normalizedEmail,
            password: cleanPassword,
            role: finalRole,
            semester: semester ? Number(semester) : 1,
            year: year || '1st Year',
            department: safeDepartment,
            bio: safeBio,
            skills: skillsArray,
            specialization: safeSpecialization,
            avatarUrl: safeAvatar,
            instagramUrl: formattedInsta,
            socialLinks: finalSocialLinks,
            currentProfession: currentProfession || '',
            pastRole: pastRole || '',
            tenureYear: tenureYear || '',
            designation: designation || '',
            isApproved: finalApproval,
            gear: { cameraBody: '', primaryLens: '', secondaryLens: '', accessories: [] },
            badges: finalRole === 'admin' ? ['Verified Crew', 'Prime Shooter', 'Event Lead', 'Tech Head'] : ['Verified Crew'],
            performanceRating: 5,
            trackRecordNotes: '',
            joinDate: new Date(),
          });
          savedDbUser = user;

          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'pixela_secret_key_2026_shutter_stories', { expiresIn: '30d' });
          createdUserPayload = {
            token,
            user: {
              id: user._id,
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatarUrl: user.avatarUrl,
              specialization: user.specialization,
              instagramUrl: user.instagramUrl,
              socialLinks: user.socialLinks || [],
              department: user.department,
              semester: user.semester,
              year: user.year,
              currentProfession: user.currentProfession,
              pastRole: user.pastRole,
              tenureYear: user.tenureYear,
              designation: user.designation,
              isApproved: user.isApproved,
              badges: user.badges,
              gear: user.gear,
              performanceRating: user.performanceRating,
            },
          };
        }
      } catch (dbErr) {
        console.warn('DB register error, falling back to memory/file store:', dbErr.message);
      }
    }

    // Persist registration into single table file (JSON, Markdown Table, CSV)
    const passwordHash = bcrypt.hashSync(cleanPassword, 10);
    const memUserId = createdUserPayload?.user?.id ? String(createdUserPayload.user.id) : (savedDbUser?._id ? String(savedDbUser._id) : `user_${Date.now()}`);

    const fileRegistrationData = {
      _id: memUserId,
      id: memUserId,
      name: name || (isSuperAdminEmail ? 'Pixela Super Admin' : 'Pixela Member'),
      email: normalizedEmail,
      password: cleanPassword, // Stored for robust zero-downtime offline fallback
      passwordHash,
      role: finalRole,
      semester: semester ? Number(semester) : 1,
      year: year || '1st Year',
      department: safeDepartment,
      bio: safeBio,
      skills: skillsArray,
      specialization: safeSpecialization,
      avatarUrl: safeAvatar,
      instagramUrl: formattedInsta,
      socialLinks: finalSocialLinks,
      currentProfession: currentProfession || '',
      pastRole: pastRole || '',
      tenureYear: tenureYear || '',
      designation: designation || '',
      gear: { cameraBody: '', primaryLens: '', secondaryLens: '', accessories: [] },
      badges: finalRole === 'admin' ? ['Verified Crew', 'Prime Shooter', 'Event Lead', 'Tech Head'] : ['Verified Crew'],
      performanceRating: 5,
      trackRecordNotes: '',
      isApproved: finalApproval,
      createdAt: new Date(),
    };

    // Save to disk in JSON, Markdown table, and CSV files
    saveRegistrationToFile(fileRegistrationData);

    // Sync memoryStore
    const memIndex = memoryStore.users.findIndex(u => (u.email || '').toLowerCase().trim() === normalizedEmail);
    if (memIndex !== -1) {
      memoryStore.users[memIndex] = { ...memoryStore.users[memIndex], ...fileRegistrationData };
    } else {
      memoryStore.users.unshift(fileRegistrationData);
    }

    if (createdUserPayload) {
      return res.status(201).json(createdUserPayload);
    }

    const token = jwt.sign({ id: memUserId }, process.env.JWT_SECRET || 'pixela_secret_key_2026_shutter_stories', { expiresIn: '30d' });
    const { password: _p, passwordHash: _ph, ...safeUser } = fileRegistrationData;
    return res.status(201).json({
      token,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const cleanPassword = (password || '').trim();
    const isSuperAdminEmail = normalizedEmail === 'pixela@oriental.ac.in';

    if (!normalizedEmail || !cleanPassword) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 1. Check MongoDB if connected
    if (isDbConnected()) {
      try {
        const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const dbUser = await User.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } });
        if (dbUser) {
          const isPasswordValid = await dbUser.matchPassword(cleanPassword);
          const isSuperAdminBypass = isSuperAdminEmail && (cleanPassword === 'pixela@2026' || cleanPassword === 'password123');

          if (isPasswordValid || isSuperAdminBypass) {
            if (isSuperAdminEmail && dbUser.role !== 'admin') {
              dbUser.role = 'admin';
              dbUser.isApproved = true;
              await dbUser.save();
            }
            const token = jwt.sign({ id: dbUser._id }, process.env.JWT_SECRET || 'pixela_secret_key_2026_shutter_stories', { expiresIn: '30d' });
            return res.json({
              token,
              user: {
                id: dbUser._id,
                _id: dbUser._id,
                name: dbUser.name,
                email: dbUser.email,
                role: isSuperAdminEmail ? 'admin' : dbUser.role,
                avatarUrl: dbUser.avatarUrl,
                specialization: dbUser.specialization,
                instagramUrl: dbUser.instagramUrl || '',
                socialLinks: dbUser.socialLinks || [],
                department: dbUser.department,
                semester: dbUser.semester,
                year: dbUser.year,
                isApproved: dbUser.isApproved,
                badges: dbUser.badges,
                gear: dbUser.gear,
              },
            });
          }
        }
      } catch (dbErr) {
        console.warn('DB login query error, falling back to disk/memory storage:', dbErr.message);
      }
    }

    // 2. Check in-memory store and persistent file storage
    const fileUsers = loadRegistrationsFromFile();
    const memUser = memoryStore.users.find(u => (u.email || '').toLowerCase().trim() === normalizedEmail) ||
                    fileUsers.find(u => (u.email || '').toLowerCase().trim() === normalizedEmail);

    if (memUser || isSuperAdminEmail) {
      let isMatch = false;

      // Method A: bcrypt hash compare
      if (memUser?.passwordHash) {
        try {
          isMatch = bcrypt.compareSync(cleanPassword, memUser.passwordHash);
        } catch (e) {
          isMatch = false;
        }
      }

      // Method B: plain text fallback
      if (!isMatch && memUser?.password) {
        if (memUser.password === cleanPassword || memUser.password === password) {
          isMatch = true;
        }
      }

      // Method C: Super admin master passwords
      if (!isMatch && isSuperAdminEmail && (cleanPassword === 'pixela@2026' || cleanPassword === 'password123')) {
        isMatch = true;
      }

      // Method D: Universal development fallback
      if (!isMatch && cleanPassword === 'password123' && memUser) {
        isMatch = true;
      }

      if (isMatch) {
        const adminUser = memUser || {
          _id: 'user_superadmin_pixela',
          id: 'user_superadmin_pixela',
          name: 'Pixela Super Admin',
          email: 'pixela@oriental.ac.in',
          role: 'admin',
          avatarUrl: '/ojashva.jpg',
          specialization: 'Lead Admin & Curator',
          department: 'Information Technology',
          semester: 6,
          year: '3rd Year',
          instagramUrl: 'https://www.instagram.com/mr_ojashva',
          socialLinks: [{ platform: 'instagram', url: 'https://www.instagram.com/mr_ojashva' }],
          isApproved: true,
          badges: ['Verified Crew', 'Prime Shooter', 'Event Lead', 'Tech Head'],
          gear: { cameraBody: 'Sony A7 IV', primaryLens: 'FE 24-70mm f/2.8 GM' }
        };

        if (isSuperAdminEmail) adminUser.role = 'admin';

        // Auto-sync into MongoDB if connected but missing in DB
        if (isDbConnected()) {
          try {
            const exists = await User.findOne({ email: normalizedEmail });
            if (!exists) {
              await User.create({
                name: adminUser.name,
                email: normalizedEmail,
                password: cleanPassword,
                role: adminUser.role || 'member',
                department: adminUser.department || 'General',
                semester: adminUser.semester || 1,
                year: adminUser.year || '1st Year',
                avatarUrl: adminUser.avatarUrl,
                instagramUrl: adminUser.instagramUrl,
                socialLinks: adminUser.socialLinks || [],
                isApproved: adminUser.isApproved,
                badges: adminUser.badges || ['Verified Crew'],
                gear: adminUser.gear || { cameraBody: '', primaryLens: '' }
              });
            }
          } catch (syncErr) {
            console.warn('Silent DB sync error:', syncErr.message);
          }
        }

        const token = jwt.sign({ id: adminUser._id || adminUser.id }, process.env.JWT_SECRET || 'pixela_secret_key_2026_shutter_stories', { expiresIn: '30d' });
        return res.json({
          token,
          user: {
            id: adminUser._id || adminUser.id,
            _id: adminUser._id || adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: isSuperAdminEmail ? 'admin' : adminUser.role,
            avatarUrl: adminUser.avatarUrl,
            specialization: adminUser.specialization || 'Visual Creator',
            instagramUrl: adminUser.instagramUrl || '',
            socialLinks: adminUser.socialLinks || [],
            department: adminUser.department,
            semester: adminUser.semester,
            year: adminUser.year,
            isApproved: adminUser.isApproved,
            badges: adminUser.badges,
            gear: adminUser.gear,
          },
        });
      }
    }

    return res.status(401).json({ error: 'Invalid email or password. Please verify your credentials or register.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/auth/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// Get current authenticated user profile + contributions
router.get('/auth/profile', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let userProfile = null;
    let userPhotos = [];

    if (isDbConnected()) {
      try {
        userProfile = await User.findById(userId).select('-password');
        userPhotos = await GalleryPhoto.find({ photographer: userId }).sort({ createdAt: -1 });
      } catch (dbErr) {
        console.warn('DB profile fetch error:', dbErr.message);
      }
    }

    if (!userProfile) {
      const memUser = memoryStore.users.find(u => String(u._id) === String(userId) || String(u.id) === String(userId));
      if (memUser) {
        const { passwordHash, ...safe } = memUser;
        userProfile = safe;
      } else {
        userProfile = req.user;
      }
      userPhotos = (memoryStore.photos || []).filter(p => String(p.photographer?._id || p.photographer?.id) === String(userId));
    }

    return res.json({
      success: true,
      user: userProfile,
      photos: userPhotos || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update own user profile
router.put('/auth/profile', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      name, avatarUrl, bio, department, year, semester, specialization,
      skills, instagramUrl, socialLinks, currentProfession, pastRole,
      tenureYear, designation, password
    } = req.body;

    const formattedInsta = instagramUrl ? formatSocialUrl('instagram', instagramUrl) : '';
    let finalSocialLinks = [];
    if (formattedInsta) {
      finalSocialLinks.push({ platform: 'instagram', url: formattedInsta });
    }
    if (Array.isArray(socialLinks)) {
      socialLinks.forEach(s => {
        if (s.url && s.url.trim() && s.platform !== 'instagram' && finalSocialLinks.length < 3) {
          finalSocialLinks.push({ platform: s.platform || 'portfolio', url: formatSocialUrl(s.platform, s.url) });
        }
      });
    }
    finalSocialLinks = finalSocialLinks.slice(0, 3);

    const skillsArray = Array.isArray(skills) 
      ? skills 
      : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : undefined);

    let updatedUserResult = null;

    if (isDbConnected()) {
      try {
        const dbUser = await User.findById(userId);
        if (dbUser) {
          if (name && name.trim()) dbUser.name = name.trim();
          if (avatarUrl !== undefined) dbUser.avatarUrl = avatarUrl;
          if (bio !== undefined) dbUser.bio = bio;
          if (department !== undefined) dbUser.department = department;
          if (year !== undefined) dbUser.year = year;
          if (semester !== undefined) dbUser.semester = Number(semester) || 1;
          if (specialization !== undefined) dbUser.specialization = specialization;
          if (skillsArray !== undefined) dbUser.skills = skillsArray;
          if (formattedInsta) dbUser.instagramUrl = formattedInsta;
          if (finalSocialLinks.length > 0) dbUser.socialLinks = finalSocialLinks;
          if (currentProfession !== undefined) dbUser.currentProfession = currentProfession;
          if (pastRole !== undefined) dbUser.pastRole = pastRole;
          if (tenureYear !== undefined) dbUser.tenureYear = tenureYear;
          if (designation !== undefined) dbUser.designation = designation;
          
          if (password && password.trim()) {
            dbUser.password = password.trim();
          }

          await dbUser.save();
          const safeObj = dbUser.toObject();
          delete safeObj.password;
          updatedUserResult = safeObj;
        }
      } catch (dbErr) {
        console.warn('DB profile update error, using memory store:', dbErr.message);
      }
    }

    const memIndex = memoryStore.users.findIndex(u => String(u._id) === String(userId) || String(u.id) === String(userId));
    if (memIndex !== -1) {
      const memUser = memoryStore.users[memIndex];
      if (name && name.trim()) memUser.name = name.trim();
      if (avatarUrl !== undefined) memUser.avatarUrl = avatarUrl;
      if (bio !== undefined) memUser.bio = bio;
      if (department !== undefined) memUser.department = department;
      if (year !== undefined) memUser.year = year;
      if (semester !== undefined) memUser.semester = Number(semester) || 1;
      if (specialization !== undefined) memUser.specialization = specialization;
      if (skillsArray !== undefined) memUser.skills = skillsArray;
      if (formattedInsta) memUser.instagramUrl = formattedInsta;
      if (finalSocialLinks.length > 0) memUser.socialLinks = finalSocialLinks;
      if (currentProfession !== undefined) memUser.currentProfession = currentProfession;
      if (pastRole !== undefined) memUser.pastRole = pastRole;
      if (tenureYear !== undefined) memUser.tenureYear = tenureYear;
      if (designation !== undefined) memUser.designation = designation;
      if (password && password.trim()) {
        memUser.passwordHash = bcrypt.hashSync(password.trim(), 8);
      }
      if (!updatedUserResult) {
        const { passwordHash, ...safe } = memUser;
        updatedUserResult = safe;
      }
    }

    if (!updatedUserResult) {
      updatedUserResult = {
        ...req.user,
        name: name || req.user.name,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : req.user.avatarUrl,
        bio: bio !== undefined ? bio : req.user.bio,
        department: department !== undefined ? department : req.user.department,
        year: year !== undefined ? year : req.user.year,
        semester: semester !== undefined ? Number(semester) : req.user.semester,
        instagramUrl: formattedInsta || req.user.instagramUrl,
        socialLinks: finalSocialLinks.length > 0 ? finalSocialLinks : req.user.socialLinks,
      };
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUserResult,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/auth/profile', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      name, avatarUrl, bio, department, year, semester, specialization,
      skills, instagramUrl, socialLinks, currentProfession, pastRole,
      tenureYear, designation, password
    } = req.body;

    const formattedInsta = instagramUrl ? formatSocialUrl('instagram', instagramUrl) : '';
    let finalSocialLinks = [];
    if (formattedInsta) {
      finalSocialLinks.push({ platform: 'instagram', url: formattedInsta });
    }
    if (Array.isArray(socialLinks)) {
      socialLinks.forEach(s => {
        if (s.url && s.url.trim() && s.platform !== 'instagram' && finalSocialLinks.length < 3) {
          finalSocialLinks.push({ platform: s.platform || 'portfolio', url: formatSocialUrl(s.platform, s.url) });
        }
      });
    }
    finalSocialLinks = finalSocialLinks.slice(0, 3);

    const skillsArray = Array.isArray(skills) 
      ? skills 
      : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : undefined);

    let updatedUserResult = null;

    if (isDbConnected()) {
      try {
        const dbUser = await User.findById(userId);
        if (dbUser) {
          if (name && name.trim()) dbUser.name = name.trim();
          if (avatarUrl !== undefined) dbUser.avatarUrl = avatarUrl;
          if (bio !== undefined) dbUser.bio = bio;
          if (department !== undefined) dbUser.department = department;
          if (year !== undefined) dbUser.year = year;
          if (semester !== undefined) dbUser.semester = Number(semester) || 1;
          if (specialization !== undefined) dbUser.specialization = specialization;
          if (skillsArray !== undefined) dbUser.skills = skillsArray;
          if (formattedInsta) dbUser.instagramUrl = formattedInsta;
          if (finalSocialLinks.length > 0) dbUser.socialLinks = finalSocialLinks;
          if (currentProfession !== undefined) dbUser.currentProfession = currentProfession;
          if (pastRole !== undefined) dbUser.pastRole = pastRole;
          if (tenureYear !== undefined) dbUser.tenureYear = tenureYear;
          if (designation !== undefined) dbUser.designation = designation;
          
          if (password && password.trim()) {
            dbUser.password = password.trim();
          }

          await dbUser.save();
          const safeObj = dbUser.toObject();
          delete safeObj.password;
          updatedUserResult = safeObj;
        }
      } catch (dbErr) {
        console.warn('DB profile update error, using memory store:', dbErr.message);
      }
    }

    const memIndex = memoryStore.users.findIndex(u => String(u._id) === String(userId) || String(u.id) === String(userId));
    if (memIndex !== -1) {
      const memUser = memoryStore.users[memIndex];
      if (name && name.trim()) memUser.name = name.trim();
      if (avatarUrl !== undefined) memUser.avatarUrl = avatarUrl;
      if (bio !== undefined) memUser.bio = bio;
      if (department !== undefined) memUser.department = department;
      if (year !== undefined) memUser.year = year;
      if (semester !== undefined) memUser.semester = Number(semester) || 1;
      if (specialization !== undefined) memUser.specialization = specialization;
      if (skillsArray !== undefined) memUser.skills = skillsArray;
      if (formattedInsta) memUser.instagramUrl = formattedInsta;
      if (finalSocialLinks.length > 0) memUser.socialLinks = finalSocialLinks;
      if (currentProfession !== undefined) memUser.currentProfession = currentProfession;
      if (pastRole !== undefined) memUser.pastRole = pastRole;
      if (tenureYear !== undefined) memUser.tenureYear = tenureYear;
      if (designation !== undefined) memUser.designation = designation;
      if (password && password.trim()) {
        memUser.passwordHash = bcrypt.hashSync(password.trim(), 8);
      }
      if (!updatedUserResult) {
        const { passwordHash, ...safe } = memUser;
        updatedUserResult = safe;
      }
    }

    if (!updatedUserResult) {
      updatedUserResult = {
        ...req.user,
        name: name || req.user.name,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : req.user.avatarUrl,
        bio: bio !== undefined ? bio : req.user.bio,
        department: department !== undefined ? department : req.user.department,
        year: year !== undefined ? year : req.user.year,
        semester: semester !== undefined ? Number(semester) : req.user.semester,
        instagramUrl: formattedInsta || req.user.instagramUrl,
        socialLinks: finalSocialLinks.length > 0 ? finalSocialLinks : req.user.socialLinks,
      };
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUserResult,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   BOOKING/HIRING ENDPOINTS
   ========================================================================== */

router.post('/bookings', async (req, res) => {
  const { clientName, clientEmail, clientPhone, eventType, eventDate, venue, details } = req.body;
  try {
    if (isDbConnected()) {
      try {
        const booking = await Booking.create({
          clientName,
          clientEmail,
          clientPhone,
          eventType,
          eventDate,
          venue,
          details,
        });
        console.log(`[BOOKING] New booking inquiry recorded: ${eventType} by ${clientName}`);
        return res.status(201).json({ success: true, booking });
      } catch (dbErr) {
        console.warn('DB booking creation error, falling back to memory store');
      }
    }

    const newBooking = {
      _id: `booking_${Date.now()}`,
      clientName: clientName || 'Client',
      clientEmail: clientEmail || '',
      clientPhone: clientPhone || '',
      eventType: eventType || 'College Fest',
      eventDate: eventDate ? new Date(eventDate) : new Date(),
      venue: venue || 'Oriental Campus',
      details: details || '',
      status: 'pending',
      createdAt: new Date(),
    };
    memoryStore.bookings.unshift(newBooking);
    console.log(`[BOOKING MEMORY] Booking recorded for ${clientName}`);
    return res.status(201).json({ success: true, booking: newBooking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/bookings', protect, adminOnly, async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        return res.json(bookings);
      } catch (dbErr) {
        console.warn('DB bookings fetch error, using memory fallback');
      }
    }
    return res.json(memoryStore.bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/bookings/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (isDbConnected()) {
      try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (booking) return res.json(booking);
      } catch (dbErr) {
        console.warn('DB booking update error, using memory fallback');
      }
    }

    const booking = memoryStore.bookings.find(b => String(b._id) === String(req.params.id));
    if (booking) {
      booking.status = status;
      return res.json(booking);
    }
    return res.status(404).json({ error: 'Booking not found.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   USER & CREW MANAGEMENT ENDPOINTS (SUPER ADMIN ACCESS)
   ========================================================================== */

// Get all users in the system (Admins, Leaders, Crew, Members, Viewers)
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        if (users && users.length > 0) return res.json(users);
      } catch (dbErr) {
        console.warn('DB all users fetch error, using memory fallback');
      }
    }
    const allUsers = memoryStore.users.map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
    return res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Super Admin add any user/member/leader directly
router.post('/users', protect, adminOnly, async (req, res) => {
  const { name, email, password, role, semester, year, department, bio, skills, specialization, avatarUrl, instagramUrl, socialLinks } = req.body;
  try {
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const formattedInsta = formatSocialUrl('instagram', instagramUrl);
    let finalSocialLinks = Array.isArray(socialLinks) ? socialLinks.map(s => ({
      platform: s.platform || 'other',
      url: formatSocialUrl(s.platform, s.url)
    })) : [];
    if (formattedInsta && !finalSocialLinks.some(s => s.platform === 'instagram')) {
      finalSocialLinks.unshift({ platform: 'instagram', url: formattedInsta });
    }
    finalSocialLinks = finalSocialLinks.slice(0, 3);

    if (isDbConnected()) {
      try {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          return res.status(400).json({ error: 'User with this email already exists.' });
        }
        const user = await User.create({
          name,
          email: normalizedEmail,
          password: password || 'pixela@2026',
          role: role || 'member',
          semester: Number(semester) || 1,
          year: year || '1st Year',
          department: department || 'Information Technology',
          bio: bio || '',
          skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : []),
          specialization: specialization || 'Visual Creator',
          avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          instagramUrl: formattedInsta,
          socialLinks: finalSocialLinks,
          isApproved: true,
        });

        // Immediately persist to single table file (Markdown, CSV, JSON)
        saveRegistrationToFile({
          _id: String(user._id),
          id: String(user._id),
          name: user.name,
          email: user.email,
          password: password || 'pixela@2026',
          role: user.role,
          semester: user.semester,
          year: user.year,
          department: user.department,
          bio: user.bio,
          skills: user.skills,
          specialization: user.specialization,
          avatarUrl: user.avatarUrl,
          instagramUrl: user.instagramUrl,
          socialLinks: user.socialLinks,
          isApproved: true,
          createdAt: user.createdAt || new Date()
        });

        return res.status(201).json({
          success: true,
          message: 'User created successfully.',
          user: {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            specialization: user.specialization,
            instagramUrl: user.instagramUrl,
            socialLinks: user.socialLinks || [],
            department: user.department,
            semester: user.semester,
            year: user.year,
            isApproved: user.isApproved,
          }
        });
      } catch (dbErr) {
        console.warn('DB user creation error, using memory fallback:', dbErr.message);
      }
    }

    const memUserIndex = memoryStore.users.findIndex(u => u.email.toLowerCase() === normalizedEmail);
    if (memUserIndex !== -1) {
      return res.status(400).json({ error: 'User with this email already exists in memory store.' });
    }

    const newId = `user_${Date.now()}`;
    const newUser = {
      _id: newId,
      id: newId,
      name,
      email: normalizedEmail,
      password: password || 'pixela@2026',
      passwordHash: bcrypt.hashSync(password || 'pixela@2026', 8),
      role: role || 'member',
      semester: Number(semester) || 1,
      year: year || '1st Year',
      department: department || 'Information Technology',
      bio: bio || '',
      skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : []),
      specialization: specialization || 'Visual Creator',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      instagramUrl: formattedInsta,
      socialLinks: finalSocialLinks,
      isApproved: true,
      createdAt: new Date(),
    };
    memoryStore.users.push(newUser);
    saveRegistrationToFile(newUser);

    const { passwordHash, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      message: 'User created successfully in store.',
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update any user (Role change, bio, specialization, details)
router.patch('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = { ...req.body };
    delete updateData.password; // Do not overwrite password directly here

    if (isDbConnected()) {
      try {
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
        if (updatedUser) return res.json({ success: true, user: updatedUser });
      } catch (dbErr) {
        console.warn('DB user update error, fallback to memory');
      }
    }

    const userIndex = memoryStore.users.findIndex(u => String(u._id) === String(userId) || String(u.id) === String(userId));
    if (userIndex !== -1) {
      Object.assign(memoryStore.users[userIndex], updateData);
      const { passwordHash, ...safe } = memoryStore.users[userIndex];
      return res.json({ success: true, user: safe });
    }
    return res.status(404).json({ error: 'User not found.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete ANY user (Super Admin permission)
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const targetId = req.params.id;

    if (isDbConnected()) {
      try {
        const targetUser = await User.findById(targetId);
        if (targetUser && targetUser.email?.toLowerCase() === 'pixela@oriental.ac.in') {
          return res.status(403).json({ error: 'Cannot delete the Primary Super Admin root account.' });
        }
        await User.findByIdAndDelete(targetId);
      } catch (dbErr) {
        console.warn('DB user delete error');
      }
    }

    const index = memoryStore.users.findIndex(u => String(u._id) === String(targetId) || String(u.id) === String(targetId));
    if (index !== -1) {
      if (memoryStore.users[index].email?.toLowerCase() === 'pixela@oriental.ac.in') {
        return res.status(403).json({ error: 'Cannot delete the Primary Super Admin root account.' });
      }
      memoryStore.users.splice(index, 1);
    }

    deleteRegistrationFromFile(targetId);

    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to enrich user object with real track record telemetry
const enrichMemberWithTrackRecord = async (userObj) => {
  const userId = userObj._id || userObj.id;
  let photosCount = 0;
  let recentPhotos = [];

  if (isDbConnected()) {
    try {
      photosCount = await GalleryPhoto.countDocuments({ photographer: userId, isApproved: true });
      const photos = await GalleryPhoto.find({ photographer: userId, isApproved: true })
        .select('title imageUrl category createdAt')
        .sort({ createdAt: -1 })
        .limit(6);
      recentPhotos = photos.map(p => ({
        id: p._id,
        _id: p._id,
        title: p.title,
        imageUrl: p.imageUrl,
        category: p.category
      }));
    } catch (e) {
      console.warn('Track record photo query error:', e.message);
    }
  }

  if (photosCount === 0 && memoryStore.photos) {
    const memPhotos = memoryStore.photos.filter(p => 
      p.isApproved && (String(p.photographer?._id || p.photographer?.id || p.photographer) === String(userId))
    );
    photosCount = memPhotos.length;
    recentPhotos = memPhotos.slice(0, 6).map(p => ({
      id: p._id,
      _id: p._id,
      title: p.title,
      imageUrl: p.imageUrl,
      category: p.category
    }));
  }

  const raw = userObj.toObject ? userObj.toObject() : { ...userObj };
  delete raw.password;
  delete raw.passwordHash;

  return {
    ...raw,
    photosCount,
    recentPhotos,
    eventsCount: Array.isArray(raw.eventsCovered) ? raw.eventsCovered.length : 0,
    badges: Array.isArray(raw.badges) && raw.badges.length > 0 ? raw.badges : ['Verified Crew'],
    gear: raw.gear || { cameraBody: '', primaryLens: '', secondaryLens: '', accessories: [] },
    performanceRating: raw.performanceRating || 5,
    trackRecordNotes: raw.trackRecordNotes || '',
    eventsCovered: Array.isArray(raw.eventsCovered) ? raw.eventsCovered : [],
    joinDate: raw.joinDate || raw.createdAt || new Date(),
  };
};

const CREW_ROLES = [
  'member',
  'crew',
  'photographer',
  'admin',
  'president',
  'vice_president',
  'secretary',
  'treasurer',
  'tech_head',
  'creative_head',
  'photography_head',
  'social_media_head'
];

// Public Crew list (Real-time synced with full track record stats for all users)
router.get('/members', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  try {
    if (isDbConnected()) {
      try {
        const members = await User.find({ isApproved: true, role: { $in: CREW_ROLES } })
          .select('-password')
          .sort({ timelineOrder: 1, createdAt: -1 });

        if (members && members.length > 0) {
          const enriched = await Promise.all(members.map(m => enrichMemberWithTrackRecord(m)));
          return res.json(enriched);
        }
      } catch (dbErr) {
        console.warn('DB members fetch error, using memory fallback:', dbErr.message);
      }
    }
    const approved = memoryStore.users
      .filter(u => u.isApproved && CREW_ROLES.includes(u.role));
    
    const enrichedMem = await Promise.all(approved.map(u => enrichMemberWithTrackRecord(u)));
    return res.json(enrichedMem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get individual member track record & dossier
router.get('/members/:id/track-record', async (req, res) => {
  try {
    const targetId = req.params.id;
    let foundUser = null;

    if (isDbConnected()) {
      try {
        foundUser = await User.findById(targetId).select('-password');
      } catch (dbErr) {
        console.warn('DB user track-record fetch error:', dbErr.message);
      }
    }

    if (!foundUser) {
      foundUser = memoryStore.users.find(u => String(u._id) === String(targetId) || String(u.id) === String(targetId));
    }

    if (!foundUser) {
      return res.status(404).json({ error: 'Crew member not found.' });
    }

    const dossier = await enrichMemberWithTrackRecord(foundUser);
    return res.json({ success: true, trackRecord: dossier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update crew member track record (Admin Only: Gear, Badges, Event Coverage, Performance Rating, Notes)
router.patch('/members/:id/track-record', protect, adminOnly, async (req, res) => {
  try {
    const targetId = req.params.id;
    const { gear, badges, eventsCovered, performanceRating, trackRecordNotes, specialization, skills } = req.body;

    const updateFields = {};
    if (gear !== undefined) updateFields.gear = gear;
    if (badges !== undefined) updateFields.badges = Array.isArray(badges) ? badges : [];
    if (eventsCovered !== undefined) updateFields.eventsCovered = Array.isArray(eventsCovered) ? eventsCovered : [];
    if (performanceRating !== undefined) updateFields.performanceRating = Math.min(5, Math.max(1, Number(performanceRating) || 5));
    if (trackRecordNotes !== undefined) updateFields.trackRecordNotes = trackRecordNotes;
    if (specialization !== undefined) updateFields.specialization = specialization;
    if (skills !== undefined) updateFields.skills = Array.isArray(skills) ? skills : [];

    let updatedMember = null;

    if (isDbConnected()) {
      try {
        updatedMember = await User.findByIdAndUpdate(targetId, updateFields, { new: true }).select('-password');
      } catch (dbErr) {
        console.warn('DB track record update error:', dbErr.message);
      }
    }

    const memIndex = memoryStore.users.findIndex(u => String(u._id) === String(targetId) || String(u.id) === String(targetId));
    if (memIndex !== -1) {
      memoryStore.users[memIndex] = { ...memoryStore.users[memIndex], ...updateFields };
      if (!updatedMember) {
        const { passwordHash, ...safe } = memoryStore.users[memIndex];
        updatedMember = safe;
      }
    }

    if (!updatedMember) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    // Persist changes to table file
    saveRegistrationToFile(updatedMember);

    const enriched = await enrichMemberWithTrackRecord(updatedMember);
    return res.json({ success: true, message: 'Track record updated successfully.', member: enriched });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public Alumni list (Real-time synced for all users)
router.get('/alumni', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  try {
    if (isDbConnected()) {
      try {
        const alumni = await User.find({ isApproved: true, role: 'alumni' })
          .select('-password')
          .sort({ createdAt: -1 });
        if (alumni) return res.json(alumni);
      } catch (dbErr) {
        console.warn('DB alumni fetch error, using memory fallback');
      }
    }
    const approved = memoryStore.users
      .filter(u => u.isApproved && u.role === 'alumni')
      .map(u => {
        const { passwordHash, ...safe } = u;
        return safe;
      });
    return res.json(approved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public Faculty Coordinators list (Real-time synced for all users)
router.get('/faculty', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  try {
    if (isDbConnected()) {
      try {
        const faculty = await User.find({ isApproved: true, role: 'faculty' })
          .select('-password')
          .sort({ createdAt: -1 });
        if (faculty) return res.json(faculty);
      } catch (dbErr) {
        console.warn('DB faculty fetch error, using memory fallback');
      }
    }
    const approved = memoryStore.users
      .filter(u => u.isApproved && u.role === 'faculty')
      .map(u => {
        const { passwordHash, ...safe } = u;
        return safe;
      });
    return res.json(approved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pending access requests list (Admins only)
router.get('/members/pending', protect, adminOnly, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    if (isDbConnected()) {
      try {
        const members = await User.find({ isApproved: false }).select('-password').sort({ createdAt: -1 });
        return res.json(members);
      } catch (dbErr) {
        console.warn('DB pending members fetch error, using memory fallback');
      }
    }
    const pending = memoryStore.users.filter(u => !u.isApproved).map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
    return res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ⚡ 1-Click Mass / Bulk Approval for all or selected pending requests
router.patch('/members/bulk-approve', protect, adminOnly, async (req, res) => {
  try {
    const { userIds } = req.body; // Optional array of IDs. If empty/omitted, approves ALL pending.
    let approvedCount = 0;

    if (isDbConnected()) {
      try {
        const query = { isApproved: false };
        if (Array.isArray(userIds) && userIds.length > 0) {
          query._id = { $in: userIds };
        }
        const result = await User.updateMany(query, { $set: { isApproved: true } });
        approvedCount = result.modifiedCount || 0;
      } catch (dbErr) {
        console.warn('DB bulk approve error:', dbErr.message);
      }
    }

    // Sync memoryStore
    memoryStore.users.forEach(u => {
      if (!u.isApproved) {
        if (!Array.isArray(userIds) || userIds.length === 0 || userIds.includes(String(u._id)) || userIds.includes(String(u.id))) {
          u.isApproved = true;
          approvedCount++;
        }
      }
    });

    // Save updated states to persistent file storage
    saveAllRegistrationsToFile(memoryStore.users);

    return res.json({
      success: true,
      message: `Successfully approved ${approvedCount} crew member(s).`,
      approvedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve individual member
router.patch('/members/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const targetId = req.params.id;
    const newApprovedStatus = typeof req.body?.isApproved === 'boolean' ? req.body.isApproved : true;

    if (isDbConnected()) {
      try {
        const member = await User.findByIdAndUpdate(
          targetId, 
          { isApproved: newApprovedStatus }, 
          { new: true }
        ).select('-password');
        if (member) {
          const memIndex = memoryStore.users.findIndex(u => String(u._id) === String(targetId) || String(u.id) === String(targetId));
          if (memIndex !== -1) {
            memoryStore.users[memIndex].isApproved = newApprovedStatus;
          }
          updateRegistrationStatusInFile(targetId, newApprovedStatus);
          const enriched = await enrichMemberWithTrackRecord(member);
          return res.json({ success: true, member: enriched });
        }
      } catch (dbErr) {
        console.warn('DB member approval error, using memory fallback');
      }
    }

    const member = memoryStore.users.find(u => String(u._id) === String(targetId) || String(u.id) === String(targetId));
    if (member) {
      member.isApproved = newApprovedStatus;
      updateRegistrationStatusInFile(targetId, newApprovedStatus);
      const enriched = await enrichMemberWithTrackRecord(member);
      return res.json({ success: true, member: enriched });
    }
    return res.status(404).json({ error: 'Member not found.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject / Decline access request cleanly
router.post('/members/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const memberId = req.params.id;
    if (isDbConnected()) {
      try {
        const targetUser = await User.findById(memberId);
        if (targetUser && targetUser.email?.toLowerCase() === 'pixela@oriental.ac.in') {
          return res.status(403).json({ error: 'Cannot reject the Primary Super Admin account.' });
        }
        await User.findByIdAndDelete(memberId);
      } catch (dbErr) {
        console.warn('DB member reject error');
      }
    }

    const index = memoryStore.users.findIndex(u => String(u._id) === String(memberId) || String(u.id) === String(memberId));
    if (index !== -1) {
      if (memoryStore.users[index].email?.toLowerCase() === 'pixela@oriental.ac.in') {
        return res.status(403).json({ error: 'Cannot reject the Primary Super Admin account.' });
      }
      memoryStore.users.splice(index, 1);
    }

    deleteRegistrationFromFile(memberId);

    return res.json({ success: true, message: 'Crew request declined and removed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete crew member (Super Admin)
router.delete('/members/:id', protect, adminOnly, async (req, res) => {
  try {
    const memberId = req.params.id;
    if (isDbConnected()) {
      try {
        const targetUser = await User.findById(memberId);
        if (targetUser && targetUser.email?.toLowerCase() === 'pixela@oriental.ac.in') {
          return res.status(403).json({ error: 'Cannot delete the Primary Super Admin root account.' });
        }
        await User.findByIdAndDelete(memberId);
      } catch (dbErr) {
        console.warn('DB member delete error');
      }
    }

    const index = memoryStore.users.findIndex(u => String(u._id) === String(memberId) || String(u.id) === String(memberId));
    if (index !== -1) {
      if (memoryStore.users[index].email?.toLowerCase() === 'pixela@oriental.ac.in') {
        return res.status(403).json({ error: 'Cannot delete the Primary Super Admin root account.' });
      }
      memoryStore.users.splice(index, 1);
    }

    deleteRegistrationFromFile(memberId);

    return res.json({ success: true, message: 'Crew member removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   REGISTRATION TABLE & FILE STORAGE EXPORT ENDPOINTS (SUPER ADMIN)
   ========================================================================== */

// Get markdown table view of all registrations
router.get('/admin/registrations-table', protect, adminOnly, (req, res) => {
  try {
    const markdown = getRegistrationsTableMarkdown();
    const users = loadRegistrationsFromFile();
    return res.json({
      success: true,
      totalCount: users.length,
      markdown,
      lastUpdated: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Direct CSV download of all registrations
router.get('/admin/registrations-csv', protect, adminOnly, (req, res) => {
  try {
    const csvContent = getRegistrationsCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="pixela_crew_registrations_${new Date().toISOString().split('T')[0]}.csv"`);
    return res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Force sync between MongoDB and single registration table files
router.post('/admin/sync-registrations-file', protect, adminOnly, async (req, res) => {
  try {
    let syncedCount = 0;
    if (isDbConnected()) {
      try {
        const dbUsers = await User.find().select('+password');
        if (dbUsers && dbUsers.length > 0) {
          const formatted = dbUsers.map(u => ({
            _id: String(u._id),
            id: String(u._id),
            name: u.name,
            email: (u.email || '').toLowerCase().trim(),
            role: u.role,
            semester: u.semester,
            year: u.year,
            department: u.department,
            bio: u.bio,
            skills: u.skills,
            specialization: u.specialization,
            avatarUrl: u.avatarUrl,
            instagramUrl: u.instagramUrl,
            socialLinks: u.socialLinks,
            gear: u.gear,
            badges: u.badges,
            eventsCovered: u.eventsCovered,
            performanceRating: u.performanceRating,
            trackRecordNotes: u.trackRecordNotes,
            isApproved: u.isApproved,
            createdAt: u.createdAt || new Date(),
          }));
          saveAllRegistrationsToFile(formatted);
          memoryStore.users = formatted;
          syncedCount = formatted.length;
        }
      } catch (dbErr) {
        console.warn('Sync DB to file warning:', dbErr.message);
      }
    }
    if (syncedCount === 0) {
      saveAllRegistrationsToFile(memoryStore.users);
      syncedCount = memoryStore.users.length;
    }
    return res.json({
      success: true,
      message: `Synchronized ${syncedCount} member registrations into single table file.`,
      syncedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Intelligent parser for extracting crew members from PDF text, CSV, Markdown tables, or key-value blocks
async function parseCrewFromText(rawText, defaultRole = 'crew', defaultDept = 'Information Technology') {
  if (!rawText || typeof rawText !== 'string') return [];
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const candidates = [];

  // 1. Check if rawText is JSON
  const trimmed = rawText.trim();
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      const parsed = JSON.parse(trimmed);
      const arr = Array.isArray(parsed) ? parsed : (parsed.crew || parsed.members || parsed.users || [parsed]);
      for (const item of arr) {
        if (item && (item.email || item.name)) {
          const email = (item.email || `${(item.name || 'crew').toLowerCase().replace(/\s+/g, '.')}@oriental.ac.in`).toLowerCase().trim();
          candidates.push({
            name: item.name || item.fullName || 'Pixela Crew Member',
            email,
            role: item.role || defaultRole,
            department: item.department || item.dept || defaultDept,
            semester: Number(item.semester) || 6,
            year: item.year || '3rd Year',
            specialization: item.specialization || item.spec || 'Visual Creator',
            skills: Array.isArray(item.skills) ? item.skills : (item.skills ? String(item.skills).split(',').map(s => s.trim()) : ['Photography', 'Event Coverage']),
            instagramUrl: item.instagramUrl || item.instagram || '',
            bio: item.bio || '',
            gear: item.gear || { cameraBody: item.camera || '', primaryLens: item.lens || '' },
            eventsCovered: Array.isArray(item.eventsCovered) ? item.eventsCovered : [],
            badges: Array.isArray(item.badges) ? item.badges : ['Verified Crew']
          });
        }
      }
      if (candidates.length > 0) return candidates;
    } catch (e) {
      // Not JSON, continue with text parsing
    }
  }

  // 2. Check for Table format (Markdown pipe '|' delimiter)
  const tableLines = lines.filter(l => l.includes('|'));
  if (tableLines.length >= 2) {
    const headerLine = tableLines[0];
    const headers = headerLine.split('|').map(h => h.trim().toLowerCase()).filter(Boolean);
    const nameIdx = headers.findIndex(h => h.includes('name'));
    const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
    const roleIdx = headers.findIndex(h => h.includes('role') || h.includes('designation') || h.includes('position'));
    const deptIdx = headers.findIndex(h => h.includes('dept') || h.includes('department') || h.includes('branch'));
    const specIdx = headers.findIndex(h => h.includes('spec') || h.includes('skill'));
    const instaIdx = headers.findIndex(h => h.includes('insta') || h.includes('social'));
    const gearIdx = headers.findIndex(h => h.includes('gear') || h.includes('camera'));

    for (let i = 1; i < tableLines.length; i++) {
      const line = tableLines[i];
      if (line.includes('---')) continue; // Separator row
      const rawCols = line.split('|').map(c => c.trim());
      // Filter out leading/trailing empty cells from outer pipes
      const cols = rawCols.filter((_, idx, arr) => (idx > 0 && idx < arr.length - 1) || arr.length === 1);
      const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : cols[0];
      const email = emailIdx !== -1 && cols[emailIdx] ? cols[emailIdx] : cols.find(c => c.includes('@'));
      if (email && email.includes('@')) {
        candidates.push({
          name: name || 'Crew Member',
          email: email.toLowerCase().trim(),
          role: (roleIdx !== -1 && cols[roleIdx]) ? cols[roleIdx].toLowerCase().trim() : defaultRole,
          department: (deptIdx !== -1 && cols[deptIdx]) ? cols[deptIdx] : defaultDept,
          specialization: (specIdx !== -1 && cols[specIdx]) ? cols[specIdx] : 'Visual Creator',
          instagramUrl: (instaIdx !== -1 && cols[instaIdx]) ? cols[instaIdx] : '',
          gear: (gearIdx !== -1 && cols[gearIdx]) ? { cameraBody: cols[gearIdx], primaryLens: '' } : { cameraBody: '', primaryLens: '' },
          semester: 6,
          year: '3rd Year',
          skills: ['Photography', 'Event Coverage'],
          badges: ['Verified Crew']
        });
      }
    }
    if (candidates.length > 0) return candidates;
  }

  // 3. Check for CSV / Comma-separated format
  const csvLines = lines.filter(l => l.includes(','));
  if (csvLines.length >= 2) {
    const headerLine = csvLines[0];
    const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
    const nameIdx = headers.findIndex(h => h.includes('name'));
    const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
    const roleIdx = headers.findIndex(h => h.includes('role') || h.includes('designation'));
    const deptIdx = headers.findIndex(h => h.includes('dept') || h.includes('department'));
    const specIdx = headers.findIndex(h => h.includes('spec') || h.includes('skill'));

    for (let i = 1; i < csvLines.length; i++) {
      const parts = csvLines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      const email = emailIdx !== -1 && parts[emailIdx] ? parts[emailIdx] : parts.find(p => p.includes('@'));
      const name = nameIdx !== -1 && parts[nameIdx] ? parts[nameIdx] : parts[0];
      if (email && email.includes('@')) {
        candidates.push({
          name: name || 'Crew Member',
          email: email.toLowerCase().trim(),
          role: (roleIdx !== -1 && parts[roleIdx]) ? parts[roleIdx].toLowerCase().trim() : defaultRole,
          department: (deptIdx !== -1 && parts[deptIdx]) ? parts[deptIdx] : defaultDept,
          specialization: (specIdx !== -1 && parts[specIdx]) ? parts[specIdx] : 'Visual Creator',
          semester: 6,
          year: '3rd Year',
          skills: ['Photography', 'Event Coverage'],
          badges: ['Verified Crew']
        });
      }
    }
    if (candidates.length > 0) return candidates;
  }

  // 4. Block / Key-Value recognition (e.g. Name: ..., Email: ...)
  let currentCrew = null;
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith('name:') || lower.startsWith('crew:') || lower.startsWith('member:') || lower.startsWith('student:')) {
      if (currentCrew && currentCrew.email) candidates.push(currentCrew);
      currentCrew = {
        name: line.split(':')[1]?.trim() || 'Crew Member',
        email: '',
        role: defaultRole,
        department: defaultDept,
        specialization: 'Visual Creator',
        semester: 6,
        year: '3rd Year',
        skills: ['Photography', 'Event Coverage'],
        badges: ['Verified Crew']
      };
    } else if (lower.startsWith('email:') || lower.startsWith('mail:')) {
      if (!currentCrew) currentCrew = { name: 'Crew Member', role: defaultRole, department: defaultDept, specialization: 'Visual Creator', semester: 6, year: '3rd Year', skills: ['Photography'], badges: ['Verified Crew'] };
      currentCrew.email = line.split(':')[1]?.trim().toLowerCase() || '';
    } else if (lower.startsWith('role:') || lower.startsWith('designation:')) {
      if (currentCrew) currentCrew.role = line.split(':')[1]?.trim().toLowerCase() || defaultRole;
    } else if (lower.startsWith('department:') || lower.startsWith('dept:') || lower.startsWith('branch:')) {
      if (currentCrew) currentCrew.department = line.split(':')[1]?.trim() || defaultDept;
    } else if (lower.startsWith('specialization:') || lower.startsWith('domain:')) {
      if (currentCrew) currentCrew.specialization = line.split(':')[1]?.trim() || 'Visual Creator';
    } else if (lower.startsWith('camera:') || lower.startsWith('gear:')) {
      if (currentCrew) currentCrew.gear = { cameraBody: line.split(':')[1]?.trim() || '', primaryLens: '' };
    }
  }
  if (currentCrew && currentCrew.email) {
    candidates.push(currentCrew);
  }
  if (candidates.length > 0) return candidates;

  // 5. Line-by-line regex pattern recognition: Any line containing an email
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  for (const line of lines) {
    const match = line.match(emailRegex);
    if (match) {
      const email = match[0].toLowerCase();
      const emailIdx = line.indexOf(match[0]);
      const beforeEmail = line.slice(0, emailIdx).replace(/[-–|,;:]/g, ' ').trim();
      const afterEmail = line.slice(emailIdx + match[0].length).replace(/[-–|,;:]/g, ' ').trim();

      const knownRoles = ['crew', 'photographer', 'tech_head', 'creative_head', 'photography_head', 'social_media_head', 'alumni', 'faculty', 'president', 'vice_president', 'member'];
      let detectedRole = defaultRole;
      let detectedDept = defaultDept;

      for (const r of knownRoles) {
        if (new RegExp(`\\b${r}\\b`, 'i').test(line)) {
          detectedRole = r;
          break;
        }
      }

      if (/computer science|cse/i.test(line)) detectedDept = 'Computer Science';
      else if (/information tech|it\b/i.test(line)) detectedDept = 'Information Technology';
      else if (/electronics|ec\b/i.test(line)) detectedDept = 'Electronics & Communication';
      else if (/mechanical|me\b/i.test(line)) detectedDept = 'Mechanical Engineering';

      let cleanName = '';
      if (beforeEmail && beforeEmail.length >= 2 && !/^\d+$/.test(beforeEmail)) {
        cleanName = beforeEmail;
      } else if (afterEmail && afterEmail.length >= 2 && !/^\d+$/.test(afterEmail)) {
        cleanName = afterEmail.split(/\s{2,}|\t/)[0].trim();
      }

      if (!cleanName || cleanName.length < 2) {
        cleanName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }

      candidates.push({
        name: cleanName,
        email,
        role: detectedRole,
        department: detectedDept,
        specialization: 'Visual Creator',
        semester: 6,
        year: '3rd Year',
        skills: ['Photography', 'Event Coverage'],
        badges: ['Verified Crew']
      });
    }
  }
  if (candidates.length > 0) return candidates;

  // 6. Gemini Generative AI fallback for complex/unstructured PDF text
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Extract all individual crew members, students, photographers, or people listed in the following document text into a strict JSON array of objects.
Each object MUST have:
- "name": string (full name)
- "email": string (email address; if not provided in text, synthesize a valid email like firstname.lastname@oriental.ac.in)
- "role": string (e.g., "crew", "photographer", "member", "tech_head", "creative_head")
- "department": string (e.g. "Information Technology", "Computer Science", etc.)
- "specialization": string (e.g. "Event Photography", "Cinematography", "Lighting")
Return ONLY the raw JSON array without markdown codeblocks or quotes around the array.

Document Text:
${rawText.slice(0, 15000)}`;

      const result = await model.generateContent(prompt);
      const outputText = result.response.text().trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
      const aiParsed = JSON.parse(outputText);
      if (Array.isArray(aiParsed) && aiParsed.length > 0) {
        for (const item of aiParsed) {
          if (item.name || item.email) {
            candidates.push({
              name: item.name || 'Pixela Crew Member',
              email: (item.email || `${(item.name || 'crew').toLowerCase().replace(/\s+/g, '.')}@oriental.ac.in`).toLowerCase().trim(),
              role: item.role || defaultRole,
              department: item.department || defaultDept,
              specialization: item.specialization || 'Visual Creator',
              semester: 6,
              year: '3rd Year',
              skills: ['Photography', 'Event Coverage'],
              badges: ['Verified Crew']
            });
          }
        }
      }
    } catch (aiErr) {
      console.warn('Gemini PDF AI extraction fallback error:', aiErr.message);
    }
  }

  return candidates;
}

// 📤 1-Click Bulk Upload & Auto-Registration for Crew Members (PDF / CSV / JSON)
router.post('/admin/bulk-upload-crew', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a roster file (.pdf, .csv, .json, or .txt).' });
    }

    const { defaultRole = 'crew', defaultDept = 'Information Technology', defaultYear = '3rd Year', defaultSemester = 6 } = req.body;
    const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname?.toLowerCase().endsWith('.pdf');
    let rawText = '';

    if (isPdf) {
      try {
        const parser = new PDFParse({ data: req.file.buffer });
        await parser.load();
        const textResult = await parser.getText();
        rawText = textResult?.text || '';
      } catch (pdfErr) {
        console.error('PDF parsing error:', pdfErr);
        return res.status(400).json({ error: `Failed to read PDF file: ${pdfErr.message}` });
      }
    } else {
      rawText = req.file.buffer.toString('utf-8');
    }

    if (!rawText.trim()) {
      return res.status(400).json({ error: 'Uploaded file is empty or contains no readable text.' });
    }

    // Extract crew candidate records
    const parsedCrew = await parseCrewFromText(rawText, defaultRole, defaultDept);

    if (!parsedCrew || parsedCrew.length === 0) {
      return res.status(400).json({
        error: 'No crew members could be identified in the uploaded document. Please check the file formatting (supports PDF tables, CSV with Name/Email, or JSON list).'
      });
    }

    const registeredUsers = [];
    const updatedUsers = [];

    for (const crew of parsedCrew) {
      const normalizedEmail = crew.email.toLowerCase().trim();
      const defaultPassword = 'pixela@2026';
      const passwordHash = bcrypt.hashSync(defaultPassword, 8);

      const userRecord = {
        name: crew.name,
        email: normalizedEmail,
        password: defaultPassword,
        role: crew.role || defaultRole,
        department: crew.department || defaultDept,
        semester: Number(crew.semester) || Number(defaultSemester) || 6,
        year: crew.year || defaultYear,
        specialization: crew.specialization || 'Visual Creator',
        skills: Array.isArray(crew.skills) && crew.skills.length > 0 ? crew.skills : ['Photography', 'Event Coverage'],
        instagramUrl: crew.instagramUrl || '',
        bio: crew.bio || `Official Pixela Crew Member imported via bulk roster upload.`,
        gear: crew.gear || { cameraBody: '', primaryLens: '', secondaryLens: '', accessories: [] },
        badges: crew.badges || ['Verified Crew'],
        performanceRating: 5,
        trackRecordNotes: 'Provisioned by Super Admin via Bulk Roster Upload.',
        eventsCovered: Array.isArray(crew.eventsCovered) ? crew.eventsCovered : [],
        isApproved: true, // ✅ ALWAYS auto-approved because added by Super Admin directly
        createdAt: new Date(),
      };

      // 1. Database Upsert
      if (isDbConnected()) {
        try {
          let dbUser = await User.findOne({ email: normalizedEmail });
          if (dbUser) {
            dbUser.isApproved = true;
            if (crew.role) dbUser.role = crew.role;
            if (crew.department) dbUser.department = crew.department;
            if (crew.specialization) dbUser.specialization = crew.specialization;
            await dbUser.save();
            userRecord._id = String(dbUser._id);
            userRecord.id = String(dbUser._id);
            updatedUsers.push(dbUser);
          } else {
            const created = await User.create({
              ...userRecord,
              password: defaultPassword,
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            });
            userRecord._id = String(created._id);
            userRecord.id = String(created._id);
            registeredUsers.push(created);
          }
        } catch (dbErr) {
          console.warn('DB upsert error for crew member:', dbErr.message);
        }
      }

      // 2. Memory Store Upsert
      if (!userRecord._id) {
        userRecord._id = `user_crew_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        userRecord.id = userRecord._id;
      }
      userRecord.passwordHash = passwordHash;

      const memIdx = memoryStore.users.findIndex(u => (u.email || '').toLowerCase().trim() === normalizedEmail);
      if (memIdx !== -1) {
        memoryStore.users[memIdx] = {
          ...memoryStore.users[memIdx],
          ...userRecord,
          isApproved: true,
        };
        if (!updatedUsers.some(u => (u.email || '').toLowerCase().trim() === normalizedEmail)) {
          updatedUsers.push(memoryStore.users[memIdx]);
        }
      } else {
        memoryStore.users.push(userRecord);
        if (!registeredUsers.some(u => (u.email || '').toLowerCase().trim() === normalizedEmail)) {
          registeredUsers.push(userRecord);
        }
      }

      // 3. Persist into Single Table File (Markdown, CSV, JSON)
      saveRegistrationToFile(userRecord);
    }

    // Comprehensive table file sync
    saveAllRegistrationsToFile(memoryStore.users);

    const totalProcessed = registeredUsers.length + updatedUsers.length;
    return res.status(201).json({
      success: true,
      message: `⚡ Successfully processed ${totalProcessed} crew members from "${req.file.originalname}"! (${registeredUsers.length} newly registered, ${updatedUsers.length} updated). All are automatically APPROVED and synced.`,
      count: totalProcessed,
      newlyRegisteredCount: registeredUsers.length,
      updatedCount: updatedUsers.length,
      defaultPassword: 'pixela@2026',
      users: [...registeredUsers, ...updatedUsers].map(u => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        isApproved: true,
      }))
    });
  } catch (error) {
    console.error('Bulk upload crew error:', error);
    res.status(500).json({ error: error.message || 'Server error processing crew roster upload.' });
  }
});

/* ==========================================================================
   GALLERY ENDPOINTS (REAL-TIME SYNCED)
   ========================================================================== */

router.get('/gallery', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  try {
    if (isDbConnected()) {
      try {
        const photos = await GalleryPhoto.find({ isApproved: true })
          .populate('photographer', 'name email avatarUrl')
          .sort({ createdAt: -1 });
        if (photos && photos.length > 0) return res.json(photos);
      } catch (dbErr) {
        console.warn('DB gallery fetch error, using memory fallback');
      }
    }
    return res.json(memoryStore.photos.filter(p => p.isApproved));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/gallery/pending', protect, adminOnly, async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const photos = await GalleryPhoto.find({ isApproved: false })
          .populate('photographer', 'name email avatarUrl');
        return res.json(photos);
      } catch (dbErr) {
        console.warn('DB pending gallery fetch error, using memory fallback');
      }
    }
    return res.json(memoryStore.photos.filter(p => !p.isApproved));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/gallery/upload', protect, upload.single('image'), async (req, res) => {
  const { title, description, category, camera, lens, aperture, shutterSpeed, iso, focalLength } = req.body;
  try {
    const userRole = req.user.role || 'viewer';
    const isSuperAdmin = req.user.email?.toLowerCase() === 'pixela@oriental.ac.in' || userRole === 'admin';
    const isViewer = userRole === 'viewer';
    
    // Allowed roles: Pixela Crew, Alumni, and Leadership
    const allowedRoles = [
      'admin', 'president', 'vice_president', 'secretary', 'treasurer',
      'tech_head', 'creative_head', 'photography_head', 'social_media_head',
      'member', 'crew', 'photographer', 'alumni', 'faculty'
    ];

    if (isViewer || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Audience accounts have view-only access. Only Pixela Crew members, Alumni, and Leaders can upload photographs to the Gallery.'
      });
    }

    if (!isSuperAdmin && !req.user.isApproved) {
      return res.status(403).json({
        error: 'Your Crew account is currently pending Super Admin approval. Upload permissions will be active once approved.'
      });
    }

    let mockImage = '/hero_mountain.jpg';
    if (req.file) {
      mockImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    if (isDbConnected()) {
      try {
        const photo = await GalleryPhoto.create({
          imageUrl: mockImage,
          title: title || 'Untitled Capture',
          description: description || '',
          category: category || 'Nature',
          photographer: req.user._id,
          camera: camera || 'Sony Alpha',
          lens: lens || 'Sony G Lens',
          settings: {
            aperture: aperture || 'f/2.8',
            shutterSpeed: shutterSpeed || '1/250s',
            iso: (iso && !isNaN(Number(iso))) ? Number(iso) : 100,
            focalLength: focalLength || '35mm',
          },
          isApproved: true,
        });
        return res.status(201).json({ success: true, photo });
      } catch (dbErr) {
        console.warn('DB photo upload error, falling back to memory store');
      }
    }

    const newPhoto = {
      _id: `photo_${Date.now()}`,
      imageUrl: mockImage,
      title: title || 'Untitled Capture',
      description: description || '',
      category: category || 'Nature',
      photographer: {
        _id: req.user._id,
        name: req.user.name || 'Pixela Creator',
        email: req.user.email || '',
        avatarUrl: req.user.avatarUrl || '',
      },
      camera: camera || 'Sony Alpha',
      lens: lens || 'Sony G Lens',
      settings: {
        aperture: aperture || 'f/2.8',
        shutterSpeed: shutterSpeed || '1/250s',
        iso: (iso && !isNaN(Number(iso))) ? Number(iso) : 100,
        focalLength: focalLength || '35mm',
      },
      likes: [],
      downloadsCount: 0,
      isApproved: true,
      createdAt: new Date(),
    };

    memoryStore.photos.unshift(newPhoto);
    return res.status(201).json({ success: true, photo: newPhoto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/gallery/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const photo = await GalleryPhoto.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
        if (photo) return res.json(photo);
      } catch (dbErr) {
        console.warn('DB photo approval error, using memory fallback');
      }
    }

    const photo = memoryStore.photos.find(p => String(p._id) === String(req.params.id));
    if (photo) {
      photo.isApproved = true;
      return res.json(photo);
    }
    return res.status(404).json({ error: 'Photo not found.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/gallery/:id/like', protect, async (req, res) => {
  try {
    const userIdStr = String(req.user._id);

    if (isDbConnected()) {
      try {
        const photo = await GalleryPhoto.findById(req.params.id);
        if (photo) {
          const index = photo.likes.indexOf(req.user._id);
          if (index === -1) {
            photo.likes.push(req.user._id);
          } else {
            photo.likes.splice(index, 1);
          }
          await photo.save();
          return res.json({ likesCount: photo.likes.length, isLiked: index === -1 });
        }
      } catch (dbErr) {
        console.warn('DB like error, using memory fallback');
      }
    }

    const photo = memoryStore.photos.find(p => String(p._id) === String(req.params.id));
    if (photo) {
      if (!Array.isArray(photo.likes)) photo.likes = [];
      const index = photo.likes.findIndex(id => String(id) === userIdStr);
      if (index === -1) {
        photo.likes.push(userIdStr);
      } else {
        photo.likes.splice(index, 1);
      }
      return res.json({ likesCount: photo.likes.length, isLiked: index === -1 });
    }

    return res.status(404).json({ error: 'Photo not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/gallery/:id', protect, async (req, res) => {
  try {
    const photoId = req.params.id;
    const isSuperAdmin =
      req.user.role === 'admin' ||
      req.user.email?.toLowerCase() === 'pixela@oriental.ac.in';

    if (isDbConnected()) {
      try {
        const photo = await GalleryPhoto.findById(photoId).populate('photographer');
        if (photo) {
          const photogId = String(photo.photographer?._id || photo.photographer);
          const photogEmail = photo.photographer?.email?.toLowerCase();
          const reqUserId = String(req.user._id);
          const reqUserEmail = req.user.email?.toLowerCase();

          const isOwner = photogId === reqUserId || (photogEmail && photogEmail === reqUserEmail);

          if (!isSuperAdmin && !isOwner) {
            return res.status(403).json({
              error: 'Forbidden: You can only delete photographs uploaded from your own account.',
            });
          }

          await GalleryPhoto.findByIdAndDelete(photoId);
          return res.json({ success: true, message: 'Photo removed successfully.' });
        }
      } catch (dbErr) {
        console.warn('DB photo delete check error:', dbErr.message);
      }
    }

    // In-memory check
    const photo = memoryStore.photos.find(p => String(p._id) === String(photoId));
    if (photo) {
      const photogId = String(photo.photographer?._id || photo.photographer?.id || photo.photographer);
      const photogEmail = photo.photographer?.email?.toLowerCase();
      const reqUserId = String(req.user._id);
      const reqUserEmail = req.user.email?.toLowerCase();

      const isOwner = photogId === reqUserId || (photogEmail && photogEmail === reqUserEmail);

      if (!isSuperAdmin && !isOwner) {
        return res.status(403).json({
          error: 'Forbidden: You can only delete photographs uploaded from your own account.',
        });
      }

      const index = memoryStore.photos.indexOf(photo);
      memoryStore.photos.splice(index, 1);
      return res.json({ success: true, message: 'Photo removed successfully.' });
    }

    return res.json({ success: true, message: 'Photo removed.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   EVENTS ENDPOINTS
   ========================================================================== */

router.get('/events', async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const events = await Event.find().sort({ date: 1 });
        if (events && events.length > 0) return res.json(events);
      } catch (dbErr) {
        console.warn('DB events fetch error, using memory fallback');
      }
    }
    return res.json(memoryStore.events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/events', protect, adminOnly, async (req, res) => {
  const { title, slug, type, bannerUrl, description, fullDescription, venue, date, schedule, speakers } = req.body;
  try {
    if (isDbConnected()) {
      try {
        const event = await Event.create({
          title,
          slug: slug || `event-${Date.now()}`,
          type: type || 'Workshop',
          bannerUrl: bannerUrl || '/hero_mountain.jpg',
          description,
          fullDescription,
          venue,
          date: date ? new Date(date) : new Date(),
          schedule: schedule || [],
          speakers: speakers || [],
        });
        return res.status(201).json(event);
      } catch (dbErr) {
        console.warn('DB event creation error, using memory fallback');
      }
    }

    const newEvent = {
      _id: `event_${Date.now()}`,
      title,
      slug: slug || `event-${Date.now()}`,
      type: type || 'Workshop',
      bannerUrl: bannerUrl || '/hero_mountain.jpg',
      description: description || '',
      fullDescription: fullDescription || '',
      venue: venue || 'Oriental Campus',
      date: date ? new Date(date) : new Date(),
      schedule: schedule || [],
      speakers: speakers || [],
      registrations: [],
      status: 'upcoming',
      createdAt: new Date(),
    };
    memoryStore.events.push(newEvent);
    return res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/events/:id/register', protect, async (req, res) => {
  try {
    const userIdStr = String(req.user._id);

    if (isDbConnected()) {
      try {
        const event = await Event.findById(req.params.id);
        if (event) {
          if (event.registrations.includes(req.user._id)) {
            return res.status(400).json({ error: 'Already registered for this event.' });
          }
          event.registrations.push(req.user._id);
          await event.save();
          return res.json({ success: true, registrationsCount: event.registrations.length });
        }
      } catch (dbErr) {
        console.warn('DB event registration error, using memory fallback');
      }
    }

    const event = memoryStore.events.find(e => String(e._id) === String(req.params.id));
    if (event) {
      if (!Array.isArray(event.registrations)) event.registrations = [];
      if (event.registrations.includes(userIdStr)) {
        return res.status(400).json({ error: 'Already registered for this event.' });
      }
      event.registrations.push(userIdStr);
      return res.json({ success: true, registrationsCount: event.registrations.length });
    }

    return res.status(404).json({ error: 'Event not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   BLOG ENDPOINTS
   ========================================================================== */

router.get('/blogs', async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const blogs = await Blog.find({ status: 'published' })
          .populate('author', 'name avatarUrl')
          .sort({ createdAt: -1 });
        if (blogs && blogs.length > 0) return res.json(blogs);
      } catch (dbErr) {
        console.warn('DB blogs fetch error, using memory fallback');
      }
    }
    return res.json(memoryStore.blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/blogs', protect, async (req, res) => {
  const { title, slug, content, category, tags, coverImageUrl } = req.body;
  try {
    if (isDbConnected()) {
      try {
        const blog = await Blog.create({
          title,
          slug: slug || `blog-${Date.now()}`,
          content,
          category,
          tags: tags || [],
          author: req.user._id,
          coverImageUrl,
          status: req.user.role === 'admin' ? 'published' : 'draft',
        });
        return res.status(201).json(blog);
      } catch (dbErr) {
        console.warn('DB blog creation error, using memory fallback');
      }
    }

    const newBlog = {
      _id: `blog_${Date.now()}`,
      title,
      slug: slug || `blog-${Date.now()}`,
      content,
      category,
      tags: tags || [],
      author: {
        _id: req.user._id,
        name: req.user.name,
        avatarUrl: req.user.avatarUrl,
      },
      coverImageUrl,
      status: req.user.role === 'admin' ? 'published' : 'draft',
      createdAt: new Date(),
    };
    memoryStore.blogs.unshift(newBlog);
    return res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   RESOURCE & KNOWLEDGE ENDPOINTS
   ========================================================================== */

router.get('/resources', async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        if (resources && resources.length > 0) return res.json(resources);
      } catch (dbErr) {
        console.warn('DB resources fetch error, using memory fallback');
      }
    }
    return res.json(memoryStore.resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/resources', protect, adminOnly, async (req, res) => {
  const { title, category, software, fileUrl, previewUrl, description, tags, content } = req.body;
  try {
    if (isDbConnected()) {
      try {
        const resource = await Resource.create({
          title,
          category,
          software,
          fileUrl,
          previewUrl,
          description: description || content,
          tags: tags || [],
        });

        if (content) {
          await ChatbotKnowledge.create({
            title,
            content,
            category: category || 'General',
            tags: tags || [],
          });
        }
        return res.status(201).json(resource);
      } catch (dbErr) {
        console.warn('DB resource creation error, using memory fallback');
      }
    }

    const newResource = {
      _id: `res_${Date.now()}`,
      title,
      category,
      software,
      fileUrl,
      previewUrl,
      description: description || content,
      tags: tags || [],
      createdAt: new Date(),
    };
    memoryStore.resources.push(newResource);
    return res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   AI ASSISTANT ENDPOINTS
   ========================================================================== */

router.post('/ai/chat', chatPixie);
router.post('/ai/critique', upload.single('image'), critiquePhoto);

export default router;
