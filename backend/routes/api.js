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

const router = express.Router();

// Multer in-memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

/* ==========================================================================
   IN-MEMORY DATA STORE (Zero-downtime fallback if MongoDB is offline)
   ========================================================================== */

const memoryStore = {
  users: [
    {
      _id: 'user_superadmin_pixela',
      name: 'Pixela Super Admin',
      email: 'pixela@oriental.ac.in',
      passwordHash: bcrypt.hashSync('pixela@2026', 8),
      role: 'admin',
      semester: 6,
      year: '3rd Year',
      department: 'Information Technology',
      skills: ['Club Lead', 'Direction', 'Management', 'Curation'],
      photographyGenre: ['Street', 'Portrait', 'Exhibition'],
      bio: 'Super Administrator of Pixela Photography Club.',
      avatarUrl: '/ojashva.jpg',
      isApproved: true,
      createdAt: new Date(),
    },
    {
      _id: 'user_admin_001',
      name: 'Ojas Shutter',
      email: 'admin@pixela.club',
      passwordHash: bcrypt.hashSync('password123', 8),
      role: 'admin',
      semester: 6,
      year: '3rd Year',
      department: 'Information Technology',
      skills: ['Portraiture', 'Post-processing', 'Lighting'],
      photographyGenre: ['Street', 'Portrait'],
      bio: 'Lead coordinator and Admin of Pixela Photography Club.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      isApproved: true,
      createdAt: new Date(),
    },
    {
      _id: 'user_pres_002',
      name: 'Aarav Sharma',
      email: 'president@pixela.club',
      passwordHash: bcrypt.hashSync('password123', 8),
      role: 'president',
      semester: 8,
      year: '4th Year',
      department: 'Computer Science',
      skills: ['Cinematography', 'Color Grading'],
      photographyGenre: ['Wildlife', 'Drone'],
      bio: 'Behind the glass for 4 years, directing cinematic projects and club activities.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      isApproved: true,
      createdAt: new Date(),
    },
    {
      _id: 'user_vp_003',
      name: 'Nisha Verma',
      email: 'vp@pixela.club',
      passwordHash: bcrypt.hashSync('password123', 8),
      role: 'vice_president',
      semester: 6,
      year: '3rd Year',
      department: 'Electronics',
      skills: ['Macro Photography', 'Adobe Photoshop'],
      photographyGenre: ['Macro', 'Nature'],
      bio: 'Capturing details invisible to the naked eye. Passionate educator.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      isApproved: true,
      createdAt: new Date(),
    },
    {
      _id: 'user_tech_004',
      name: 'Rohan Mehra',
      email: 'techhead@pixela.club',
      passwordHash: bcrypt.hashSync('password123', 8),
      role: 'tech_head',
      semester: 6,
      year: '3rd Year',
      department: 'Information Technology',
      skills: ['Three.js', 'Next.js', 'Web Development'],
      photographyGenre: ['Architecture', 'Night'],
      bio: 'Blending tech and lenses. Built the Pixela platform and handles automation.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      isApproved: true,
      createdAt: new Date(),
    },
  ],

  photos: [
    {
      _id: 'photo_001',
      title: 'Himalayan Ridge Horizon',
      description: 'Sunset hitting the mountain valley horizon in Mussoorie.',
      category: 'Nature',
      imageUrl: '/hero_mountain.jpg',
      photographer: {
        _id: 'user_admin_001',
        name: 'Ojas Shutter',
        email: 'admin@pixela.club',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
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
        _id: 'user_pres_002',
        name: 'Aarav Sharma',
        email: 'president@pixela.club',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
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
        _id: 'user_vp_003',
        name: 'Nisha Verma',
        email: 'vp@pixela.club',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
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
        _id: 'user_tech_004',
        name: 'Rohan Mehra',
        email: 'techhead@pixela.club',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
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
        _id: 'user_admin_001',
        name: 'Ojas Shutter',
        email: 'admin@pixela.club',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
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
        { time: '11:00 AM', title: 'Exhibition Gallery Walkthrough', speaker: 'Ojas Shutter' },
        { time: '02:00 PM', title: 'Creative Keynote & Interactive Q&A', speaker: 'Aarav Sharma' },
        { time: '04:00 PM', title: 'Closing Remarks & Certificate Distribution', speaker: 'Nisha Verma' },
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

router.post('/auth/register', async (req, res) => {
  const { name, email, password, role, semester, year, department, bio, skills, specialization, avatarUrl } = req.body;
  try {
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Check if registering with super admin email
    const isSuperAdminEmail = normalizedEmail === 'pixela@oriental.ac.in';
    const isCrew = role === 'member' || role === 'crew';
    const finalRole = isSuperAdminEmail ? 'admin' : (isCrew ? 'member' : (role || 'viewer'));
    // Only Super Admin is auto-approved. Crew members must be approved by Super Admin.
    const finalApproval = isSuperAdminEmail ? true : false;

    if (isDbConnected()) {
      try {
        let existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          // If superadmin already existed, update credentials / role
          if (isSuperAdminEmail) {
            existingUser.role = 'admin';
            existingUser.isApproved = true;
            if (password) existingUser.password = password;
            if (avatarUrl) existingUser.avatarUrl = avatarUrl;
            await existingUser.save();
            const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET || 'pixela_secret_key_2026_shutter_stories', { expiresIn: '30d' });
            return res.status(200).json({
              token,
              user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                avatarUrl: existingUser.avatarUrl,
                specialization: existingUser.specialization,
                isApproved: existingUser.isApproved,
              },
            });
          }
          return res.status(400).json({ error: 'User already exists with this email.' });
        }

        const user = await User.create({
          name: name || (isSuperAdminEmail ? 'Pixela Super Admin' : 'Pixela Member'),
          email: normalizedEmail,
          password: password || 'password123',
          role: finalRole,
          semester: semester || 1,
          year: year || '1st Year',
          department: department || 'Information Technology',
          bio: bio || (isSuperAdminEmail ? 'Super Administrator of Pixela Photography Club.' : ''),
          skills: skills || [],
          specialization: specialization || (isSuperAdminEmail ? 'Lead Admin & Curator' : 'Visual Creator'),
          avatarUrl: avatarUrl || (isSuperAdminEmail ? '/ojashva.jpg' : ''),
          isApproved: finalApproval,
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'pixela_secret_key_2026_shutter_stories', { expiresIn: '30d' });
        return res.status(201).json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            specialization: user.specialization,
            department: user.department,
            semester: user.semester,
            year: user.year,
            isApproved: user.isApproved,
          },
        });
      } catch (dbErr) {
        console.warn('DB register error, falling back to memory store:', dbErr.message);
      }
    }

    // In-memory fallback
    const memUserIndex = memoryStore.users.findIndex(u => u.email.toLowerCase() === normalizedEmail);
    if (memUserIndex !== -1) {
      if (isSuperAdminEmail) {
        memoryStore.users[memUserIndex].role = 'admin';
        memoryStore.users[memUserIndex].isApproved = true;
        if (password) memoryStore.users[memUserIndex].passwordHash = bcrypt.hashSync(password, 8);
        if (avatarUrl) memoryStore.users[memUserIndex].avatarUrl = avatarUrl;
        const token = jwt.sign({ id: memoryStore.users[memUserIndex]._id }, process.env.JWT_SECRET || 'pixela_secret_key_2026_shutter_stories', { expiresIn: '30d' });
        return res.status(200).json({
          token,
          user: {
            id: memoryStore.users[memUserIndex]._id,
            name: memoryStore.users[memUserIndex].name,
            email: memoryStore.users[memUserIndex].email,
            role: 'admin',
            avatarUrl: memoryStore.users[memUserIndex].avatarUrl,
            specialization: memoryStore.users[memUserIndex].specialization || 'Lead Admin & Curator',
            isApproved: true,
          },
        });
      }
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    const newId = `user_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password || 'password123', 8);

    const newUser = {
      _id: newId,
      name: name || (isSuperAdminEmail ? 'Pixela Super Admin' : 'Pixela Member'),
      email: normalizedEmail,
      passwordHash,
      role: finalRole,
      semester: semester || 1,
      year: year || '1st Year',
      department: department || 'General',
      bio: bio || '',
      skills: skills || [],
      specialization: specialization || (isSuperAdminEmail ? 'Lead Admin & Curator' : 'Visual Creator'),
      avatarUrl: avatarUrl || (isSuperAdminEmail ? '/ojashva.jpg' : ''),
      isApproved: finalApproval,
      createdAt: new Date(),
    };

    memoryStore.users.push(newUser);
    const token = jwt.sign({ id: newId }, process.env.JWT_SECRET || 'pixela_secret_key_2026_shutter_stories', { expiresIn: '30d' });
    return res.status(201).json({
      token,
      user: {
        id: newId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
        specialization: newUser.specialization,
        department: newUser.department,
        semester: newUser.semester,
        year: newUser.year,
        isApproved: newUser.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const isSuperAdminEmail = normalizedEmail === 'pixela@oriental.ac.in';

    if (isDbConnected()) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user && (await user.matchPassword(password))) {
          // If super admin email, guarantee admin role
          if (isSuperAdminEmail && user.role !== 'admin') {
            user.role = 'admin';
            user.isApproved = true;
            await user.save();
          }
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'pixela_secret_key_2026_shutter_stories', { expiresIn: '30d' });
          return res.json({
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: isSuperAdminEmail ? 'admin' : user.role,
              avatarUrl: user.avatarUrl,
              specialization: user.specialization,
              department: user.department,
              semester: user.semester,
              year: user.year,
              isApproved: user.isApproved,
            },
          });
        }
      } catch (dbErr) {
        console.warn('DB login query error, falling back to memory store:', dbErr.message);
      }
    }

    // In-memory fallback
    const memUser = memoryStore.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (memUser || isSuperAdminEmail) {
      const match = (memUser && bcrypt.compareSync(password || '', memUser.passwordHash)) ||
                    (isSuperAdminEmail && (password === 'pixela@2026' || password === 'password123'));
      if (match) {
        const adminUser = memUser || {
          _id: 'user_superadmin_pixela',
          name: 'Pixela Super Admin',
          email: 'pixela@oriental.ac.in',
          role: 'admin',
          avatarUrl: '/ojashva.jpg',
          specialization: 'Lead Admin & Curator',
          department: 'Information Technology',
          semester: 6,
          year: '3rd Year',
          isApproved: true,
        };
        if (isSuperAdminEmail) adminUser.role = 'admin';
        const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'pixela_secret_key_2026_shutter_stories', { expiresIn: '30d' });
        return res.json({
          token,
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: isSuperAdminEmail ? 'admin' : adminUser.role,
            avatarUrl: adminUser.avatarUrl,
            specialization: adminUser.specialization || 'Lead Admin & Curator',
            department: adminUser.department,
            semester: adminUser.semester,
            year: adminUser.year,
            isApproved: adminUser.isApproved,
          },
        });
      }
    }

    return res.status(401).json({ error: 'Invalid email or password.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/auth/me', protect, (req, res) => {
  res.json({ user: req.user });
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
  const { name, email, password, role, semester, year, department, bio, skills, specialization, avatarUrl } = req.body;
  try {
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }
    const normalizedEmail = email.toLowerCase().trim();

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
          isApproved: true,
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
      passwordHash: bcrypt.hashSync(password || 'pixela@2026', 8),
      role: role || 'member',
      semester: Number(semester) || 1,
      year: year || '1st Year',
      department: department || 'Information Technology',
      bio: bio || '',
      skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : []),
      specialization: specialization || 'Visual Creator',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      isApproved: true,
      createdAt: new Date(),
    };
    memoryStore.users.push(newUser);

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

    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public Crew list (Real-time synced for all users)
router.get('/members', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  try {
    if (isDbConnected()) {
      try {
        const members = await User.find({ isApproved: true, role: { $in: ['member', 'crew', 'photographer'] } })
          .select('-password')
          .sort({ createdAt: -1 });
        if (members) return res.json(members);
      } catch (dbErr) {
        console.warn('DB members fetch error, using memory fallback');
      }
    }
    const approved = memoryStore.users
      .filter(u => u.isApproved && (u.role === 'member' || u.role === 'crew' || u.role === 'photographer'))
      .map(u => {
        const { passwordHash, ...safe } = u;
        return safe;
      });
    return res.json(approved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/members/pending', protect, adminOnly, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    if (isDbConnected()) {
      try {
        const members = await User.find({ isApproved: false }).select('-password');
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

router.patch('/members/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const member = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
        if (member) return res.json(member);
      } catch (dbErr) {
        console.warn('DB member approval error, using memory fallback');
      }
    }

    const member = memoryStore.users.find(u => String(u._id) === String(req.params.id));
    if (member) {
      member.isApproved = true;
      const { passwordHash, ...safe } = member;
      return res.json(safe);
    }
    return res.status(404).json({ error: 'Member not found.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
    return res.json({ success: true, message: 'Crew member removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
