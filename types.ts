
export interface Author {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Comment {
  id: string;
  author: Author;
  timestamp: string;
  text: string;
  upvotes: number;
}

export interface Mod {
  id: string;
  title: string;
  author: Author;
  thumbnailUrl: string;
  images: string[];
  videoUrl?: string;
  description: string;
  longDescription: string;
  version: string;
  gameVersion: string;
  developerUrl?: string;
  developerName?: string;
  developerLinks?: string[];
  downloads: number;
  rating: number;
  tags: string[];
  dependencies: string[];
  fileSize: string;
  uploadedDate: string;
  sha256: string;
  comments: Comment[];
  files: string[];
  downloadUrl: string;
  archiveFileName: string;
  featureList?: string[];
  installationGuide?: string;
  changelog?: string;
  isFeatured?: boolean;
}
