import {
  FieldValue,
  Timestamp,
  Unsubscribe,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import type { Mod } from '../types';
import { db } from './firebase';
import { deleteImageFromImgbb } from './imgbbService';

export interface ModImageRecord {
  id: string;
  label: string;
  url: string;
  deleteUrl?: string;
}

export interface ModDocument {
  title: string;
  slug: string;
  version?: string;
  tagline?: string;
  description: string;
  tags?: string[];
  downloadUrl: string;
  images?: ModImageRecord[];
  status?: 'draft' | 'published';
  downloads?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  authorName?: string;
  authorId?: string;
  featureList?: string[];
  fileSize?: string;
  gameVersion?: string;
  developerUrl?: string;
  developerName?: string;
  developerLinks?: string[];
  sha256?: string;
  archiveFileName?: string;
  dependencies?: string[];
  videoUrl?: string;
  rating?: number;
  files?: string[];
  installationGuide?: string;
  changelog?: string;
  isFeatured?: boolean;
}

export interface ModInput
  extends Omit<ModDocument, 'slug' | 'downloads' | 'createdAt' | 'updatedAt' | 'status'> {
  slug?: string;
  status?: 'draft' | 'published';
}

const modsCollection = collection(db, 'mods');

export const createSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const DEFAULT_THUMBNAIL = 'https://picsum.photos/seed/cyberpunk/800/600';

const mapDocumentToMod = (doc: ModDocument): Mod => {
  const slug = doc.slug;
  const authorId = doc.authorId ?? slug;
  const authorName = doc.authorName ?? 'Night Market Curator';
  const authorAvatar = `https://avatar.vercel.sh/${encodeURIComponent(authorId)}`;
  const imageUrls = doc.images?.map(image => image.url).filter(Boolean) ?? [];
  const thumbnail = imageUrls[0] ?? DEFAULT_THUMBNAIL;
  const createdAtISO = doc.createdAt instanceof Timestamp ? doc.createdAt.toDate().toISOString() : new Date().toISOString();

  return {
    id: slug,
    title: doc.title,
    author: {
      id: authorId,
      name: authorName,
      avatarUrl: authorAvatar,
    },
    thumbnailUrl: thumbnail,
    images: imageUrls.length ? imageUrls : [thumbnail],
    videoUrl: doc.videoUrl,
    description: doc.tagline || doc.description,
    longDescription: doc.description,
    version: doc.version ?? '1.0.0',
    gameVersion: doc.gameVersion ?? '2.1',
    developerUrl: doc.developerUrl,
    developerName: doc.developerName ?? authorName,
    developerLinks: doc.developerLinks ?? (doc.developerUrl ? [doc.developerUrl] : []),
    downloads: doc.downloads ?? 0,
    rating: doc.rating ?? 5,
    tags: doc.tags ?? [],
    dependencies: doc.dependencies ?? [],
    fileSize: doc.fileSize ?? 'Unspecified',
    uploadedDate: createdAtISO,
    sha256: doc.sha256 ?? '',
    comments: [],
    files: doc.files ?? [],
    downloadUrl: doc.downloadUrl,
    archiveFileName: doc.archiveFileName ?? `${slug}.zip`,
    featureList: doc.featureList ?? [],
    installationGuide: doc.installationGuide,
    changelog: doc.changelog,
    isFeatured: doc.isFeatured ?? false,
  };
};

export const subscribeToMods = (
  onSnapshotMods: (mods: Mod[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  const modsQuery = query(modsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(
    modsQuery,
    snapshot => {
      const nextMods = snapshot.docs.map(docSnap =>
        mapDocumentToMod({ slug: docSnap.id, ...(docSnap.data() as ModDocument) }),
      );
      onSnapshotMods(nextMods);
    },
    error => onError?.(error as Error),
  );
};

export const createModDocument = async (input: ModInput) => {
  const slug = input.slug?.trim() || createSlug(input.title);
  const docRef = doc(modsCollection, slug);
  const developerLinks = (input.developerLinks ?? (input.developerUrl ? [input.developerUrl] : []))
    .map(link => link.trim())
    .filter(Boolean);
  const payload: Omit<ModDocument, 'createdAt' | 'updatedAt'> & {
    createdAt: FieldValue;
    updatedAt: FieldValue;
    downloads: number;
    status: 'draft' | 'published';
  } = {
    ...input,
    slug,
    version: input.version ?? '1.0.0',
    description: input.description || input.tagline || input.title,
    tags: input.tags ?? [],
    images: input.images ?? [],
    downloadUrl: input.downloadUrl,
    gameVersion: input.gameVersion ?? '2.1',
    installationGuide: input.installationGuide?.trim() || undefined,
    changelog: input.changelog?.trim() || undefined,
    status: input.status ?? 'published',
    isFeatured: input.isFeatured ?? false,
    developerName: input.developerName?.trim() || undefined,
    developerLinks,
    developerUrl: developerLinks[0] ?? undefined,
    downloads: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(docRef, payload, { merge: true });
  return slug;
};

const sanitizePayload = (payload: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

export const updateModDocument = async (slug: string, updates: Partial<ModInput>) => {
  const docRef = doc(modsCollection, slug);
  const normalizedDeveloperLinks = updates.developerLinks
    ? updates.developerLinks.map(link => link.trim()).filter(Boolean)
    : updates.developerUrl
      ? [updates.developerUrl.trim()].filter(Boolean)
      : undefined;
  const developerUrl = normalizedDeveloperLinks ? normalizedDeveloperLinks[0] : updates.developerUrl?.trim();
  const payload = sanitizePayload({
    ...updates,
    developerName: updates.developerName?.trim(),
    developerLinks: normalizedDeveloperLinks,
    developerUrl,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(docRef, payload);
};

export const deleteModDocument = async (slug: string) => {
  const docRef = doc(modsCollection, slug);
  const snapshot = await getDoc(docRef);
  const modData = snapshot.data() as ModDocument | undefined;
  await deleteDoc(docRef);

  if (!modData?.images?.length) return;
  const deleteUrls = modData.images.map(image => image.deleteUrl).filter((url): url is string => Boolean(url));
  if (!deleteUrls.length) return;

  await Promise.all(
    deleteUrls.map(async url => {
      try {
        await deleteImageFromImgbb(url);
      } catch (error) {
        console.warn('Failed to delete Imgbb asset for mod', slug, error);
      }
    }),
  );
};
