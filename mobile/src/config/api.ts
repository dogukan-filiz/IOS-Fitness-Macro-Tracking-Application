export const API_BASE = (typeof globalThis !== 'undefined' && (globalThis as any).__DEV__)
  ? 'http://localhost:4000'
  : 'https://your-production-backend.example.com';
