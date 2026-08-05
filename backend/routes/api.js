import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
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

// JWT authentication middleware
const protect = async (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith('Bearer')) {
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pixela_secret');
      req.user = await User.findById(decoded.id).select('-password');
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
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admins only.' });
  }
};

/* ==========================================================================
   AUTH ENDPOINTS
   ========================================================================== */

router.post('/auth/register', async (req, res) => {
  const { name, email, password, role, semester, year, department, bio, skills } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // First user is automatically admin, others wait for approval if registering as special roles
    const count = await User.countDocuments();
    const finalRole = count === 0 ? 'admin' : (role || 'member');
    const finalApproval = finalRole === 'member' || finalRole === 'admin';

    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      semester,
      year,
      department,
      bio,
      skills: skills || [],
      isApproved: finalApproval,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'pixela_secret', { expiresIn: '30d' });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'pixela_secret', { expiresIn: '30d' });
      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved },
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/auth/me', protect, (req, res) => {
  res.json({ user: req.user });
});

/* ==========================================================================
   BOOKING/HIRING ENDPOINTS (Mail Connect alerts)
   ========================================================================== */

router.post('/bookings', async (req, res) => {
  const { clientName, clientEmail, clientPhone, eventType, eventDate, venue, details } = req.body;
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
    // Log/Notify in server console as mock Nodemailer
    console.log(`[MAIL SEND] Notification email dispatched to president@pixela.club & client ${clientEmail}`);
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/bookings', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/bookings/:id', protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   CREW MEMBERS ENDPOINTS
   ========================================================================== */

router.get('/members', async (req, res) => {
  try {
    // List approved members (faculty, heads, active crew, alumni)
    const members = await User.find({ isApproved: true }).select('-password').sort({ role: 1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/members/pending', protect, adminOnly, async (req, res) => {
  try {
    const members = await User.find({ isApproved: false }).select('-password');
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/members/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const member = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   GALLERY ENDPOINTS
   ========================================================================== */

router.get('/gallery', async (req, res) => {
  try {
    const photos = await GalleryPhoto.find({ isApproved: true }).populate('photographer', 'name email avatarUrl');
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/gallery/pending', protect, adminOnly, async (req, res) => {
  try {
    const photos = await GalleryPhoto.find({ isApproved: false }).populate('photographer', 'name email avatarUrl');
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/gallery/upload', protect, upload.single('image'), async (req, res) => {
  const { title, description, category, camera, lens, aperture, shutterSpeed, iso, focalLength } = req.body;
  try {
    // Simple local mock imageUrl (stores random Unsplash photo if upload fails, representing fully visual placeholders)
    const mockImage = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : `https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&auto=format&fit=crop&q=80`;

    const photo = await GalleryPhoto.create({
      imageUrl: mockImage,
      title,
      description,
      category,
      photographer: req.user._id,
      camera,
      lens,
      settings: { aperture, shutterSpeed, iso: Number(iso), focalLength },
      isApproved: req.user.role === 'admin', // Auto-approves if user is Admin
    });

    res.status(201).json({ success: true, photo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/gallery/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const photo = await GalleryPhoto.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json(photo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/gallery/:id/like', protect, async (req, res) => {
  try {
    const photo = await GalleryPhoto.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    
    const index = photo.likes.indexOf(req.user._id);
    if (index === -1) {
      photo.likes.push(req.user._id);
    } else {
      photo.likes.splice(index, 1);
    }
    await photo.save();
    res.json({ likesCount: photo.likes.length, isLiked: index === -1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   EVENTS ENDPOINTS (Shutter Stories Spotlight)
   ========================================================================== */

router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/events', protect, adminOnly, async (req, res) => {
  const { title, slug, type, bannerUrl, description, fullDescription, venue, date, schedule, speakers } = req.body;
  try {
    const event = await Event.create({
      title,
      slug,
      type,
      bannerUrl,
      description,
      fullDescription,
      venue,
      date,
      schedule: schedule || [],
      speakers: speakers || [],
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/events/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.registrations.includes(req.user._id)) {
      return res.status(400).json({ error: 'Already registered for this event.' });
    }

    event.registrations.push(req.user._id);
    await event.save();
    res.json({ success: true, registrationsCount: event.registrations.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   BLOG ENDPOINTS
   ========================================================================== */

router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' }).populate('author', 'name avatarUrl').sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/blogs', protect, async (req, res) => {
  const { title, slug, content, category, tags, coverImageUrl } = req.body;
  try {
    const blog = await Blog.create({
      title,
      slug,
      content,
      category,
      tags: tags || [],
      author: req.user._id,
      coverImageUrl,
      status: req.user.role === 'admin' ? 'published' : 'draft',
    });
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   RESOURCE ENDPOINTS
   ========================================================================== */

router.get('/resources', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/resources', protect, adminOnly, async (req, res) => {
  const { title, category, software, fileUrl, previewUrl, description, tags } = req.body;
  try {
    const resource = await Resource.create({
      title,
      category,
      software,
      fileUrl,
      previewUrl,
      description,
      tags: tags || [],
    });
    res.status(201).json(resource);
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
