import { useCallback, useEffect, useState } from 'react';
import type { Mod } from '../types';
import {
  createModDocument,
  deleteModDocument,
  subscribeToMods,
  type ModInput,
  updateModDocument,
} from '../services/modService';

interface UseModsResult {
  mods: Mod[];
  loading: boolean;
  error: string | null;
  createMod: (input: ModInput) => Promise<void>;
  updateMod: (slug: string, input: Partial<ModInput>) => Promise<void>;
  deleteMod: (slug: string) => Promise<void>;
}

export const useMods = (initialMods: Mod[] = []): UseModsResult => {
  const [mods, setMods] = useState<Mod[]>(initialMods);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMods(
      snapshotMods => {
        setMods(snapshotMods);
        setLoading(false);
      },
      err => {
        console.warn('Failed to load mods from Firestore', err);
        setError(err.message ?? 'Failed to load mods');
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [initialMods]);

  const createMod = useCallback(async (input: ModInput) => {
    setError(null);
    await createModDocument(input);
  }, []);

  const updateMod = useCallback(async (slug: string, input: Partial<ModInput>) => {
    setError(null);
    await updateModDocument(slug, input);
  }, []);

  const deleteMod = useCallback(async (slug: string) => {
    setError(null);
    await deleteModDocument(slug);
  }, []);

  return { mods, loading, error, createMod, updateMod, deleteMod };
};
