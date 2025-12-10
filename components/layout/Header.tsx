
import React from 'react';
import { usePointerGlow } from '../../hooks/usePointerGlow';

interface HeaderProps {
  onGoHome: () => void;
  onLoginRequest: () => void;
  onLogout: () => void;
  onOpenAdminPanel?: () => void;
  onBrowse: () => void;
  onUpload: () => void;
  onCommunity: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail?: string | null;
  adminLoading: boolean;
  isMobileVisible: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome, onLoginRequest, onLogout, onOpenAdminPanel, onBrowse, onUpload, onCommunity, isAuthenticated, isAdmin, userEmail, adminLoading, isMobileVisible }) => {
  const { handlePointerMove, handlePointerLeave } = usePointerGlow();
  const navItems = [
    { label: 'Browse', onClick: onBrowse },
    { label: 'Upload', onClick: onUpload },
    { label: 'Community', onClick: onCommunity },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 md:translate-y-0 ${isMobileVisible ? 'translate-y-0' : '-translate-y-full md:translate-y-0'}`}>
      <div className="glass-card site-nav container mx-auto mt-4 rounded-3xl border border-white/10 bg-dark-charcoal/70 px-4 sm:px-8 py-3 flex flex-wrap items-center gap-3 sm:gap-4 justify-between backdrop-blur-xl">
        <div 
          className="site-nav__brand flex items-center gap-3 cursor-pointer group flex-shrink-0"
          onClick={onGoHome}
        >
          <div className="site-nav__logo relative">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="site-nav__logo-svg text-cyan-300"
            >
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="var(--color-cyber-cyan)" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 7L12 12L22 7" stroke="var(--color-cyber-cyan)" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M12 22V12" stroke="var(--color-cyber-purple)" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M20 4.5L16 6.5L20 8.5" stroke="var(--color-cyber-magenta)" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M4 19.5L8 17.5L4 15.5" stroke="var(--color-cyber-magenta)" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <span className="site-nav__logo-halo" aria-hidden></span>
          </div>
          <div>
            <span className="font-orbitron text-xl font-bold text-white tracking-[0.3em]">MODHUB</span>
            <p className="hero-subtext text-left text-xs">Omni-Game Mod Exchange</p>
          </div>
        </div>
        <nav className="site-nav__links hidden md:flex items-center gap-8 text-sm uppercase">
          {navItems.map(item => (
            <button
              key={item.label}
              type="button"
              className="site-nav__link"
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ))}
        </nav>
        {isAuthenticated ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="text-left sm:text-right">
              <p
                className={`text-xs uppercase tracking-[0.4em] ${
                  adminLoading ? 'text-gray-400' : isAdmin ? 'text-cyber-cyan' : 'text-gray-400'
                }`}
              >
                {adminLoading ? 'Syncing' : isAdmin ? 'Admin' : 'User'}
              </p>
              <p className="text-sm text-white/80 max-w-[180px] truncate">{userEmail}</p>
            </div>
            {isAdmin && (
              <button
                type="button"
                className="relative px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] rounded-full border border-cyber-cyan/70 text-cyber-cyan hover:bg-cyber-cyan hover:text-dark-charcoal transition-all duration-300 glow-hover"
                onMouseMove={handlePointerMove}
                onMouseLeave={handlePointerLeave}
                onClick={onOpenAdminPanel}
              >
                Dashboard
              </button>
            )}
            <button
              type="button"
              className="relative px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] rounded-full bg-cyber-purple/30 text-white border border-cyber-purple/60 hover:bg-cyber-purple hover:text-dark-charcoal transition-all duration-300 button-glow-magenta glow-hover w-full sm:w-auto text-center"
              onMouseMove={handlePointerMove}
              onMouseLeave={handlePointerLeave}
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="relative px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] rounded-full bg-cyber-purple/30 text-white border border-cyber-purple/60 hover:bg-cyber-purple hover:text-dark-charcoal transition-all duration-300 button-glow-magenta glow-hover w-full sm:w-auto text-center"
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
            onClick={onLoginRequest}
          >
            Login
          </button>
        )}
      </div>

          <div className="site-mobile-notice md:hidden container mx-auto px-4 sm:px-8 mt-2">
            <details className="site-mobile-notice__panel" aria-label="Mobile experience notice">
              <summary className="site-mobile-notice__summary">Mobile experience</summary>
              <div className="site-mobile-notice__body">
                For the full neon dashboard and mod tools, please switch to desktop. Mobile is in preview — enhanced layouts coming soon.
              </div>
            </details>
          </div>
    </header>
  );
};
