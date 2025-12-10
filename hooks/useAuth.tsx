import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { adminDocIdFromEmail, auth, db, isSeedAdminEmail } from '../services/firebase';

export const ADMIN_ONLY_ERROR = 'auth/admin-only';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  adminLoading: boolean;
  isAdmin: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const determineAdminStatus = useCallback(async (email: string) => {
    const adminDocRef = doc(db, 'admins', adminDocIdFromEmail(email));
    const snapshot = await getDoc(adminDocRef);
    if (snapshot.exists()) {
      return true;
    }
    if (isSeedAdminEmail(email)) {
      await setDoc(
        adminDocRef,
        {
          email,
          role: 'admin',
          provisionedAt: serverTimestamp(),
          provisionedVia: 'seed',
        },
        { merge: true },
      );
      return true;
    }
    return false;
  }, []);

  const enforceAdminAccess = useCallback(
    async (email?: string | null) => {
      if (!email) {
        await signOut(auth);
        throw new Error(ADMIN_ONLY_ERROR);
      }
      const status = await determineAdminStatus(email);
      if (!status) {
        await signOut(auth);
        throw new Error(ADMIN_ONLY_ERROR);
      }
      return true;
    },
    [determineAdminStatus],
  );

  useEffect(() => {
    if (!user?.email) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }
    let cancelled = false;
    setAdminLoading(true);
    determineAdminStatus(user.email)
      .then(status => {
        if (!cancelled) {
          setIsAdmin(status);
        }
      })
      .catch(errorResponse => {
        console.warn('Failed to resolve admin status', errorResponse);
        if (!cancelled) {
          setIsAdmin(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAdminLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, determineAdminStatus]);

  const login = useCallback(
    async (email: string, password: string) => {
    setError(null);
    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await enforceAdminAccess(credential.user.email);
    } catch (errorResponse) {
      if (errorResponse instanceof Error) {
        setError(errorResponse.message);
      }
      throw errorResponse;
    }
    },
    [enforceAdminAccess],
  );

  const signup = useCallback(
    async (email: string, password: string) => {
    setError(null);
    try {
        if (!isSeedAdminEmail(email)) {
          throw new Error(ADMIN_ONLY_ERROR);
        }
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (credential.user.email && isSeedAdminEmail(credential.user.email)) {
          await determineAdminStatus(credential.user.email);
      }
    } catch (errorResponse) {
      if (errorResponse instanceof Error) {
        setError(errorResponse.message);
      }
      throw errorResponse;
    }
    },
    [determineAdminStatus],
  );

  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (errorResponse) {
      if (errorResponse instanceof Error) {
        setError(errorResponse.message);
      }
      throw errorResponse;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      adminLoading,
      isAdmin,
      error,
      login,
      signup,
      logout,
      clearError,
    }),
    [user, initializing, adminLoading, isAdmin, error, login, signup, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
