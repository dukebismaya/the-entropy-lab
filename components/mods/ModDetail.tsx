
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { ArrowLeftIcon, DownloadIcon, StarIcon } from '../ui/Icon';
import type { Mod } from '../../types';
import { MarkdownContent } from '../ui/MarkdownContent';
import { formatGameVersion } from '../../utils/formatGameVersion';
import { getDeveloperLinkMeta } from '../../utils/developerLinks';

interface ModDetailProps {
  mod: Mod;
  onBack: () => void;
  onDownload: (modId: string) => void;
  onTagSelect?: (tag: string) => void;
  activeTags?: string[];
}

export const ModDetail: React.FC<ModDetailProps> = ({ mod, onBack, onDownload, onTagSelect, activeTags }) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const heroImage = mod.images[0] ?? mod.thumbnailUrl;
  const galleryImages = mod.images.slice(1);
  const isDownloadReady = Boolean(mod.downloadUrl);
  const featureListMarkdown = useMemo(() => {
    if (!mod.featureList?.length) return '';
    return mod.featureList.map(entry => `- ${entry}`).join('\n');
  }, [mod.featureList]);
  const developerLinks = useMemo(
    () => (mod.developerLinks?.length ? mod.developerLinks : mod.developerUrl ? [mod.developerUrl] : []),
    [mod.developerLinks, mod.developerUrl],
  );
  const developerLinkMeta = useMemo(() => developerLinks.map(link => getDeveloperLinkMeta(link)), [developerLinks]);
  const developerName = mod.developerName?.trim() || mod.author.name;

  const handleDownload = useCallback(() => {
    if (!isDownloadReady) return;
    onDownload(mod.id);
    const anchor = document.createElement('a');
    anchor.href = mod.downloadUrl;
    anchor.setAttribute('download', mod.archiveFileName);
    anchor.rel = 'noopener';
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }, [isDownloadReady, mod.archiveFileName, mod.downloadUrl, mod.id, onDownload]);

  useEffect(() => {
    if (!expandedImage) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpandedImage(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [expandedImage]);

  const openImageViewer = (src: string) => setExpandedImage(src);
  const closeImageViewer = () => setExpandedImage(null);

  return (
    <>
      <div className="animate-fade-in">
        <Button onClick={onBack} variant="ghost" icon={<ArrowLeftIcon className="w-5 h-5" />} className="mb-6">
          Back to Mods
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <button
              type="button"
              onClick={() => openImageViewer(heroImage)}
              className="group relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan"
              aria-label="View hero image in full screen"
            >
              <img
                src={heroImage}
                alt={mod.title}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-between p-4">
                <span className="text-xs uppercase tracking-[0.4em] text-white/80">Expand</span>
                <span className="text-xs text-white/80">Click to magnify</span>
              </div>
            </button>
          </Card>
          {galleryImages.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {galleryImages.map(image => (
                <Card key={image} className="p-0 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => openImageViewer(image)}
                    className="group relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan"
                    aria-label="View screenshot in full screen"
                  >
                    <img
                      src={image}
                      alt={`${mod.title} feature`}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white tracking-wide">Tap to expand</span>
                    </div>
                  </button>
                </Card>
              ))}
            </div>
          )}
          <Card className="mt-6">
            <h1 className="text-4xl font-bold font-orbitron text-white text-glow-cyan">{mod.title}</h1>
            <p className="text-lg text-gray-400 mt-1">by {mod.author.name}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {mod.tags.map(tag => {
                const isActive = activeTags?.some(selected => selected.toLowerCase() === tag.toLowerCase());
                return (
                  <Tag key={tag} onClick={onTagSelect ? () => onTagSelect(tag) : undefined} isActive={Boolean(isActive)}>
                    {tag}
                  </Tag>
                );
              })}
            </div>
            <MarkdownContent content={mod.longDescription} className="mt-6" />
            {featureListMarkdown ? <MarkdownContent content={featureListMarkdown} className="mt-4" /> : null}
          </Card>
          <Card className="mt-6" variant="flat">
            <h3 className="font-orbitron text-lg text-cyber-purple mb-3">Installation Instructions</h3>
            {mod.installationGuide ? (
              <MarkdownContent content={mod.installationGuide} />
            ) : (
              <p className="text-gray-500 text-sm">
                No installation guide has been published for this mod yet.
              </p>
            )}
          </Card>

          <Card className="mt-6" variant="flat">
            <h3 className="font-orbitron text-lg text-cyber-purple mb-3">Changelog</h3>
            {mod.changelog ? (
              <MarkdownContent content={mod.changelog} />
            ) : (
              <p className="text-gray-500 text-sm">No changelog entries yet.</p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Button
            variant="primary"
            className="w-full py-4 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            icon={<DownloadIcon className="w-6 h-6" />}
            disabled={!isDownloadReady}
            onClick={handleDownload}
          >
            {isDownloadReady ? `Download v${mod.version}` : 'Download Unavailable'}
          </Button>
          <Card>
            <h3 className="font-orbitron text-lg text-cyber-purple mb-4">Mod Info</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between"><span>Game Version:</span> <span className="font-semibold text-white">{formatGameVersion(mod.gameVersion)}</span></li>
              <li className="flex justify-between"><span>File Size:</span> <span className="font-semibold text-white">{mod.fileSize}</span></li>
              <li className="flex justify-between"><span>Upload Date:</span> <span className="font-semibold text-white">{mod.uploadedDate}</span></li>
              <li className="flex justify-between"><span>Downloads:</span> <span className="font-semibold text-white">{mod.downloads.toLocaleString()}</span></li>
              <li className="flex justify-between items-center"><span>Rating:</span> <span className="flex items-center gap-1 font-semibold text-white">{mod.rating} <StarIcon className="w-4 h-4 text-yellow-400"/></span></li>
              <li className="flex justify-between">
                <span>Developer:</span>
                <span className="font-semibold text-white">{developerName}</span>
              </li>
              {developerLinkMeta.length ? (
                <li className="flex justify-between gap-3">
                  <span>Links:</span>
                  <div className="flex flex-wrap justify-end gap-2">
                    {developerLinkMeta.map(link => {
                      const Icon = link.Icon;
                      return (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-cyber-cyan/70 hover:text-white"
                          aria-label={`${link.label} link`}
                        >
                          <Icon className="w-4 h-4" />
                        </a>
                      );
                    })}
                  </div>
                </li>
              ) : null}
              <li className="pt-2"><span className="text-gray-400">SHA256:</span><br/><code className="text-xs text-cyber-cyan break-all">{mod.sha256}</code></li>
              {mod.dependencies.length ? (
                <li className="pt-2">
                  <span className="text-gray-400">Dependencies:</span>
                  <ul className="mt-1 space-y-1 text-xs text-gray-300">
                    {mod.dependencies.map(dep => (
                      <li key={dep}>{dep}</li>
                    ))}
                  </ul>
                </li>
              ) : null}
              {mod.files.length ? (
                <li className="pt-2">
                  <span className="text-gray-400">Archive Contents:</span>
                  <ul className="mt-1 space-y-1 text-xs text-gray-300">
                    {mod.files.map(file => (
                      <li key={file}>{file}</li>
                    ))}
                  </ul>
                </li>
              ) : null}
            </ul>
          </Card>
        </div>
      </div>
    </div>
    {expandedImage && (
      <div
        className="fixed inset-0 z-[140] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Expanded mod image"
        onClick={closeImageViewer}
      >
        <button
          type="button"
          className="absolute top-6 right-6 text-white/80 hover:text-white text-3xl leading-none"
          onClick={event => {
            event.stopPropagation();
            closeImageViewer();
          }}
          aria-label="Close image viewer"
        >
          ×
        </button>
        <div
          className="relative max-h-[80vh] max-w-5xl w-full flex items-center justify-center"
          onClick={event => event.stopPropagation()}
        >
          <img src={expandedImage} alt="Expanded view" className="max-h-[80vh] w-auto rounded-3xl shadow-2xl" />
        </div>
      </div>
    )}
    </>
  );
};
