import type { Author, Comment, Mod } from './types';

type DirectoryAuthor = {
  id: string;
  name: string;
  avatar?: string;
};

type DirectoryComment = {
  id?: string;
  author?: DirectoryAuthor;
  text: string;
  timestamp?: string;
  upvotes?: number;
};

type DirectoryMetadata = {
  id: string;
  title: string;
  author: DirectoryAuthor;
  description: string;
  longDescription: string;
  version: string;
  gameVersion: string;
  developerUrl?: string;
  downloads: number;
  rating?: number;
  developerName?: string;
  developerLinks?: string[];
  tags: string[];
  dependencies?: string[];
  fileSize: string;
  uploadedDate: string;
  sha256: string;
  previewImage: string;
  featureShots?: string[];
  featureList?: string[];
  videoUrl?: string;
  archiveFile: string;
  files?: string[];
  comments?: DirectoryComment[];
  isFeatured?: boolean;
};

const metadataModules = import.meta.glob('./mods/**/metadata.json', {
  eager: true,
  import: 'default',
}) as Record<string, DirectoryMetadata>;

const absoluteAsset = (basePath: string, asset?: string): string => {
  if (!asset) return '';
  if (/^https?:\/\//i.test(asset)) {
    return asset;
  }
  const normalized = asset.startsWith('/') ? asset.slice(1) : `${basePath}${asset}`;
  return new URL(normalized, import.meta.url).href;
};

const normalizeAuthor = (basePath: string, author: DirectoryAuthor): Author => ({
  id: author.id,
  name: author.name,
  avatarUrl: author.avatar ? absoluteAsset(basePath, author.avatar) : `https://avatar.vercel.sh/${author.id}`,
});

const normalizeComments = (basePath: string, comments: DirectoryComment[] | undefined, fallbackAuthor: Author): Comment[] => {
  if (!comments?.length) return [];
  return comments.map((comment, index) => {
    const authorMeta = comment.author ? normalizeAuthor(basePath, comment.author) : fallbackAuthor;
    return {
      id: comment.id ?? `${fallbackAuthor.id}-comment-${index}`,
      author: authorMeta,
      timestamp: comment.timestamp ?? new Date().toISOString(),
      text: comment.text,
      upvotes: comment.upvotes ?? 0,
    };
  });
};

const buildModFromMetadata = (filePath: string, metadata: DirectoryMetadata): Mod => {
  const basePath = filePath.replace(/metadata\.json$/, '');
  const author = normalizeAuthor(basePath, metadata.author);
  const thumbnailUrl = absoluteAsset(basePath, metadata.previewImage) || 'https://picsum.photos/seed/fallback/800/600';
  const images = (metadata.featureShots && metadata.featureShots.length
    ? metadata.featureShots
    : [metadata.previewImage]
  ).map(image => absoluteAsset(basePath, image));

  const downloadUrl = absoluteAsset(basePath, metadata.archiveFile);

  return {
    id: metadata.id,
    title: metadata.title,
    author,
    thumbnailUrl,
    images,
    videoUrl: metadata.videoUrl,
    description: metadata.description,
    longDescription: metadata.longDescription,
    version: metadata.version,
    gameVersion: metadata.gameVersion,
    developerUrl: metadata.developerUrl,
    developerName: metadata.developerName ?? metadata.author.name,
    developerLinks: metadata.developerLinks?.filter(Boolean) ?? (metadata.developerUrl ? [metadata.developerUrl] : []),
    downloads: metadata.downloads,
    rating: metadata.rating ?? 0,
    tags: metadata.tags,
    dependencies: metadata.dependencies ?? [],
    fileSize: metadata.fileSize,
    uploadedDate: metadata.uploadedDate,
    sha256: metadata.sha256,
    comments: normalizeComments(basePath, metadata.comments, author),
    files: metadata.files ?? [],
    downloadUrl,
    archiveFileName: metadata.archiveFile,
    featureList: metadata.featureList ?? [],
    isFeatured: metadata.isFeatured ?? metadata.tags.includes('Featured'),
  };
};

export const modsFromDirectory: Mod[] = Object.entries(metadataModules)
  .map(([path, metadata]) => buildModFromMetadata(path, metadata))
  .sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime());

export const authorsFromDirectory: Author[] = Array.from(
  new Map(modsFromDirectory.map(mod => [mod.author.id, mod.author])).values(),
);
