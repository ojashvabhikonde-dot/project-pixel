import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

const JSON_FILE = path.join(DATA_DIR, 'registrations.json');
const TABLE_FILE = path.join(DATA_DIR, 'crew_registrations_table.md');
const CSV_FILE = path.join(DATA_DIR, 'crew_registrations.csv');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default super admin account
const DEFAULT_SUPERADMIN = {
  _id: 'user_superadmin_pixela',
  id: 'user_superadmin_pixela',
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
  instagramUrl: 'https://www.instagram.com/mr_ojashva',
  socialLinks: [
    { platform: 'instagram', url: 'https://www.instagram.com/mr_ojashva' },
    { platform: 'linkedin', url: 'https://www.linkedin.com/in/ojashva-bhikonde-947a48331' },
    { platform: 'portfolio', url: 'https://portfolio-ojashva.vercel.app/' }
  ],
  gear: {
    cameraBody: 'Sony A7 IV',
    primaryLens: 'FE 24-70mm f/2.8 GM',
    secondaryLens: 'FE 85mm f/1.4 GM',
    accessories: ['DJI RS 3 Pro Gimbal', 'Godox V1 Flash']
  },
  badges: ['Verified Crew', 'Prime Shooter', 'Event Lead', 'Exhibition Curator', 'Tech Head'],
  eventsCovered: [
    {
      eventName: 'Shutter Stories Exhibition 2026',
      date: '2026-08-21T10:00:00.000Z',
      role: 'Exhibition Director',
      location: 'Oriental Campus Auditorium',
      notes: 'Curated 50+ prints and supervised gallery setup.'
    }
  ],
  performanceRating: 5,
  trackRecordNotes: 'Founding Lead Admin and chief curator of Pixela club archives.',
  isApproved: true,
  createdAt: new Date('2024-08-01T00:00:00.000Z'),
};

/**
 * Load all registrations from JSON file
 */
export const loadRegistrationsFromFile = () => {
  try {
    if (!fs.existsSync(JSON_FILE)) {
      const initial = [DEFAULT_SUPERADMIN];
      saveAllRegistrationsToFile(initial);
      return initial;
    }
    const raw = fs.readFileSync(JSON_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = [DEFAULT_SUPERADMIN];
      saveAllRegistrationsToFile(initial);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading registrations file:', err.message);
    return [DEFAULT_SUPERADMIN];
  }
};

/**
 * Generate Markdown Table representation
 */
const generateMarkdownTable = (users) => {
  const timestamp = new Date().toISOString();
  let md = `# Pixela Photography Club - Official Crew & Members Registration Table\n`;
  md += `> **Total Registered Members**: ${users.length} | **Last Updated**: ${timestamp}\n\n`;
  md += `| # | Name | Email | Role | Department | Year / Sem | Instagram / Social | Camera & Gear | Badges | Event Coverage Dates | Approved | Registration Date |\n`;
  md += `|---|---|---|---|---|---|---|---|---|---|---|---|\n`;

  const allEventCoverages = [];

  users.forEach((u, idx) => {
    const num = idx + 1;
    const name = (u.name || 'N/A').replace(/\|/g, '-');
    const email = (u.email || 'N/A').replace(/\|/g, '-');
    const role = (u.role || 'member').toUpperCase();
    const dept = (u.department || 'General').replace(/\|/g, '-');
    const yrSem = `${u.year || '1st Year'} (${u.semester || 1} Sem)`;
    const ig = u.instagramUrl ? u.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '') : 'None';
    const gear = u.gear?.cameraBody ? `${u.gear.cameraBody} (${u.gear.primaryLens || 'Prime Lens'})` : 'Standard Gear';
    const badges = Array.isArray(u.badges) && u.badges.length > 0 ? u.badges.slice(0, 2).join(', ') : 'Verified Crew';
    const approved = u.isApproved ? '✅ YES' : '⏳ PENDING';
    const date = u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Format event coverage dates
    let eventSummary = 'None';
    if (Array.isArray(u.eventsCovered) && u.eventsCovered.length > 0) {
      eventSummary = u.eventsCovered
        .map(e => {
          const eDate = e.date ? new Date(e.date).toISOString().split('T')[0] : 'N/A';
          allEventCoverages.push({
            memberName: u.name,
            memberEmail: u.email,
            memberRole: u.role,
            eventName: e.eventName || 'Unnamed Event',
            date: eDate,
            role: e.role || 'Lead Shooter',
            location: e.location || 'Campus',
            notes: e.notes || ''
          });
          return `${(e.eventName || 'Event').replace(/\|/g, '-')} (${eDate})`;
        })
        .slice(0, 2)
        .join('; ');
      if (u.eventsCovered.length > 2) {
        eventSummary += ` (+${u.eventsCovered.length - 2} more)`;
      }
    }

    md += `| ${num} | **${name}** | \`${email}\` | \`${role}\` | ${dept} | ${yrSem} | ${ig} | ${gear} | ${badges} | ${eventSummary} | ${approved} | ${date} |\n`;
  });

  if (allEventCoverages.length > 0) {
    md += `\n\n## 📅 Crew Event Coverage Log & Dates Timeline\n\n`;
    md += `| Coverage Date | Event Name | Assigned Crew Member | Coverage Role | Location | Notes |\n`;
    md += `|---|---|---|---|---|---|\n`;
    allEventCoverages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    allEventCoverages.forEach(e => {
      md += `| \`${e.date}\` | **${e.eventName}** | ${e.memberName} (\`${e.memberEmail}\`) | \`${e.role}\` | ${e.location} | ${e.notes || 'Official coverage'} |\n`;
    });
  }

  md += `\n---\n*Auto-generated persistent record by Pixela Club Engine. Powered by Oriental Group of Institutes.*\n`;
  return md;
};

