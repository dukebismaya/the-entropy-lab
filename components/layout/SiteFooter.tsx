import React from 'react';
import { DiscordIcon, GithubIcon, LinkedinIcon } from '../ui/Icon';

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/dukebismaya',
    Icon: GithubIcon,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/bismaya-jyoti-d-74692a328',
    Icon: LinkedinIcon,
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/nE4QKpgfcj',
    Icon: DiscordIcon,
  },
];

export const SiteFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__glow" aria-hidden="true" />
      <div className="site-footer__content">
        <div>
          <p className="hero-subtext">Creator</p>
          <p className="site-footer__brand">Entropy Lab™</p>
          <p className="site-footer__tagline">Synchronizing mods across every gameverse.</p>
        </div>
        <div className="site-footer__socials" aria-label="Creator links">
          {socialLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="site-footer__social"
              aria-label={link.label}
            >
              <span className="site-footer__social-icon" aria-hidden="true">
                <link.Icon className="site-footer__social-icon-svg" />
              </span>
              <span className="site-footer__social-label">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
      <div className="site-footer__copyright">
        <span>© {year} Entropy Lab. All systems humming.</span>
        <span>Crafted for the universal mod ecosystem.</span>
      </div>
    </footer>
  );
};
