
import React from 'react';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { StarIcon } from '../ui/Icon';
import type { Mod } from '../../types';
import { formatGameVersion } from '../../utils/formatGameVersion';

interface ModCardProps {
  mod: Mod;
  onSelect: (mod: Mod) => void;
  onTagSelect?: (tag: string) => void;
  activeTags?: string[];
}

interface StatChipProps {
  label: string;
  value: string;
}

const StatChip: React.FC<StatChipProps> = ({ label, value }) => (
  <div className="mod-stat-chip" title={`${label}: ${value}`}>
    <span className="mod-stat-label">{label}</span>
    <span className="mod-stat-value">{value}</span>
  </div>
);

export const ModCard: React.FC<ModCardProps> = ({ mod, onSelect, onTagSelect, activeTags }) => {
  const formatDownloads = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    return value.toString();
  };
  const displayRating = Number.isFinite(mod.rating) ? mod.rating.toFixed(1) : '0.0';
  const displayGameVersion = formatGameVersion(mod.gameVersion);

  return (
    <Card className="flex h-full flex-col cursor-pointer" onClick={() => onSelect(mod)} allowOverflow>
      <div className="relative h-44 overflow-hidden rounded-2xl">
        <img src={mod.thumbnailUrl} alt={mod.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="mod-thumb-overlay absolute inset-0" />
        <div className="mod-thumb-glow" />
        <div className="absolute inset-x-3 top-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {mod.tags.slice(0, 2).map(tag => {
                const isActive = activeTags?.some(selected => selected.toLowerCase() === tag.toLowerCase());
                return (
                  <Tag
                    key={`${mod.id}-${tag}`}
                    className="bg-black/40 text-white"
                    onClick={
                      onTagSelect
                        ? event => {
                            event.stopPropagation();
                            onTagSelect(tag);
                          }
                        : undefined
                    }
                    isActive={Boolean(isActive)}
                  >
                    {tag}
                  </Tag>
                );
              })}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-sm font-semibold">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span>{displayRating}</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-200">
          <span className="hero-subtext">v{mod.version}</span>
          <span className="hero-subtext">{formatDownloads(mod.downloads)} installs</span>
        </div>
      </div>
      <div className="mt-5 flex flex-1 flex-col">
        <div className="space-y-2">
          <h3 className="font-bold text-xl text-white">{mod.title}</h3>
          <p className="text-sm text-gray-400">by {mod.author.name}</p>
          <p className="text-sm text-gray-400 line-clamp-2">{mod.description}</p>
        </div>
        <div className="mt-auto pt-4">
          <div className="neon-divider" />
          <div className="mt-3 flex flex-wrap gap-3 text-gray-200">
            <StatChip label="Downloads" value={`${formatDownloads(mod.downloads)} installs`} />
            <StatChip label="Game" value={displayGameVersion} />
          </div>
        </div>
      </div>
    </Card>
  );
};
