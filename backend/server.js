import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRouter from './routes/api.js';

// Import models for seeding
import { User } from './models/User.js';
import { Event } from './models/Event.js';
import { GalleryPhoto } from './models/GalleryPhoto.js';
import { ChatbotKnowledge } from './models/ChatbotKnowledge.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes mapping
app.use('/api', apiRouter);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Pixela Photography Club API running successfully.' });
});

// Seed data function to populate DB on startup if empty
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial crew database...');
      
      // 1. Create Default Super Admin user
      const superAdmin = await User.create({
        name: 'Pixela Super Admin',
        email: 'pixela@oriental.ac.in',
        password: 'pixela@2026',
        role: 'admin',
        semester: 6,
        year: '3rd Year',
        department: 'Information Technology',
        skills: ['Club Lead', 'Direction', 'Management', 'Curation'],
        photographyGenre: ['Street', 'Portrait', 'Exhibition'],
        bio: 'Super Administrator & Coordinator of Pixela Photography Club.',
        avatarUrl: '/ojashva.jpg',
        isApproved: true,
      });

      const admin = superAdmin;

      // 2. Create Leaders
      const leadersData = [
        {
          name: 'Aarav Sharma',
          email: 'president@pixela.club',
          password: 'password123',
          role: 'president',
          semester: 8,
          year: '4th Year',
          department: 'Computer Science',
          skills: ['Cinematography', 'Color Grading'],
          photographyGenre: ['Wildlife', 'Drone'],
          bio: 'Behind the glass for 4 years, directing cinematic projects and club activities.',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
          isApproved: true,
        },
        {
          name: 'Nisha Verma',
          email: 'vp@pixela.club',
          password: 'password123',
          role: 'vice_president',
          semester: 6,
          year: '3rd Year',
          department: 'Electronics',
          skills: ['Macro Photography', 'Adobe Photoshop'],
          photographyGenre: ['Macro', 'Nature'],
          bio: 'Capturing details invisible to the naked eye. Passionate educator.',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
          isApproved: true,
        },
        {
          name: 'Rohan Mehra',
          email: 'techhead@pixela.club',
          password: 'password123',
          role: 'tech_head',
          semester: 6,
          year: '3rd Year',
          department: 'Information Technology',
          skills: ['Three.js', 'Next.js', 'Web Development'],
          photographyGenre: ['Architecture', 'Night'],
          bio: 'Blending tech and lenses. Built the Pixela platform and handles automation.',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
          isApproved: true,
        }
      ];
      const createdLeaders = await User.insertMany(leadersData);

      // 3. Create Shutter Stories Exhibition Event
      console.log('Seeding Shutter Stories Exhibition...');
      const ssEvent = await Event.create({
        title: 'Shutter Stories Photography Exhibition',
        slug: 'shutter-stories-exhibition',
        type: 'Exhibition',
        bannerUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop&q=80',
        description: 'Pixela presents its first-ever self-organized public photography exhibition at Oriental Campus.',
        fullDescription: 'Shutter Stories displays curated polaroids, landscape frames, and wildlife prints captured entirely by the Pixela Crew. Join us to experience stories frozen in time behind the glass. Powered by Oriental Group of Institutes.',
        venue: 'Oriental Campus Auditorium Hall, Bhopal',
        date: new Date('2026-08-21T10:00:00+05:30'),
        schedule: [
          { time: '10:00 AM', title: 'Inauguration Ceremony & Lighting of Lamp', speaker: 'Faculty Coordinator' },
          { time: '11:00 AM', title: 'Exhibition Gallery Walkthrough', speaker: 'Ojas Shutter' },
          { time: '02:00 PM', title: 'Creative Keynote & Interactive Q&A', speaker: 'Aarav Sharma' },
          { time: '04:00 PM', title: 'Closing Remarks & Certificate Distribution', speaker: 'Nisha Verma' }
        ],
        speakers: [
          { name: 'Dr. S. K. Gupta', bio: 'Senior Faculty Advisor & Mentor', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' }
        ],
      });

      // 4. Seed Gallery Photos
      console.log('Seeding Gallery Photos...');
      const mockPhotos = [
        {
          title: 'Himalayan Ridge Horizon',
          description: 'Sunset hitting the mountain valley horizon in Mussoorie.',
          category: 'Nature',
          imageUrl: '/hero_mountain.jpg',
          photographer: admin._id,
          camera: 'Nikon D750',
          lens: 'NIKKOR 24-120mm f/4G',
          settings: { aperture: 'f/8', shutterSpeed: '1/400s', iso: 100, focalLength: '35mm' },
          isApproved: true,
        },
        {
          title: 'Ghat Street Rhythms',
          description: 'Vibrant street scene and bazaars at the ghat entrance.',
          category: 'Street',
          imageUrl: '/hero_street.jpg',
          photographer: createdLeaders[0]._id,
          camera: 'Sony A7 III',
          lens: 'FE 35mm f/1.4 GM',
          settings: { aperture: 'f/2.8', shutterSpeed: '1/250s', iso: 200, focalLength: '35mm' },
          isApproved: true,
        },
        {
          title: 'Flora & Camouflage',
          description: 'Macro perspective of a chameleon resting inside a shoe on a jackfruit tree.',
          category: 'Macro',
          imageUrl: '/hero_nature.jpg',
          photographer: createdLeaders[1]._id,
          camera: 'Canon EOS R5',
          lens: 'RF 100mm f/2.8L Macro',
          settings: { aperture: 'f/2.8', shutterSpeed: '1/320s', iso: 200, focalLength: '100mm' },
          isApproved: true,
        },
        {
          title: 'Holy Ganga Promenade',
          description: 'Pilgrims and visitors walking along the sacred river walkway at dusk.',
          category: 'Events',
          imageUrl: '/hero_river.jpg',
          photographer: createdLeaders[2]._id,
          camera: 'Fujifilm X-T4',
          lens: 'XF 16-55mm f/2.8',
          settings: { aperture: 'f/5.6', shutterSpeed: '1/500s', iso: 160, focalLength: '23mm' },
          isApproved: true,
        },
        {
          title: 'Hillside Haven Estate',
          description: 'Bird-eye top view of hillside cottage and green rooflines.',
          category: 'Architecture',
          imageUrl: '/hero_villa.jpg',
          photographer: admin._id,
          camera: 'Sony A7R IV',
          lens: 'FE 16-35mm f/2.8 GM',
          settings: { aperture: 'f/7.1', shutterSpeed: '1/320s', iso: 100, focalLength: '24mm' },
          isApproved: true,
        }
      ];
      await GalleryPhoto.insertMany(mockPhotos);

      // 5. Seed RAG Bot Knowledge base
      console.log('Seeding Chatbot Knowledge Snippets...');
      const knowledgeItems = [
        {
          title: 'Rule of Thirds',
          content: 'The rule of thirds involves aligning a subject with the guidelines and their intersection points, placing the horizon on the top or bottom line, or allowing linear features in the image to flow from section to section.',
          category: 'Composition',
          tags: ['composition', 'rule of thirds', 'framing']
        },
        {
          title: 'Aperture Settings',
          content: 'Aperture (f-stop) controls depth of field. Lower values like f/1.4 or f/2.8 create shallow depth of field (blurry background, ideal for portraits). Higher values like f/8 or f/11 keep foreground and background sharp (ideal for landscapes).',
          category: 'Camera Settings',
          tags: ['aperture', 'depth of field', 'portrait']
        },
        {
          title: 'Color Grading & LUTs',
          content: 'Look-Up Tables (LUTs) map source colors to target colors in color grading. Premiere Pro and DaVinci Resolve use LUTs to achieve vintage, cinematic, or teal & orange styles quickly on log profile footage.',
          category: 'Editing',
          tags: ['color grading', 'editing', 'lut', 'premiere']
        }
      ];
      await ChatbotKnowledge.insertMany(knowledgeItems);

      console.log('Database seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Start Server immediately so APIs are accessible
const server = app.listen(PORT, () => {
  console.log(`Pixela API Server running on port ${PORT}`);
});

// Connect to MongoDB in background
connectDB().then((connected) => {
  if (connected) {
    seedDatabase();
  }
});
