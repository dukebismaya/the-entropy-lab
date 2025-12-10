
import React, { useEffect, useRef, useState } from 'react';
import { ModCard } from './ModCard';
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/Icon';
import type { Mod } from '../../types';

interface ModCarouselProps {
  title: string;
  mods: Mod[];
  onSelectMod: (mod: Mod) => void;
  onTagSelect?: (tag: string) => void;
  activeTags?: string[];
}

export const ModCarousel: React.FC<ModCarouselProps> = ({ title, mods, onSelectMod, onTagSelect, activeTags }) => {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const container = scrollContainer.current;
      if (!container) return;
      setShowControls(container.scrollWidth > container.clientWidth + 4);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [mods]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      const scrollAmount = scrollContainer.current.offsetWidth * 0.8;
      scrollContainer.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  
  return (
    <div className="relative overflow-visible">
      <h2 className="font-orbitron text-2xl sm:text-3xl font-bold mb-6 text-white tracking-[0.3em]">
        {title}
        <span className="block text-sm hero-subtext">curated weekly</span>
      </h2>
      <div ref={scrollContainer} className="cyber-scroll-track flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
        {mods.map(mod => (
          <div key={mod.id} className="flex-shrink-0 w-80 overflow-visible">
            <ModCard mod={mod} onSelect={onSelectMod} onTagSelect={onTagSelect} activeTags={activeTags} />
          </div>
        ))}
      </div>
      {showControls && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute top-1/2 -left-4 hidden h-12 w-12 -translate-y-1/2 transform items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-lg transition-all duration-300 hover:border-cyber-cyan/70 hover:text-cyber-cyan md:flex"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute top-1/2 -right-4 hidden h-12 w-12 -translate-y-1/2 transform items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-lg transition-all duration-300 hover:border-cyber-cyan/70 hover:text-cyber-cyan md:flex"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
};
