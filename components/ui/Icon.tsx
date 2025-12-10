
import React from 'react';

type IconProps = { className?: string };

export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export const StarIcon: React.FC<IconProps & { filled?: boolean }> = ({ className, filled = true }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m1-12a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1V6zM17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.6 9h16.8M3.6 15h16.8M12 3c2 3 2 15 0 18" />
  </svg>
);

export const GithubIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.88-1.54-3.88-1.54-.53-1.35-1.29-1.71-1.29-1.71-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.39.97.11-.75.41-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.3 1.2-3.11-.12-.3-.52-1.5.11-3.12 0 0 .98-.31 3.2 1.19a11.1 11.1 0 0 1 5.82 0c2.22-1.5 3.2-1.19 3.2-1.19.63 1.62.23 2.82.11 3.12.75.81 1.2 1.85 1.2 3.11 0 4.43-2.71 5.41-5.29 5.7.42.36.8 1.08.8 2.18 0 1.57-.02 2.84-.02 3.22 0 .31.21.68.8.56A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

export const TwitterIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.162 5.656a5.67 5.67 0 0 1-1.63.457 2.85 2.85 0 0 0 1.255-1.576 5.695 5.695 0 0 1-1.806.69 2.84 2.84 0 0 0-4.838 2.59 8.068 8.068 0 0 1-5.857-2.97 2.84 2.84 0 0 0 .879 3.79 2.83 2.83 0 0 1-1.287-.356v.036a2.84 2.84 0 0 0 2.276 2.782 2.85 2.85 0 0 1-1.282.049 2.84 2.84 0 0 0 2.653 1.972 5.7 5.7 0 0 1-4.185 1.17 8.04 8.04 0 0 0 12.313-7.16c0-.123-.003-.246-.008-.368a5.756 5.756 0 0 0 1.414-1.469Z" />
  </svg>
);

export const YoutubeIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.8 8.001a2.753 2.753 0 0 0-1.944-1.95C18.081 5.5 12 5.5 12 5.5s-6.08 0-7.856.551A2.753 2.753 0 0 0 2.2 7.999 28.36 28.36 0 0 0 1.5 12a28.36 28.36 0 0 0 .7 4.001 2.753 2.753 0 0 0 1.944 1.95C5.92 18.5 12 18.5 12 18.5s6.081 0 7.856-.551a2.753 2.753 0 0 0 1.944-1.95c.466-1.77.7-3.59.7-4.001s-.234-2.231-.7-3.998ZM9.75 14.5v-5l4.5 2.5-4.5 2.5Z" />
  </svg>
);

export const LinkIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.59 13.41a4 4 0 0 0 5.66 0l3.18-3.18a4 4 0 1 0-5.66-5.66l-1.41 1.41" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.41 10.59a4 4 0 0 0-5.66 0l-3.18 3.18a4 4 0 0 0 5.66 5.66l1.41-1.41" />
  </svg>
);

export const LinkedinIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5Zm-.5 6.5h3V21h-3V10Zm6.5 0h2.86l.18 1.5h.09c.63-1.08 2.17-1.77 3.53-1.77 3.05 0 4.86 1.92 4.86 5.26V21h-3v-8.72c0-1.76-.73-2.78-2.08-2.78-1.23 0-2.09.83-2.09 1.97V21h-3V10Z" />
  </svg>
);

export const DiscordIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 245 240" className={className} fill="currentColor">
    <path d="M104.4 104.6c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1 0-6.1-4.6-11.1-10.2-11.1Zm36.2 0c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1 0-6.1-4.5-11.1-10.2-11.1Z" />
    <path d="M189.5 20h-134C39.7 20 27 32.8 27 48.6V188c0 15.8 12.7 28.6 28.5 28.6h113.5l-5.3-18.5 12.8 12 12.1 11.5 21.4 19V48.6c0-15.8-12.7-28.6-28.5-28.6Zm-27.6 137s-2.6-3.1-4.7-5.8c9.3-2.6 12.8-8.3 12.8-8.3-2.9 1.9-5.6 3.2-8.1 4.1-3.5 1.5-6.9 2.4-10.2 2.9-6.7 1.2-12.9.9-18.2-.1-4-0.8-7.5-1.9-10.3-2.9-1.6-.6-3.3-1.3-5-2.3-.2-.1-.4-.2-.6-.3-.1 0-.1-.1-.2-.1-1-.6-1.5-1-1.5-1s3.4 5.6 12.4 8.3c-2.1 2.7-4.8 5.9-4.8 5.9-15.8-.5-21.8-10.9-21.8-10.9 0-23.1 10.4-41.9 10.4-41.9 10.4-7.8 20.3-7.6 20.3-7.6l.7.8c-13 3.7-19 9.3-19 9.3s1.6-.9 4.3-2.1c7.8-3.4 14-4.3 16.6-4.5.4-.1.7-.1 1.1-.1a73 73 0 0 1 17.6-.2c8.3.9 17.2 3.2 26.3 7.9 0 0-5.7-5.4-18.1-9.1l1-.5s9.9-.2 20.3 7.6c0 0 10.4 18.8 10.4 41.9 0 0-6.1 10.4-21.9 10.9Z" />
  </svg>
);
