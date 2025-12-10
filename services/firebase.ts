import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys: Array<keyof typeof firebaseConfig> = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

requiredKeys.forEach(key => {
  if (!firebaseConfig[key]) {
    throw new Error(`Missing Firebase environment variable for ${key}`);
  }
});

const app = initializeApp(firebaseConfig);

// Lazily enable analytics only in browser environments that support it.
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  isAnalyticsSupported()
    .then(supported => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => {
      // analytics is optional, ignore failures to keep app resilient
    });
}

export const auth = getAuth(app);
export const db = getFirestore(app);

const seedEmailsFromEnv = (import.meta.env.VITE_ADMIN_SEED_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

const adminSeedSet = new Set(seedEmailsFromEnv);

export const isSeedAdminEmail = (email?: string | null) => (email ? adminSeedSet.has(email.toLowerCase()) : false);

export const adminDocIdFromEmail = (email: string) => encodeURIComponent(email.toLowerCase());

export default app;
