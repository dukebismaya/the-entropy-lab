import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';

interface AdminDirectoryResult {
  adminCount: number;
  loading: boolean;
  error: string | null;
}

export const useAdminDirectory = (): AdminDirectoryResult => {
  const [adminCount, setAdminCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const adminsCollection = collection(db, 'admins');
    const unsubscribe = onSnapshot(
      adminsCollection,
      snapshot => {
        setAdminCount(snapshot.size);
        setLoading(false);
      },
      err => {
        console.warn('Failed to load admin directory', err);
        setError(err.message ?? 'Failed to load admins');
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  return { adminCount, loading, error };
};
