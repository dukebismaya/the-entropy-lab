# Mod Directory Template

Each mod lives in `mods/<your-mod-id>/` and contains everything needed for the storefront cards, detail views, and downloadable archive.

```
mods/
  your-mod-id/
    metadata.json        # Required manifest (see schema below)
    preview.svg          # Card thumbnail (any image type works)
    shots/
      shot-1.png         # Optional gallery images
      shot-2.png
    <archive-name>.zip   # Downloadable payload referenced by metadata
```

## metadata.json schema

```jsonc
{
  "id": "your-mod-id",                // kebab-case unique ID
  "title": "Display name",
  "author": {
    "id": "author-id",
    "name": "Display Name",
    "avatar": "https://..."        // optional, can be relative asset
  },
  "description": "Short blurb",       // used on cards
  "longDescription": "Markdown or plain text",
  "version": "1.0.0",
  "gameVersion": "2.02",
  "downloads": 0,
  "rating": 4.5,
  "developerName": "Night Market Studio",
  "tags": ["Featured", "Weapons"],
  "isFeatured": true,                  // optional curated flag for home carousel
  "developerLinks": ["https://github.com/night-market"] ,
  "dependencies": ["Optional"],
  "fileSize": "42 MB",
  "uploadedDate": "2025-11-01",
  "sha256": "checksum string",
  "previewImage": "preview.svg",          // relative to mod folder
  "featureShots": ["shots/shot-1.png"],   // relative paths or https URLs
  "featureList": ["Bullet point feature list"],
  "videoUrl": "https://...",             // optional
  "archiveFile": "your-mod-id.zip",      // relative path to downloadable archive
  "files": ["list of in-game files"],     // shown in detail pane
  "comments": []                           // optional predefined comments
}
```

Add any images, gifs, or archives referenced in the metadata to the same folder so Vite can bundle them. For large archives you can upload Git LFS assets instead.
