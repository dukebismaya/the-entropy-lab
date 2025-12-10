
import React from 'react';
import { usePointerGlow } from '../../hooks/usePointerGlow';

interface SearchBarProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit, placeholder = 'Search mods, authors, tags...' }) => {
  const { handlePointerMove, handlePointerLeave } = usePointerGlow();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSubmit?.();
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-cyber-magenta via-cyber-purple to-cyber-cyan opacity-60 blur" aria-hidden />
      <div className="cyber-input relative flex w-full items-center gap-3 rounded-full border-none bg-transparent px-5 py-2">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={event => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent py-2 text-base placeholder-gray-400 focus:outline-none"
        />
        <button
          type="button"
          className="relative rounded-full bg-cyber-cyan/90 px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white button-glow-cyan glow-hover flex items-center gap-2"
          onMouseMove={handlePointerMove}
          onMouseLeave={handlePointerLeave}
          onClick={onSubmit}
        >
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Scan
        </button>
      </div>
    </div>
  );
};
