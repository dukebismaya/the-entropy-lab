import { cert, getApps, initializeApp, type App, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let appInstance: App | undefined;

const parseServiceAccount = (raw: string | undefined): ServiceAccount => {
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is required for server-side Firebase access');
  }

  const decode = (value: string) => {
    // Support base64-encoded or plain JSON strings
    try {
      return JSON.parse(value);
    } catch (jsonError) {
      const decoded = Buffer.from(value, 'base64').toString('utf8');
      return JSON.parse(decoded);
    }
  };

  const parsed = decode(raw) as Record<string, string>;

  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT must include project_id, client_email, and private_key');
  }

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key.replace(/\\n/g, '\n'),
  } satisfies ServiceAccount;
};

export const getAdminDb = () => {
  if (!appInstance) {
    appInstance = getApps()[0];
  }

  if (!appInstance) {
    const serviceAccount = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT);
    appInstance = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
    });
  }

  return getFirestore(appInstance);
};