/**
 * Generate CSV representation
 */
const generateCsv = (users) => {
  const headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Year', 'Semester', 'Instagram', 'Phone', 'CameraBody', 'PrimaryLens', 'Badges', 'EventsCoveredCount', 'EventCoverageDates', 'PerformanceRating', 'IsApproved', 'RegisteredAt'];
  
  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = users.map(u => {
    const eventDatesStr = Array.isArray(u.eventsCovered) 
      ? u.eventsCovered.map(e => `${e.eventName || 'Event'} (${e.date ? new Date(e.date).toISOString().split('T')[0] : 'N/A'} - ${e.role || 'Shooter'})`).join('; ')
      : '';
    const eventsCount = Array.isArray(u.eventsCovered) ? u.eventsCovered.length : 0;

    return [
      escapeCsv(u._id || u.id),
      escapeCsv(u.name),
      escapeCsv(u.email),
      escapeCsv(u.role),
      escapeCsv(u.department),
      escapeCsv(u.year),
      escapeCsv(u.semester),
      escapeCsv(u.instagramUrl),
      escapeCsv(u.phone || ''),
      escapeCsv(u.gear?.cameraBody || ''),
      escapeCsv(u.gear?.primaryLens || ''),
      escapeCsv(Array.isArray(u.badges) ? u.badges.join('; ') : ''),
      escapeCsv(eventsCount),
      escapeCsv(eventDatesStr),
      escapeCsv(u.performanceRating || 5),
      escapeCsv(u.isApproved ? 'TRUE' : 'FALSE'),
      escapeCsv(u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString())
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Save array of users to JSON, Markdown Table, and CSV
 */
export const saveAllRegistrationsToFile = (users) => {
  try {
    fs.writeFileSync(JSON_FILE, JSON.stringify(users, null, 2), 'utf-8');
    fs.writeFileSync(TABLE_FILE, generateMarkdownTable(users), 'utf-8');
    fs.writeFileSync(CSV_FILE, generateCsv(users), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving registrations to file:', err.message);
    return false;
  }
};

/**
 * Save or update a single registration in the persistent files
 */
export const saveRegistrationToFile = (userData) => {
  try {
    const users = loadRegistrationsFromFile();
    const normalizedEmail = (userData.email || '').toLowerCase().trim();
    const existingIndex = users.findIndex(u => (u.email || '').toLowerCase().trim() === normalizedEmail);

    const safeUserEntry = {
      ...userData,
      email: normalizedEmail,
      updatedAt: new Date()
    };

    if (existingIndex !== -1) {
      users[existingIndex] = { ...users[existingIndex], ...safeUserEntry };
    } else {
      users.push({
        ...safeUserEntry,
        createdAt: userData.createdAt || new Date()
      });
    }

    saveAllRegistrationsToFile(users);
    console.log(`[FILE STORAGE] Registration table updated for: ${safeUserEntry.name} (${safeUserEntry.email})`);
    return true;
  } catch (err) {
    console.error('Failed to save registration to file:', err.message);
    return false;
  }
};

/**
 * Delete a user from registration file
 */
export const deleteRegistrationFromFile = (identifier) => {
  try {
    const users = loadRegistrationsFromFile();
    const filtered = users.filter(u => 
      String(u._id) !== String(identifier) && 
      String(u.id) !== String(identifier) && 
      (u.email || '').toLowerCase().trim() !== (identifier || '').toLowerCase().trim()
    );
    saveAllRegistrationsToFile(filtered);
    return true;
  } catch (err) {
    console.error('Failed to delete registration from file:', err.message);
    return false;
  }
};

/**
 * Update approval status in registration file
 */
export const updateRegistrationStatusInFile = (identifier, isApproved) => {
  try {
    const users = loadRegistrationsFromFile();
    const target = users.find(u => 
      String(u._id) === String(identifier) || 
      String(u.id) === String(identifier) || 
      (u.email || '').toLowerCase().trim() === (identifier || '').toLowerCase().trim()
    );
    if (target) {
      target.isApproved = isApproved;
      target.updatedAt = new Date();
      saveAllRegistrationsToFile(users);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to update status in file:', err.message);
    return false;
  }
};

/**
 * Get Markdown table string
 */
export const getRegistrationsTableMarkdown = () => {
  try {
    if (fs.existsSync(TABLE_FILE)) {
      return fs.readFileSync(TABLE_FILE, 'utf-8');
    }
    const users = loadRegistrationsFromFile();
    return generateMarkdownTable(users);
  } catch (err) {
    return '# Error reading table file';
  }
};

/**
 * Get CSV string
 */
export const getRegistrationsCsv = () => {
  try {
    if (fs.existsSync(CSV_FILE)) {
      return fs.readFileSync(CSV_FILE, 'utf-8');
    }
    const users = loadRegistrationsFromFile();
    return generateCsv(users);
  } catch (err) {
    return 'ID,Name,Email,Role';
  }
};
