const PRODUCTION_API = 'https://project-pixel-u4xs.vercel.app';

const isBrowser = typeof window !== 'undefined';
const isLocalNetwork = isBrowser && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '0.0.0.0' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.') ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(window.location.hostname)
);

const configuredApi = process.env.NEXT_PUBLIC_API_URL?.trim();

// If in browser on local host/network, connect to port 5001 on the same hostname
let targetApi: string;
if (isBrowser && isLocalNetwork) {
  targetApi = `http://${window.location.hostname}:5001`;
} else if (configuredApi) {
  targetApi = configuredApi;
} else if (isLocalNetwork) {
  targetApi = 'http://localhost:5001';
} else {
  targetApi = PRODUCTION_API;
}

export const API_URL = targetApi.replace(/\/+$/, '');

