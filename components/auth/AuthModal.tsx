import React, { useEffect, useState } from 'react';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { Button } from '../ui/Button';
import { ADMIN_ONLY_ERROR, useAuth } from '../../hooks/useAuth';
import { auth } from '../../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'signup';

const ADMIN_GATE_MESSAGE = 'Only admins can sign in right now. Please check back later.';

const formatFirebaseError = (message: string) => {
  if (message.includes('auth/user-not-found')) return "We couldn't find an account with that email.";
  if (message.includes('auth/wrong-password')) return 'Wrong password. Try again or reset it via Firebase.';
  if (message.includes(ADMIN_ONLY_ERROR)) return ADMIN_GATE_MESSAGE;
  if (message.includes('auth/invalid-email')) return 'That email looks invalid. Double-check and try again.';
  if (message.includes('auth/invalid-credential')) return 'Email or password did not match. Try again or reset your password.';
  if (message.includes('auth/email-already-in-use')) return 'That email is already registered. Try logging in instead.';
  if (message.includes('auth/weak-password')) return 'Passwords need at least 6 characters.';
  return 'Something glitched in the Net. Please try again in a moment.';
};

const normalizeAuthErrorCode = async (error: unknown, email: string) => {
  if (typeof window === 'undefined') {
    return error instanceof Error ? error.message : String(error);
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    if (code === 'auth/invalid-credential') {
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        return methods.length ? 'auth/wrong-password' : 'auth/user-not-found';
      } catch {
        return code;
      }
    }
    return code;
  }

  if (error instanceof Error) {
    if (error.message.includes(ADMIN_ONLY_ERROR)) {
      return ADMIN_ONLY_ERROR;
    }
    return error.message;
  }

  return 'auth/unknown-error';
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, error, clearError, user } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [shouldShake, setShouldShake] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setEmail('');
    setPassword('');
    setLocalError(null);
    clearError();
    if (user) {
      onClose();
    }
  }, [isOpen, clearError, user, onClose]);

  const activeError = localError || (error ? formatFirebaseError(error) : null);
  const isAdminOnlyError = activeError === ADMIN_GATE_MESSAGE;

  useEffect(() => {
    if (!isOpen) {
      setShouldShake(false);
      return;
    }
    if (!isAdminOnlyError || typeof window === 'undefined') return;
    setShouldShake(true);
    const timeout = window.setTimeout(() => setShouldShake(false), 700);
    return () => window.clearTimeout(timeout);
  }, [isOpen, isAdminOnlyError]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setLocalError(null);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      onClose();
    } catch (authError) {
      const normalizedCode = await normalizeAuthErrorCode(authError, email);
      setLocalError(formatFirebaseError(normalizedCode));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8 animate-fade-in">
      <div className={`w-full max-w-md relative glass-card rounded-3xl p-8 border border-cyber-purple/50 ${shouldShake ? 'modal-warning' : ''}`}>
        <button
          type="button"
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          ×
        </button>
        <div className="text-center mb-6">
          <p className="hero-subtext">Access Control</p>
          <h2 className="font-orbitron text-3xl text-white tracking-[0.4em]">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
        </div>
        <div className="flex gap-2 mb-8">
          {(['login', 'signup'] as Mode[]).map(tab => (
            <button
              key={tab}
              type="button"
              className={`flex-1 px-4 py-3 rounded-full border transition-all duration-200 uppercase tracking-[0.25em] text-sm ${
                tab === mode
                  ? 'bg-cyber-purple/40 border-cyber-purple text-white'
                  : 'border-white/10 text-gray-400 hover:text-white'
              }`}
              onClick={() => {
                setMode(tab);
                setLocalError(null);
                clearError();
              }}
            >
              {tab === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-xs uppercase tracking-[0.3em] text-gray-300">
            Email
            <input
              type="email"
              className="cyber-input w-full mt-2 px-5"
              placeholder="enter email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block text-xs uppercase tracking-[0.3em] text-gray-300">
            Password
            <input
              type="password"
              className="cyber-input w-full mt-2 px-5"
              placeholder="enter password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>
          {activeError && <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-3">{activeError}</p>}
          {isAdminOnlyError && (
            <p className="text-xs text-center text-red-200 bg-red-500/5 border border-red-500/30 rounded-2xl px-4 py-2">
              Access is limited to vetted archivists while the platform is in early access. Ping the global Ops team if you need elevated rights.
            </p>
          )}
          <Button type="submit" disabled={submitting} className="w-full justify-center">
            {submitting ? 'Syncing…' : mode === 'login' ? 'Login' : 'Create Account'}
          </Button>
        </form>
        <p className="mt-6 text-xs text-gray-400 text-center">
          Admin status syncs from Firestore. If your email is approved (or pre-seeded), the elevated controls appear automatically after login.
        </p>
      </div>
    </div>
  );
};
