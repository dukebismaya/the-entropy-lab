import type { FC } from 'react';
import { GithubIcon, TwitterIcon, YoutubeIcon, GlobeIcon } from '../components/ui/Icon';

export type DeveloperLinkKind = 'github' | 'twitter' | 'youtube' | 'website';

export interface DeveloperLinkMeta {
  url: string;
  kind: DeveloperLinkKind;
  label: string;
  Icon: FC<{ className?: string }>;
}

const iconMap: Record<DeveloperLinkKind, FC<{ className?: string }>> = {
  github: GithubIcon,
  twitter: TwitterIcon,
  youtube: YoutubeIcon,
  website: GlobeIcon,
};

const hostnameMatchers: Array<{ keyword: string; kind: DeveloperLinkKind; label: string }> = [
  { keyword: 'github.', kind: 'github', label: 'GitHub' },
  { keyword: 'gitlab.', kind: 'github', label: 'GitLab' },
  { keyword: 'twitter.', kind: 'twitter', label: 'Twitter' },
  { keyword: 'x.com', kind: 'twitter', label: 'Twitter' },
  { keyword: 'youtube.', kind: 'youtube', label: 'YouTube' },
  { keyword: 'youtu.be', kind: 'youtube', label: 'YouTube' },
  { keyword: 'twitch.', kind: 'youtube', label: 'Twitch' },
  { keyword: 'itch.io', kind: 'website', label: 'itch.io' },
  { keyword: 'steamcommunity', kind: 'website', label: 'Steam' },
  { keyword: 'patreon.', kind: 'website', label: 'Patreon' },
  { keyword: 'gumroad.', kind: 'website', label: 'Gumroad' },
  { keyword: 'discord.', kind: 'website', label: 'Discord' },
];

export const getDeveloperLinkMeta = (url: string): DeveloperLinkMeta => {
  try {
    const normalized = new URL(url);
    const hostname = normalized.hostname.toLowerCase();
    const match = hostnameMatchers.find(entry => hostname.includes(entry.keyword));
    if (match) {
      return { url, kind: match.kind, label: match.label, Icon: iconMap[match.kind] };
    }
  } catch (error) {
    // fall through to default
  }
  return { url, kind: 'website', label: 'Website', Icon: GlobeIcon };
};
