import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { uploadImageToImgbb } from '../../services/imgbbService';
import type { Mod } from '../../types';
import { createSlug, type ModImageRecord, type ModInput } from '../../services/modService';
import type { ToastPayload } from '../ui/Toast';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  mods: Mod[];
  loadingMods: boolean;
  onCreateMod: (payload: ModInput) => Promise<void>;
  onUpdateMod: (slug: string, payload: Partial<ModInput>) => Promise<void>;
  onDeleteMod: (slug: string) => Promise<void>;
  onNotify?: (payload: ToastPayload) => void;
  adminEmail?: string;
  onLoaderStateChange?: (key: string, isActive: boolean, message?: string) => void;
}

interface UploadStatus {
  id: string;
  name: string;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  deleteUrl?: string;
  message?: string;
}

interface FormState {
  title: string;
  version: string;
  tagline: string;
  description: string;
  tags: string;
  downloadUrl: string;
  manualImageUrl: string;
  gameVersion: string;
  developerName: string;
  developerLinkInput: string;
  authorName: string;
  installationGuide: string;
  changelog: string;
}

const pipelineSteps = [
  { title: 'Submission Intake', description: 'Manual & automated scanning for package integrity.' },
  { title: 'QA & Telemetry', description: 'Sandbox testing, performance diffing, telemetry signatures.' },
  { title: 'Curator Approval', description: 'Assign reviewers, capture rationale, broadcast decisions.' },
  { title: 'Deployment', description: 'Publish to storefront, notify subscribers, queue social cards.' },
];

const activityFeed = [
  { time: '2m ago', text: 'Marked "Chrome Blade" as featured' },
  { time: '15m ago', text: 'Flagged "Quantum Bloom" for malware re-scan' },
  { time: '1h ago', text: 'Approved new creator "NeoStitch"' },
  { time: '3h ago', text: 'Rolled back "Neon HUD" due to compatibility issue' },
];

const ALIAS_STORAGE_KEY = 'the-entropy-lab::adminAlias';

const getStoredAlias = () => {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(ALIAS_STORAGE_KEY) ?? '';
  } catch (error) {
    console.warn('Unable to read alias from storage', error);
    return '';
  }
};

