
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/layout/Header';
import { SiteFooter } from './components/layout/SiteFooter';
import { Hero } from './components/home/Hero';
import { ModCarousel } from './components/mods/ModCarousel';
import { ModDetail } from './components/mods/ModDetail';
import { DiscoverMods } from './components/mods/DiscoverMods';
import { ModCard } from './components/mods/ModCard';
import { mods as initialMods } from './constants';
import type { Mod } from './types';
import { useAuth } from './hooks/useAuth';
import { useAdminDirectory } from './hooks/useAdminDirectory';
import { AuthModal } from './components/auth/AuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { useMods } from './hooks/useMods';
import { ToastStack, type ToastMessage, type ToastPayload } from './components/ui/Toast';
import { Tag } from './components/ui/Tag';
import { LightningLoader } from './components/ui/LightningLoader';
import { RollingCounter } from './components/ui/RollingCounter';
import { ScrollToTopButton } from './components/ui/ScrollToTopButton';
import { WorkInProgressModal } from './components/ui/WorkInProgressModal';

const DOWNLOAD_STORAGE_KEY = 'the-entropy-lab::downloads';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

type ViewMode = 'home' | 'discover';

const App: React.FC = () => {
  const [modCollection, setModCollection] = useState<Mod[]>(initialMods);
  const [selectedModId, setSelectedModId] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [isQuerySynced, setIsQuerySynced] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [downloadSnapshot, setDownloadSnapshot] = useState<Record<string, number>>({});
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isAdminPanelOpen, setAdminPanelOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [modsReady, setModsReady] = useState(false);
  const [loaderFlags, setLoaderFlags] = useState<Record<string, string>>({});
  const [statTokens, setStatTokens] = useState<Record<string, number>>({});
  const [isWorkInProgressOpen, setWorkInProgressOpen] = useState(false);
  const toastTimeouts = useRef<Record<string, number>>({});
  const lastScrollY = useRef(0);
  const [showMobileHeader, setShowMobileHeader] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const { user, isAdmin, adminLoading, initializing: authInitializing, logout } = useAuth();
  const { adminCount, loading: adminDirectoryLoading } = useAdminDirectory();
  const { mods: remoteMods, loading: modsLoading, createMod, updateMod, deleteMod } = useMods(initialMods);

  const scrollToContentTop = useCallback(() => {
    if (typeof window === 'undefined') return;
    const baseOffset = mainRef.current ? mainRef.current.offsetTop : 0;
    const offsetWithBuffer = Math.max(0, baseOffset - 16);
    window.scrollTo({ top: offsetWithBuffer, behavior: 'smooth' });
  }, []);
  useEffect(() => {
    if (!isAdmin) {
      setAdminPanelOpen(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(DOWNLOAD_STORAGE_KEY);
      if (stored) {
        setDownloadSnapshot(JSON.parse(stored) as Record<string, number>);
      }
    } catch (error) {
      console.warn('Failed to hydrate download counts', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    const baseMods = modsLoading ? initialMods : remoteMods;
    setModCollection(
      baseMods.map(mod => {
        const override = downloadSnapshot[mod.id];
        return override && override > mod.downloads ? { ...mod, downloads: override } : mod;
      }),
    );
  }, [remoteMods, downloadSnapshot, initialMods, modsLoading]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(DOWNLOAD_STORAGE_KEY, JSON.stringify(downloadSnapshot));
    } catch (error) {
      console.warn('Failed to persist download counts', error);
    }
  }, [downloadSnapshot, isHydrated]);

  useEffect(() => {
    if (!modsLoading) {
      setModsReady(true);
    }
  }, [modsLoading]);

  const setLoaderFlag = useCallback((key: string, isActive: boolean, message?: string) => {
    setLoaderFlags(prev => {
      if (isActive) {
        const nextMessage = message?.trim();
        if (!nextMessage) {
          return prev;
        }
        if (prev[key] === nextMessage) {
          return prev;
        }
        return { ...prev, [key]: nextMessage };
      }
      if (!(key in prev)) {
        return prev;
      }
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleSelectMod = (mod: Mod) => {
    setSelectedModId(mod.id);
    scrollToContentTop();
  };

  const handleGoHome = () => {
    setSelectedModId(null);
    setViewMode('home');
  };

  const openDiscoverView = useCallback(() => {
    setViewMode('discover');
    setSelectedModId(null);
    scrollToContentTop();
  }, [scrollToContentTop]);

  const closeDiscoverView = useCallback(() => {
    setViewMode('home');
    scrollToContentTop();
  }, [scrollToContentTop]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const applyParams = (searchString: string) => {
      const params = new URLSearchParams(searchString);
      const tagsParam = params.get('tags');
      const parsedTags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      const queryParam = params.get('q') ?? '';
      const viewParam = params.get('view');

      setActiveTags(parsedTags);
      setSearchQuery(queryParam);
      if (viewParam === 'discover' || parsedTags.length > 0 || queryParam.trim()) {
        setViewMode('discover');
      } else if (viewParam === 'home') {
        setViewMode('home');
      }
    };

    applyParams(window.location.search);
    setIsQuerySynced(true);

    const handlePopState = () => {
      applyParams(window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleTagSelect = useCallback(
    (tag: string) => {
      const normalized = tag.toLowerCase();
      const hasTag = activeTags.some(existing => existing.toLowerCase() === normalized);
      const nextTags = hasTag ? activeTags.filter(existing => existing.toLowerCase() !== normalized) : [...activeTags, tag];
      setActiveTags(nextTags);

      const trimmedSearch = searchQuery.trim();
      const willShowDiscover = nextTags.length > 0 || Boolean(trimmedSearch);
      const isListingVisible = viewMode === 'discover' && !selectedModId;
      const shouldScrollToDiscover = (!isListingVisible && willShowDiscover) || Boolean(selectedModId);

      if (willShowDiscover) {
        setViewMode('discover');
      }

      if (selectedModId) {
        setSelectedModId(null);
      }

      if (shouldScrollToDiscover) {
        scrollToContentTop();
      }
    },
    [activeTags, searchQuery, viewMode, selectedModId, scrollToContentTop],
  );

  const clearTagFilter = useCallback(() => {
    setActiveTags([]);
  }, []);

  const removeActiveTag = useCallback((tagToRemove: string) => {
    setActiveTags(prev => prev.filter(tag => tag.toLowerCase() !== tagToRemove.toLowerCase()));
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setViewMode('discover');
    setSelectedModId(null);
    scrollToContentTop();
  }, [searchQuery, scrollToContentTop]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveTags([]);
    setSearchQuery('');
  }, []);

  useEffect(() => {
    if (!isQuerySynced || typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (activeTags.length) {
      params.set('tags', activeTags.join(','));
    }
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      params.set('q', trimmedQuery);
    }
    if (viewMode === 'discover') {
      params.set('view', 'discover');
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [activeTags, searchQuery, viewMode, isQuerySynced]);

  const selectedMod = useMemo(() => {
    if (!selectedModId) return null;
    return modCollection.find(mod => mod.id === selectedModId) ?? null;
  }, [modCollection, selectedModId]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const normalizedTags = useMemo(() => activeTags.map(tag => tag.toLowerCase()), [activeTags]);

  const filteredMods = useMemo(() => {
    return modCollection.filter(mod => {
      if (normalizedTags.length) {
        const modTags = mod.tags.map(tag => tag.toLowerCase());
        const matchesAll = normalizedTags.every(tag => modTags.includes(tag));
        if (!matchesAll) return false;
      }
      if (normalizedSearch) {
        const haystack = [
          mod.title,
          mod.description,
          mod.longDescription,
          mod.author.name,
          mod.tags.join(' '),
          mod.featureList?.join(' ') ?? '',
          mod.installationGuide ?? '',
          mod.changelog ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(normalizedSearch)) {
          return false;
        }
      }
      return true;
    });
  }, [modCollection, normalizedTags, normalizedSearch]);

  const hasFilters = normalizedTags.length > 0 || Boolean(normalizedSearch);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    modCollection.forEach(mod => {
      mod.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [modCollection]);

  const featuredMods = useMemo(
    () => filteredMods.filter(mod => (mod.isFeatured ?? false) || mod.tags.includes('Featured')),
    [filteredMods],
  );
  const newMods = useMemo(
    () => [...filteredMods].sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime()).slice(0, 10),
    [filteredMods],
  );
  const trendingMods = useMemo(
    () => [...filteredMods].sort((a, b) => b.downloads - a.downloads).slice(0, 10),
    [filteredMods],
  );

  const handleDownloadMod = (modId: string) => {
    const currentMod = modCollection.find(mod => mod.id === modId);
    const nextCount = currentMod ? currentMod.downloads + 1 : 1;
    setModCollection(prev => prev.map(mod => (mod.id === modId ? { ...mod, downloads: nextCount } : mod)));
    setDownloadSnapshot(prev => ({
      ...prev,
      [modId]: Math.max(prev[modId] ?? 0, nextCount),
    }));
  };

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Failed to logout', error);
    }
  }, [logout]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    const timeoutId = toastTimeouts.current[id];
    if (timeoutId) {
      clearTimeout(timeoutId);
      delete toastTimeouts.current[id];
    }
  }, []);

  const enqueueToast = useCallback(
    ({ message, variant = 'info' }: ToastPayload) => {
      if (!message.trim()) return;
      const id = createId();
      setToasts(prev => [...prev, { id, message, variant }]);
      if (typeof window !== 'undefined') {
        const timeoutId = window.setTimeout(() => {
          dismissToast(id);
        }, 4500);
        toastTimeouts.current[id] = timeoutId;
      }
    },
    [dismissToast],
  );

  useEffect(() => () => {
    Object.values(toastTimeouts.current).forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setShowScrollTop(currentY > 400);
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (!isMobile) {
        setShowMobileHeader(true);
        lastScrollY.current = currentY;
        return;
      }
      if (currentY < 40 || currentY < lastScrollY.current) {
        setShowMobileHeader(true);
      } else if (currentY > lastScrollY.current + 10) {
        setShowMobileHeader(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBrowseNav = useCallback(() => {
    openDiscoverView();
  }, [openDiscoverView]);

  const handleUploadNav = useCallback(() => {
    if (!user) {
      setAuthModalOpen(true);
      enqueueToast({ message: 'Sign in to access the upload deck.', variant: 'info' });
      return;
    }
    if (!isAdmin) {
      enqueueToast({ message: 'Upload deck restricted to cleared curators.', variant: 'warning' });
      return;
    }
    setAdminPanelOpen(true);
  }, [enqueueToast, isAdmin, user]);

  const handleCommunityNav = useCallback(() => {
    setWorkInProgressOpen(true);
  }, []);

  const closeWorkInProgress = useCallback(() => {
    setWorkInProgressOpen(false);
  }, []);

  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const loaderSteps = useMemo(
    () => [
      'Initializing uplink',
      'Charging lightning arrays',
      'Connecting to fixer grid',
      'Syncing chrome manifests',
    ],
    [],
  );
  const loaderStatusOverride = useMemo(() => {
    const flagMessage = Object.values(loaderFlags)[0];
    if (flagMessage) return flagMessage;
    if (!isHydrated) return 'Restoring local shards';
    if (!modsReady) return 'Syncing chrome manifest';
    if (authInitializing) return 'Authenticating operator credentials';
    if (adminLoading) return 'Verifying admin clearance';
    return undefined;
  }, [adminLoading, authInitializing, isHydrated, loaderFlags, modsReady]);
  const showLightningLoader =
    !isHydrated || !modsReady || authInitializing || adminLoading || Object.keys(loaderFlags).length > 0;
  const loaderHint = Object.keys(loaderFlags).length
    ? 'Sit tight—systems are recalibrating.'
    : 'Stand by while Night Market syncs your chrome.';

  const handleLoaderStateChange = useCallback(
    (key: string, isActive: boolean, message?: string) => {
      setLoaderFlag(key, isActive, message);
    },
    [setLoaderFlag],
  );

  const totalDownloads = useMemo(() => modCollection.reduce((sum, mod) => sum + mod.downloads, 0), [modCollection]);

  const formatStatValue = useCallback((value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
    return value.toLocaleString();
  }, []);

  const heroStats = useMemo(
    () => [
      { label: 'Live Mods', value: modCollection.length, loading: false },
      { label: 'Verified Creators', value: adminCount || 0, loading: adminDirectoryLoading },
      { label: 'Daily Installs', value: totalDownloads, loading: false },
    ],
    [adminCount, adminDirectoryLoading, modCollection.length, totalDownloads],
  );

  const triggerStatAnimation = useCallback((label: string) => {
    setStatTokens(prev => ({ ...prev, [label]: (prev[label] ?? 0) + 1 }));
  }, []);

  return (
    <div className="bg-dark-charcoal min-h-screen overflow-x-hidden">
      <LightningLoader
        isVisible={showLightningLoader}
        steps={loaderSteps}
        statusOverride={loaderStatusOverride}
        hint={loaderHint}
      />
      <Header
        onGoHome={handleGoHome}
        onLoginRequest={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenAdminPanel={() => setAdminPanelOpen(true)}
        onBrowse={handleBrowseNav}
        onUpload={handleUploadNav}
        onCommunity={handleCommunityNav}
        isAuthenticated={Boolean(user)}
        isAdmin={isAdmin}
        userEmail={user?.email ?? ''}
        adminLoading={adminLoading}
        isMobileVisible={showMobileHeader}
      />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      <WorkInProgressModal isOpen={isWorkInProgressOpen} onClose={closeWorkInProgress} />
      {isAdmin && (
        <AdminDashboard
          isOpen={isAdminPanelOpen}
          onClose={() => setAdminPanelOpen(false)}
          mods={modCollection}
          loadingMods={modsLoading}
          onCreateMod={createMod}
          onUpdateMod={updateMod}
          onDeleteMod={deleteMod}
          onNotify={enqueueToast}
          adminEmail={user?.email ?? ''}
          onLoaderStateChange={handleLoaderStateChange}
        />
      )}
      <main ref={mainRef} className="container mx-auto px-4 py-8 pt-24">
        {selectedMod ? (
          <ModDetail mod={selectedMod} onBack={handleGoHome} onDownload={handleDownloadMod} onTagSelect={handleTagSelect} activeTags={activeTags} />
        ) : viewMode === 'discover' ? (
          <DiscoverMods
            mods={filteredMods}
            onSelectMod={handleSelectMod}
            onBackHome={closeDiscoverView}
            onTagSelect={handleTagSelect}
            activeTags={activeTags}
            onClearTags={clearTagFilter}
            availableTags={allTags}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
          />
        ) : (
          <>
            <Hero
              onDiscoverMods={openDiscoverView}
              onSubmitMod={handleUploadNav}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
            />
            <div className={`smooth-height-wrapper ${hasFilters ? 'collapsed' : 'expanded'} mt-12`}>
              <div className={`transition-all duration-300 ${hasFilters ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                <div className="grid gap-6 sm:grid-cols-3">
                  {heroStats.map(stat => (
                    <div
                      key={stat.label}
                      className="stat-glow"
                      tabIndex={0}
                      onMouseEnter={() => triggerStatAnimation(stat.label)}
                      onFocus={() => triggerStatAnimation(stat.label)}
                    >
                      <p className="hero-subtext">{stat.label}</p>
                      {stat.loading ? (
                        <p className="mt-2 text-3xl font-bold text-white rolling-number__loading">Calibrating…</p>
                      ) : (
                        <RollingCounter
                          value={stat.value}
                          formatter={formatStatValue}
                          className="mt-2 text-3xl font-bold text-white"
                          refreshToken={statTokens[stat.label]}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {hasFilters ? (
              <>
                <div className="mt-8 rounded-3xl border border-cyber-cyan/30 bg-black/40 p-5 md:flex md:items-center md:justify-between gap-6 transition-all duration-300">
                  <div>
                    <p className="hero-subtext mb-2">Filtered results</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {activeTags.map(tag => (
                        <div
                          key={tag}
                          className="neon-chip tag-active flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-widest"
                        >
                          <button
                            type="button"
                            className="text-white/90 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan"
                            onClick={() => handleTagSelect(tag)}
                          >
                            {tag}
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-white/20 text-white/80 hover:border-cyber-cyan hover:text-white w-5 h-5 flex items-center justify-center text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan"
                            aria-label={`Remove ${tag} filter`}
                            onClick={() => removeActiveTag(tag)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {normalizedSearch && (
                        <span className="filter-chip">
                          Query:
                          <span className="text-white">{searchQuery}</span>
                        </span>
                      )}
                      <span className="text-sm text-gray-300">
                        {filteredMods.length} result{filteredMods.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                    {activeTags.length > 0 && (
                      <button
                        type="button"
                        className="text-sm font-semibold text-cyber-cyan hover:text-white tracking-wide"
                        onClick={clearTagFilter}
                      >
                        Clear tags
                      </button>
                    )}
                    {normalizedSearch && (
                      <button
                        type="button"
                        className="text-sm font-semibold text-cyber-cyan hover:text-white tracking-wide"
                        onClick={clearSearch}
                      >
                        Clear search
                      </button>
                    )}
                    {activeTags.length > 0 && normalizedSearch && (
                      <button
                        type="button"
                        className="text-sm font-semibold text-white/80 hover:text-white tracking-wide"
                        onClick={clearAllFilters}
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {filteredMods.length > 0 ? (
                  <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-300">
                    {filteredMods.map(mod => (
                      <ModCard
                        key={mod.id}
                        mod={mod}
                        onSelect={handleSelectMod}
                        onTagSelect={handleTagSelect}
                        activeTags={activeTags}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-16 rounded-3xl border border-white/10 bg-black/30 p-10 text-center text-gray-300">
                    <p className="text-lg font-semibold">No mods match your criteria.</p>
                    <p className="mt-2 text-sm text-gray-400">Try clearing the filters or search with a different keyword.</p>
                    <button type="button" className="mt-6 text-cyber-cyan font-semibold hover:underline" onClick={clearAllFilters}>
                      Reset filters
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-16 mt-16 transition-all duration-300">
                <ModCarousel title="Featured Mods" mods={featuredMods} onSelectMod={handleSelectMod} onTagSelect={handleTagSelect} activeTags={activeTags} />
                <ModCarousel title="New Uploads" mods={newMods} onSelectMod={handleSelectMod} onTagSelect={handleTagSelect} activeTags={activeTags} />
                <ModCarousel title="Trending Weekly" mods={trendingMods} onSelectMod={handleSelectMod} onTagSelect={handleTagSelect} activeTags={activeTags} />
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <ScrollToTopButton isVisible={showScrollTop} onClick={handleScrollTop} />
    </div>
  );
};

export default App;
