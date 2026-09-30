import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp/pixela-data' : path.resolve(__dirname, '../data');

const JSON_FILE = path.join(DATA_DIR, 'registrations.json');
const TABLE_FILE = path.join(DATA_DIR, 'crew_registrations_table.md');
const CSV_FILE = path.join(DATA_DIR, 'crew_registrations.csv');
const BLACKLIST_FILE = path.join(DATA_DIR, 'deleted_crew_blacklist.json');

// Ensure data directory exists safely
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Silent fallback in serverless or read-only environments
}

/**
 * Load set of deleted crew IDs and emails
 */
export const loadDeletedBlacklist = () => {
  try {
    const list = new Set(['aarav.sharma@oriental.ac.in', 'user_crew_1790104369631_i1cp5']);
    if (fs.existsSync(BLACKLIST_FILE)) {
      const data = JSON.parse(fs.readFileSync(BLACKLIST_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        data.forEach(item => list.add(String(item).toLowerCase().trim()));
      }
    }
    const bundledBlacklist = path.resolve(__dirname, '../data/deleted_crew_blacklist.json');
    if (fs.existsSync(bundledBlacklist)) {
      try {
        const bundled = JSON.parse(fs.readFileSync(bundledBlacklist, 'utf-8'));
        if (Array.isArray(bundled)) {
          bundled.forEach(item => list.add(String(item).toLowerCase().trim()));
        }
      } catch (e) {}
    }
    return list;
  } catch (err) {
    return new Set(['aarav.sharma@oriental.ac.in', 'user_crew_1790104369631_i1cp5']);
  }
};

/**
 * Add deleted identifiers to persistent blacklist
 */
export const addToDeletedBlacklist = (identifiers) => {
  try {
    const blacklist = loadDeletedBlacklist();
    const arr = Array.isArray(identifiers) ? identifiers : [identifiers];
    arr.forEach(id => {
      if (id) blacklist.add(String(id).toLowerCase().trim());
    });
    const serialized = JSON.stringify([...blacklist], null, 2);
    try {
      fs.writeFileSync(BLACKLIST_FILE, serialized, 'utf-8');
    } catch (e) {}
    const bundledBlacklist = path.resolve(__dirname, '../data/deleted_crew_blacklist.json');
    try {
      fs.writeFileSync(bundledBlacklist, serialized, 'utf-8');
    } catch (e) {}
    return true;
  } catch (err) {
    return false;
  }
};

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
    const blacklist = loadDeletedBlacklist();
    const filterBlacklist = (list) => {
      if (!Array.isArray(list)) return [DEFAULT_SUPERADMIN];
      return list.filter(u => {
        const id1 = String(u._id || '').toLowerCase().trim();
        const id2 = String(u.id || '').toLowerCase().trim();
        const email = String(u.email || '').toLowerCase().trim();
        return !blacklist.has(id1) && !blacklist.has(id2) && !blacklist.has(email);
      });
    };

    if (!fs.existsSync(JSON_FILE)) {
      // If deployed on Vercel, attempt to seed from the repo data directory
      const bundledSource = path.resolve(__dirname, '../data/registrations.json');
      if (fs.existsSync(bundledSource)) {
        try {
          const rawSource = fs.readFileSync(bundledSource, 'utf-8');
          const parsedSource = JSON.parse(rawSource);
          if (Array.isArray(parsedSource) && parsedSource.length > 0) {
            const clean = filterBlacklist(parsedSource);
            saveAllRegistrationsToFile(clean);
            return clean;
          }
        } catch (e) {}
      }
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
    return filterBlacklist(parsed);
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
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
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
 * Delete a user from registration file permanently
 */
export const deleteRegistrationFromFile = (identifier) => {
  try {
    const cleanId = String(identifier || '').toLowerCase().trim();
    if (!cleanId) return false;

    const users = loadRegistrationsFromFile();
    const target = users.find(u => 
      String(u._id || '').toLowerCase().trim() === cleanId || 
      String(u.id || '').toLowerCase().trim() === cleanId || 
      (u.email || '').toLowerCase().trim() === cleanId
    );

    const idsToBlacklist = [cleanId];
    if (target) {
      if (target._id) idsToBlacklist.push(String(target._id));
      if (target.id) idsToBlacklist.push(String(target.id));
      if (target.email) idsToBlacklist.push(String(target.email));
    }
    addToDeletedBlacklist(idsToBlacklist);

    const filtered = users.filter(u => 
      String(u._id || '').toLowerCase().trim() !== cleanId && 
      String(u.id || '').toLowerCase().trim() !== cleanId && 
      (u.email || '').toLowerCase().trim() !== cleanId &&
      (!target?.email || (u.email || '').toLowerCase().trim() !== (target.email || '').toLowerCase().trim())
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
