// Priority: Localhost browser session → Vercel env var → production fallback
const PRODUCTION_API = 'https://project-pixel-u4xs.vercel.app';

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = (
  isLocalhost ? 'http://localhost:5000' : (process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API)
).replace(/\/+$/, '');

