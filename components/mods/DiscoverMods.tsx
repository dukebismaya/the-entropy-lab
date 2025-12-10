import React from 'react';
import type { Mod } from '../../types';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import { ModCard } from './ModCard';
import { SearchBar } from '../ui/SearchBar';

interface DiscoverModsProps {
  mods: Mod[];
  onSelectMod: (mod: Mod) => void;
  onBackHome: () => void;
  onTagSelect: (tag: string) => void;
  activeTags: string[];
  onClearTags: () => void;
  availableTags: string[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
}

export const DiscoverMods: React.FC<DiscoverModsProps> = ({
  mods,
  onSelectMod,
  onBackHome,
  onTagSelect,
  activeTags,
  onClearTags,
  availableTags,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) => {
  const sortedTags = React.useMemo(() => [...availableTags].sort((a, b) => a.localeCompare(b)), [availableTags]);
  const hasResults = mods.length > 0;
  const formattedActiveTags = React.useMemo(() => activeTags.map(tag => `"${tag}"`).join(', '), [activeTags]);

  return (
    <section className="mt-12 space-y-10">
      <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-black/30 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="hero-subtext">Discover Mods</p>
            <h2 className="mt-2 text-3xl font-orbitron tracking-[0.35em] text-white">Browse by Tag & Keyword</h2>
            <p className="mt-3 text-sm text-gray-300">Search across titles, authors, descriptions, and tags. Combine queries with tag filters for precision.</p>
          </div>
          <Button variant="ghost" onClick={onBackHome} className="self-start md:self-auto">
            Back to Spotlight
          </Button>
        </div>
        <div className="w-full">
          <SearchBar value={searchQuery} onChange={onSearchChange} onSubmit={onSearchSubmit} />
        </div>
      </div>

      <div className="rounded-3xl border border-cyber-cyan/15 bg-black/20 p-5">
        <div className="flex flex-wrap gap-2">
          {sortedTags.map(tag => (
            <Tag
              key={tag}
              onClick={() => onTagSelect(tag)}
              isActive={activeTags.some(selected => selected.toLowerCase() === tag.toLowerCase())}
            >
              {tag}
            </Tag>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-col gap-3 text-gray-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing <span className="text-white font-semibold">{mods.length}</span> mod{mods.length === 1 ? '' : 's'}
            {activeTags.length ? ` tagged with ${formattedActiveTags}` : ''}
            {searchQuery.trim() ? ` matching "${searchQuery}"` : ''}.
          </p>
          {(activeTags.length > 0 || searchQuery.trim()) && (
            <div className="flex gap-3">
              {activeTags.length > 0 && (
                <button
                  type="button"
                  className="text-sm font-semibold text-cyber-cyan hover:text-white"
                  onClick={onClearTags}
                >
                  Clear tags
                </button>
              )}
              {searchQuery.trim() && (
                <button
                  type="button"
                  className="text-sm font-semibold text-cyber-cyan hover:text-white"
                  onClick={() => onSearchChange('')}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
        {hasResults ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mods.map(mod => (
              <ModCard key={mod.id} mod={mod} onSelect={onSelectMod} onTagSelect={onTagSelect} activeTags={activeTags} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-white/10 bg-black/30 p-10 text-center text-gray-300">
            <p className="text-lg font-semibold">No mods match that tag yet.</p>
            <p className="mt-2 text-sm text-gray-400">Try picking another tag or clear the filter to explore everything.</p>
          </div>
        )}
      </div>
    </section>
  );
};
