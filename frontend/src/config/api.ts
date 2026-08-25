export const API_URL = (
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000'
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
).replace(/\/+$/, '');

