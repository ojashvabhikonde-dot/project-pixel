// Priority: Vercel env var → localhost fallback → production fallback
// NEXT_PUBLIC_API_URL must be set in Vercel Dashboard > Settings > Environment Variables
const PRODUCTION_API = 'https://project-pixel-u4xs.vercel.app';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (isLocalhost ? 'http://localhost:5000' : PRODUCTION_API)
).replace(/\/+$/, '');
