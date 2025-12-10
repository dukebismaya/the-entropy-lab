
import React from 'react';
import { SearchBar } from '../ui/SearchBar';
import { Button } from '../ui/Button';

interface HeroProps {
  onDiscoverMods?: () => void;
  onSubmitMod?: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onDiscoverMods, onSubmitMod, searchQuery, onSearchChange, onSearchSubmit }) => {
  return (
    <section className="relative text-center py-20 sm:py-28">
      <div className="hero-highlight mx-auto w-fit hero-subtext">Community curated • Malware scanned • Instant deploy</div>
      <h1
        className="hero-heading relative mt-6 font-orbitron text-4xl sm:text-6xl lg:text-7xl font-black tracking-widest uppercase text-glow-cyan glitch-text"
        data-text="INSTALL. INTEGRATE. EVOLVE."
      >
        INSTALL. INTEGRATE. EVOLVE.
      </h1>
      <p className="mt-6 text-lg sm:text-xl max-w-3xl mx-auto text-gray-200">
        Download high-fidelity, lore-friendly upgrades for every world. Verified by system engineers, optimized for immersion, and boosted with live telemetry.
      </p>
      <div className="mt-10 flex flex-col items-center gap-6">
        <SearchBar value={searchQuery} onChange={onSearchChange} onSubmit={onSearchSubmit} />
        <div className="flex flex-col sm:flex-row w-full sm:w-auto justify-center gap-4">
          <Button variant="primary" className="w-full sm:w-auto min-w-[180px]" onClick={onDiscoverMods}>
            Discover Mods
          </Button>
          <Button variant="secondary" className="w-full sm:w-auto min-w-[180px]" onClick={onSubmitMod}>
            Submit A Mod
          </Button>
        </div>
      </div>
    </section>
  );
};