const persistAlias = (value: string) => {
  if (typeof window === 'undefined') return;
  try {
    if (value) {
      localStorage.setItem(ALIAS_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(ALIAS_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Unable to persist alias', error);
  }
};

const defaultFormState: FormState = {
  title: '',
  version: '1.0.0',
  tagline: '',
  description: '',
  tags: '',
  downloadUrl: '',
  manualImageUrl: '',
  gameVersion: '2.1',
  developerName: '',
  developerLinkInput: '',
  authorName: '',
  installationGuide: '',
  changelog: '',
};

const createInitialFormState = (): FormState => ({
  ...defaultFormState,
  authorName: getStoredAlias() || '',
  developerName: getStoredAlias() || '',
});

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const isValidUrl = (value: string) => {
  try {
    return Boolean(new URL(value));
  } catch (error) {
    return false;
  }
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  mods,
  loadingMods,
  onCreateMod,
  onUpdateMod,
  onDeleteMod,
  onNotify,
  adminEmail,
  onLoaderStateChange,
}) => {
  const [formState, setFormState] = useState<FormState>(() => createInitialFormState());
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modImages, setModImages] = useState<ModImageRecord[]>([]);
  const [developerLinks, setDeveloperLinks] = useState<string[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Mod | null>(null);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);

  const imgbbKeyPresent = Boolean(import.meta.env.VITE_IMGBB_KEY);

  const isUploading = useMemo(
    () => uploadStatuses.some(status => status.status === 'uploading'),
    [uploadStatuses],
  );

  const isEditing = Boolean(editingSlug);

  const totalDownloads = useMemo(() => mods.reduce((sum, mod) => sum + mod.downloads, 0), [mods]);
  const totalScreens = useMemo(() => mods.reduce((sum, mod) => sum + mod.images.length, 0), [mods]);
  const uniqueTags = useMemo(() => new Set(mods.flatMap(mod => mod.tags)).size, [mods]);
  const editingTarget = useMemo(() => mods.find(mod => mod.id === editingSlug) ?? null, [mods, editingSlug]);

  const statBlocks = useMemo(
    () => [
      { label: 'Published Mods', value: mods.length.toString(), accent: 'from-cyber-cyan to-cyber-purple' },
      { label: 'Screens Hosted', value: totalScreens.toString(), accent: 'from-red-400 to-cyber-magenta' },
      { label: 'Total Downloads', value: totalDownloads.toString(), accent: 'from-amber-400 to-cyber-cyan' },
      { label: 'Active Tags', value: uniqueTags.toString(), accent: 'from-cyber-purple to-cyber-cyan' },
    ],
    [mods.length, totalScreens, totalDownloads, uniqueTags],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    persistAlias(formState.authorName.trim());
  }, [formState.authorName]);

  useEffect(() => {
    onLoaderStateChange?.('asset-upload', isUploading, 'Routing lightning captures to Imgbb');
  }, [isUploading, onLoaderStateChange]);

  useEffect(() => {
    if (!submitting) {
      onLoaderStateChange?.('mod-submit', false);
      return;
    }
    const message = editingSlug ? 'Updating mod dossier' : 'Deploying new mod';
    onLoaderStateChange?.('mod-submit', true, message);
  }, [submitting, editingSlug, onLoaderStateChange]);

  useEffect(() => {
    const inFlight = Boolean(deletingSlug);
    onLoaderStateChange?.('mod-delete', inFlight, 'Purging mod from datavault');
  }, [deletingSlug, onLoaderStateChange]);

  useEffect(() => {
    const inFlight = Boolean(togglingFeaturedId);
    onLoaderStateChange?.('featured-toggle', inFlight, 'Tuning featured spotlight');
  }, [togglingFeaturedId, onLoaderStateChange]);

  useEffect(
    () => () => {
      onLoaderStateChange?.('asset-upload', false);
      onLoaderStateChange?.('mod-submit', false);
      onLoaderStateChange?.('mod-delete', false);
      onLoaderStateChange?.('featured-toggle', false);
    },
    [onLoaderStateChange],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleManualImageAdd = () => {
    const manualUrl = formState.manualImageUrl.trim();
    if (!manualUrl || !isValidUrl(manualUrl)) {
      setUploadNotice('Enter a valid https:// image URL before adding it to the stack.');
      return;
    }
    const newImage: ModImageRecord = {
      id: createId(),
      label: manualUrl.split('/').pop() || 'external-image',
      url: manualUrl,
    };
    setModImages(prev => [...prev, newImage]);
    setFormState(prev => ({ ...prev, manualImageUrl: '' }));
    setUploadNotice(null);
  };

  const handleRemoveImage = (id: string) => {
    setModImages(prev => prev.filter(image => image.id !== id));
  };

  const handleUploadFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    if (!imgbbKeyPresent) {
      setUploadNotice('Missing VITE_IMGBB_KEY. Add it to .env to enable direct uploads.');
      return;
    }

    const selectedFiles = Array.from<File>(files);
    const entries: UploadStatus[] = selectedFiles.map(file => ({
      id: createId(),
      name: file.name,
      status: 'uploading',
    }));
    setUploadStatuses(prev => [...entries, ...prev]);
    setUploadNotice('Uploading to Imgbb… keep this tab focused until it completes.');

    await Promise.all(
      selectedFiles.map(async (file, index) => {
        const uploadId = entries[index].id;
        try {
          const payload = await uploadImageToImgbb({ image: file, name: file.name });
          setUploadStatuses(prev =>
            prev.map(status =>
              status.id === uploadId
                ? { ...status, status: 'success', url: payload.url, deleteUrl: payload.delete_url, message: 'Uploaded' }
                : status,
            ),
          );
          setModImages(prev => [
            ...prev,
            { id: uploadId, label: file.name, url: payload.url, deleteUrl: payload.delete_url },
          ]);
          setUploadNotice('Upload complete. Images saved to the current draft.');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Upload failed';
          setUploadStatuses(prev =>
            prev.map(status => (status.id === uploadId ? { ...status, status: 'error', message } : status)),
          );
          setUploadNotice(message);
        }
      }),
    );

    event.target.value = '';
  };

  const handleAddDeveloperLink = () => {
    const url = formState.developerLinkInput.trim();
    if (!url) return;
    if (!isValidUrl(url)) {
      setFormError('Enter a valid https:// developer link before adding it.');
      return;
    }
    setDeveloperLinks(prev => (prev.includes(url) ? prev : [...prev, url]));
    setFormState(prev => ({ ...prev, developerLinkInput: '' }));
    setFormError(null);
  };

  const handleRemoveDeveloperLink = (url: string) => {
    setDeveloperLinks(prev => prev.filter(link => link !== url));
  };

  const resetFormState = (options?: { preserveMessages?: boolean }) => {
    setFormState(createInitialFormState());
    setModImages([]);
    setDeveloperLinks([]);
    setUploadStatuses([]);
    setUploadNotice(null);
    setEditingSlug(null);
    if (!options?.preserveMessages) {
      setFormError(null);
      setFormSuccess(null);
    }
  };

  const beginEditingMod = (mod: Mod) => {
    setEditingSlug(mod.id);
    setFormState({
      title: mod.title,
      version: mod.version,
      tagline: mod.description,
      description: mod.longDescription,
      tags: mod.tags.join(', '),
      downloadUrl: mod.downloadUrl,
      manualImageUrl: '',
      gameVersion: mod.gameVersion,
      developerName: mod.developerName ?? mod.author.name,
      developerLinkInput: '',
      authorName: mod.author.name,
      installationGuide: mod.installationGuide ?? '',
      changelog: mod.changelog ?? '',
    });
    setModImages(
      mod.images.map((url, index) => ({
        id: `${mod.id}-${index}`,
        label: url.split('/').pop() || `${mod.title}-shot-${index + 1}`,
        url,
      })),
    );
    setDeveloperLinks(mod.developerLinks?.length ? mod.developerLinks : mod.developerUrl ? [mod.developerUrl] : []);
    setUploadStatuses([]);
    setFormError(null);
    setFormSuccess(null);
    setUploadNotice(null);
  };

  const requestDeleteMod = (mod: Mod) => {
    setFormError(null);
    setFormSuccess(null);
    setPendingDelete(mod);
  };

  const cancelDeleteRequest = () => {
    setPendingDelete(null);
  };

  const confirmDeleteMod = async () => {
    if (!pendingDelete) return;
    setDeletingSlug(pendingDelete.id);
    try {
      await onDeleteMod(pendingDelete.id);
      if (editingSlug === pendingDelete.id) {
        resetFormState({ preserveMessages: true });
      }
      setFormSuccess('Mod and linked assets deleted.');
      onNotify?.({ message: `${pendingDelete.title} deleted.`, variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete mod.';
      setFormError(message);
      onNotify?.({ message, variant: 'error' });
    } finally {
      setDeletingSlug(null);
      setPendingDelete(null);
    }
  };

  const toggleFeaturedMod = async (mod: Mod) => {
    setTogglingFeaturedId(mod.id);
    const nextState = !mod.isFeatured;
    try {
      await onUpdateMod(mod.id, { isFeatured: nextState });
      onNotify?.({ message: `${mod.title} ${nextState ? 'marked as' : 'removed from'} featured`, variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update featured status.';
      setFormError(message);
      onNotify?.({ message, variant: 'error' });
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  const handleSubmitMod = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formState.title.trim()) {
      setFormError('A title is required to publish a mod.');
      return;
    }

    if (!formState.downloadUrl.trim() || !isValidUrl(formState.downloadUrl)) {
      setFormError('Add a valid https:// download URL for the mod archive.');
      return;
    }

    if (!modImages.length) {
      setFormError('Include at least one screenshot before publishing.');
      return;
    }

    const tags = formState.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    const description = formState.description.trim() || formState.tagline.trim() || formState.title.trim();
    const alias = formState.authorName.trim() || 'Night Market Curator';
    const developerDisplayName = formState.developerName.trim() || alias;
    const curatedDeveloperLinks = developerLinks.map(link => link.trim()).filter(Boolean);

    const basePayload: ModInput = {
      title: formState.title.trim(),
      version: formState.version.trim() || '1.0.0',
      tagline: formState.tagline.trim(),
      description,
      tags,
      downloadUrl: formState.downloadUrl.trim(),
      images: modImages,
      authorName: alias,
      authorId: adminEmail ?? createSlug(alias || formState.title),
      installationGuide: formState.installationGuide.trim() || undefined,
      changelog: formState.changelog.trim() || undefined,
      status: 'published',
      gameVersion: formState.gameVersion.trim() || '2.1',
      developerName: developerDisplayName,
      developerLinks: curatedDeveloperLinks,
      developerUrl: curatedDeveloperLinks[0] || undefined,
    };

    try {
      setSubmitting(true);
      if (isEditing && editingSlug) {
        await onUpdateMod(editingSlug, basePayload);
        setFormSuccess('Mod changes saved to Firestore.');
      } else {
        await onCreateMod(basePayload);
        setFormSuccess('Mod synced to Firestore.');
      }
      resetFormState({ preserveMessages: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to publish mod.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-xl px-4 py-10 animate-fade-in">
      <div className="relative w-full max-w-6xl bg-dark-charcoal/90 border border-white/10 rounded-3xl p-8 overflow-y-auto max-h-[90vh] shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
        <button
          type="button"
          aria-label="Close admin dashboard"
          className="absolute top-6 right-6 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          ×
        </button>
        <header className="mb-10">
          <p className="hero-subtext">Admin Control Deck</p>
          <h1 className="font-orbitron text-4xl text-white tracking-[0.4em]">Command Center</h1>
          <p className="mt-4 text-gray-300 max-w-2xl">
            Ship curated mods straight from Firestore, host screenshots via Imgbb, and keep every catalog across the multiverse live.
          </p>
        </header>
        <section className="glass-card rounded-3xl p-6 border border-white/10 mb-10 overflow-hidden">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-xl font-semibold tracking-[0.25em] text-white uppercase">Mod Submission Builder</h2>
              {mods.length > 0 && (
                <p className="text-xs text-gray-400">{mods.length} published • {totalDownloads} downloads</p>
              )}
            </div>
            <p className="text-sm text-gray-400">
              Upload screenshots to Imgbb, paste the direct download link, and push metadata directly into Firestore.
            </p>
            {!imgbbKeyPresent && (
              <p className="text-xs text-amber-300">
                Set <code className="text-cyber-cyan">VITE_IMGBB_KEY</code> to enable direct uploads. Manual URLs still work.
              </p>
            )}
            {uploadNotice && <p className="text-xs text-cyber-cyan">{uploadNotice}</p>}
            {isEditing && (
              <div className="flex items-center gap-3 text-xs text-amber-200">
                <span>
                  Editing <span className="text-white">{editingTarget?.title ?? editingSlug}</span>
                </span>
                <button type="button" className="text-cyber-cyan hover:underline" onClick={() => resetFormState()}>
                  Cancel edit
                </button>
              </div>
            )}
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <form className="space-y-5 min-w-0" onSubmit={handleSubmitMod}>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-300" htmlFor="mod-title">
                  Mod Title
                </label>
                <input
                  id="mod-title"
                  name="title"
                  type="text"
                  value={formState.title}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan/60"
                  placeholder="Nephilim Multi-Mod"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-300" htmlFor="mod-version">
                    Version
                  </label>
                  <input
                    id="mod-version"
                    name="version"
                    type="text"
                    value={formState.version}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-300" htmlFor="mod-tagline">
                    Tagline / Hook
                  </label>
                  <input
                    id="mod-tagline"
                    name="tagline"
                    type="text"
                    value={formState.tagline}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan/60"
                    placeholder="Dynamic multi-mod toolkit"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-300" htmlFor="mod-description">
                  Description
                </label>
                <textarea
                  id="mod-description"
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan/60 min-h-[120px]"
                  placeholder="Short summary, install quirks, compatibility notes"
                />
                <p className="text-[11px] text-gray-500">Supports Markdown for bold text, lists, links, and tables.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-300" htmlFor="mod-gameVersion">
                    Game Version
                  </label>
                  <input
                    id="mod-gameVersion"
                    name="gameVersion"
                    type="text"
                    value={formState.gameVersion}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan/60"
                    placeholder="2.1"
                  />
                  <p className="text-[11px] text-gray-500">Enter “Universal” to display “All Versions” in the public view.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-300" htmlFor="mod-developerName">
                    Developer Name
                  </label>
                  <input
                    id="mod-developerName"
                    name="developerName"
                    type="text"
                    value={formState.developerName}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan/60"
                    placeholder="Night Market Studio"
                  />
                  <p className="text-[11px] text-gray-500">Shown beside the developer links in the detail view.</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-300" htmlFor="mod-developerLinks">
                  Developer Links
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    id="mod-developerLinks"
                    name="developerLinkInput"
                    type="url"
                    value={formState.developerLinkInput}
                    onChange={handleInputChange}
                    className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan/60"
                    placeholder="https://github.com/night-market"
                  />
                  <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={handleAddDeveloperLink}>
                    Add Link
                  </Button>
                </div>
                {developerLinks.length ? (
                  <ul className="mt-2 flex flex-wrap gap-2 text-xs text-gray-300">
                    {developerLinks.map(link => (
                      <li key={link} className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 bg-black/40">
                        <span className="truncate max-w-[180px]">{link}</span>
                        <button
                          type="button"
                          className="text-white/70 hover:text-white"
                          aria-label={`Remove ${link}`}
                          onClick={() => handleRemoveDeveloperLink(link)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-gray-500">Add as many URLs as needed (GitHub, portfolio, Twitter, etc.).</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-300" htmlFor="mod-authorName">
                  Display Alias
                </label>
                <input
                  id="mod-authorName"
                  name="authorName"
                  type="text"
                  value={formState.authorName}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan/60"
                  placeholder="Night Market Curator"
                />
                <p className="text-[11px] text-gray-500">
                  Pick a callsign we show on mod cards instead of your email.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-300" htmlFor="mod-installationGuide">
                    Installation Instructions
                  </label>
                  <textarea
                    id="mod-installationGuide"
                    name="installationGuide"
                    value={formState.installationGuide}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan/60 min-h-[140px]"
                    placeholder="Step-by-step install guide. Use new lines for bullet points."
                  />
                  <p className="text-[11px] text-gray-500">Players will see this in the Installation panel. Markdown supported.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-300" htmlFor="mod-changelog">
                    Changelog
                  </label>
                  <textarea
                    id="mod-changelog"
                    name="changelog"
                    value={formState.changelog}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan/60 min-h-[140px]"
                    placeholder="v1.2.0 – Added stealth tweaks&#10;v1.1.0 – Fixed crashes"
                  />
                  <p className="text-[11px] text-gray-500">Use one entry per line (Markdown supported). Most recent updates first.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-300" htmlFor="mod-tags">
                    Tags (comma separated)
                  </label>
                  <input
                    id="mod-tags"
                    name="tags"
                    type="text"
                    value={formState.tags}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan/60"
                    placeholder="visual-novel, mod"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-300" htmlFor="mod-downloadUrl">
                    Download URL
                  </label>
                  <input
                    id="mod-downloadUrl"
                    name="downloadUrl"
                    type="url"
                    value={formState.downloadUrl}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan/60"
                    placeholder="https://filehost.com/mod.zip"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Screenshots</p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="relative cursor-pointer rounded-2xl border border-dashed border-white/20 px-5 py-3 text-sm uppercase tracking-[0.3em] text-white/80 hover:border-cyber-cyan/80">
                    Upload files
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={handleUploadFiles}
                    />
                  </label>
                  <p className="text-xs text-gray-500">
                    Drag local shots in. They&apos;ll upload to Imgbb via your API key ({isUploading ? 'uploading…' : 'idle'}).
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <input
                    name="manualImageUrl"
                    type="url"
                    value={formState.manualImageUrl}
                    onChange={handleInputChange}
                    placeholder="https://i.ibb.co/..."
                    className="flex-1 min-w-[200px] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan/60"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-4 py-2 text-xs"
                    onClick={handleManualImageAdd}
                    disabled={!formState.manualImageUrl.trim()}
                  >
                    Add URL
                  </Button>
                </div>
              </div>
              {formError && <p className="text-sm text-red-400">{formError}</p>}
              {formSuccess && <p className="text-sm text-cyber-cyan">{formSuccess}</p>}
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={submitting || isUploading}>
                  {submitting ? 'Publishing…' : 'Publish to Firestore'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => resetFormState()} className="px-6">
                  Reset Draft
                </Button>
              </div>
            </form>
            <div className="space-y-5 min-w-0">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Captured Screens ({modImages.length})</h3>
                  {!!modImages.length && (
                    <button
                      type="button"
                      className="text-xs text-cyber-cyan hover:underline"
                      onClick={() => setModImages([])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {modImages.length === 0 ? (
                  <p className="text-xs text-gray-400">Uploads land here. You can also paste existing URLs above.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {modImages.map(image => (
                      <div key={image.id} className="relative rounded-xl overflow-hidden border border-white/10">
                        <img src={image.url} alt={image.label} className="h-28 w-full object-cover" />
                        <button
                          type="button"
                          className="absolute top-2 right-2 rounded-full bg-black/70 px-2 text-xs text-white"
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {uploadStatuses.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 overflow-hidden">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white mb-3">Upload Activity</h3>
                  <ul className="space-y-2 text-xs text-gray-300">
                    {uploadStatuses.map(status => (
                      <li key={status.id} className="flex items-center justify-between gap-3">
                        <span className="truncate">{status.name}</span>
                        <span
                          className={
                            status.status === 'success'
                              ? 'text-cyber-cyan'
                              : status.status === 'error'
                                ? 'text-red-400'
                                : 'text-amber-300'
                          }
                        >
                          {status.status === 'uploading' && 'Uploading'}
                          {status.status === 'success' && 'Ready'}
                          {status.status === 'error' && (status.message || 'Error')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Published Mods ({mods.length})
                  </h3>
                  {loadingMods && <span className="text-xs text-amber-200">Syncing…</span>}
                </div>
                {mods.length === 0 ? (
                  <p className="text-xs text-gray-400">No mods in Firestore yet. Publish your first drop above.</p>
                ) : (
                  <ul className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {mods.map(mod => (
                      <li key={mod.id} className="rounded-xl border border-white/10 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-white font-semibold">{mod.title}</p>
                              {mod.isFeatured && (
                                <span className="text-[10px] uppercase tracking-[0.3em] text-cyber-cyan">Featured</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">v{mod.version} · {mod.images.length} shots</p>
                            <p className="text-xs text-cyber-cyan mt-1 truncate">{mod.downloadUrl}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-gray-400">{mod.downloads} DLs</span>
                            <button
                              type="button"
                              className={`text-[10px] uppercase tracking-[0.3em] ${mod.isFeatured ? 'text-white' : 'text-cyber-cyan'} hover:underline ${
                                togglingFeaturedId === mod.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              onClick={() => toggleFeaturedMod(mod)}
                              disabled={togglingFeaturedId === mod.id}
                            >
                              {mod.isFeatured ? 'Unfeature' : 'Feature'}
                            </button>
                            <button
                              type="button"
                              className="text-[10px] uppercase tracking-[0.3em] text-cyber-cyan hover:underline"
                              onClick={() => beginEditingMod(mod)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`text-[10px] uppercase tracking-[0.3em] text-red-400 hover:underline ${
                                deletingSlug === mod.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              onClick={() => requestDeleteMod(mod)}
                              disabled={deletingSlug === mod.id}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {mod.tags.length > 0 && (
                          <p className="mt-2 text-[10px] uppercase tracking-[0.4em] text-gray-400">
                            {mod.tags.join(', ')}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statBlocks.map(block => (
            <div
              key={block.label}
              className={`p-5 rounded-2xl border border-white/10 bg-gradient-to-br ${block.accent} text-white shadow-lg`}
            >
              <p className="hero-subtext">{block.label}</p>
              <p className="mt-2 text-3xl font-bold">{block.value}</p>
            </div>
          ))}
        </section>
        <section className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-[0.25em] text-white uppercase">Operational Pipeline</h2>
              <Button variant="ghost" className="px-4 py-2 text-xs">Edit Playbook</Button>
            </div>
            <div className="space-y-5">
              {pipelineSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <span className="w-10 h-10 rounded-full border border-cyber-cyan/60 flex items-center justify-center text-white">{index + 1}</span>
                    {index < pipelineSteps.length - 1 && <span className="flex-1 w-0.5 bg-white/10" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-white">{step.title}</p>
                    <p className="text-gray-300 text-sm mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold tracking-[0.25em] text-white uppercase mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {['Publish Mod', 'Review Reports', 'Creator Access', 'System Settings'].map(action => (
                <button
                  key={action}
                  type="button"
                  className="w-full text-left px-4 py-3 rounded-2xl border border-white/10 hover:border-cyber-cyan/70 transition-colors"
                >
                  <p className="text-sm font-semibold text-white uppercase tracking-[0.25em]">{action}</p>
                  <p className="text-xs text-gray-400">Coming soon</p>
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-[0.25em] text-white uppercase">Live Activity</h2>
              <Button variant="ghost" className="px-4 py-2 text-xs">View Logs</Button>
            </div>
            <ul className="space-y-4">
              {activityFeed.map(item => (
                <li key={item.time} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{item.text}</p>
                    <p className="text-xs text-gray-400">{item.time}</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-cyber-cyan shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold tracking-[0.25em] text-white uppercase mb-4">Roadmap</h2>
            <div className="space-y-4">
              {[{ title: 'Automated Malware Sandbox', status: 'In Progress' }, { title: 'Creator Badging', status: 'Planned' }, { title: 'AI Curation Assistant', status: 'Research' }].map(item => (
                <div key={item.title} className="p-4 rounded-2xl border border-white/10">
                  <p className="text-sm text-white uppercase tracking-[0.2em]">{item.title}</p>
                  <p className="text-xs text-cyber-cyan mt-1">{item.status}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      {pendingDelete && (
        <div
          className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-xl flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm mod deletion"
        >
          <div className="w-full max-w-xl rounded-3xl border border-red-500/40 bg-dark-charcoal/95 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
            <p className="text-xs uppercase tracking-[0.4em] text-red-300 mb-3">Critical action</p>
            <h3 className="text-2xl font-orbitron text-white mb-4">Delete {pendingDelete.title}?</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              This will remove the Firestore document, all linked screenshots on Imgbb, and any cached dashboard edits. The action cannot be undone.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300 space-y-1">
              <p><span className="text-gray-500">Version:</span> v{pendingDelete.version}</p>
              <p><span className="text-gray-500">Screenshots:</span> {pendingDelete.images.length}</p>
              <p><span className="text-gray-500">Downloads:</span> {pendingDelete.downloads.toLocaleString()}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 justify-end">
              <Button variant="ghost" className="px-6" onClick={cancelDeleteRequest}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmDeleteMod}
                disabled={deletingSlug === pendingDelete.id}
                className="bg-red-600/80 hover:bg-red-500 text-white border border-red-400"
              >
                {deletingSlug === pendingDelete.id ? 'Deleting…' : 'Delete Forever'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
