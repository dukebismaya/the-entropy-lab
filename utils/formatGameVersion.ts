const UNIVERSAL_KEYWORDS = ['universal', 'all', 'all versions', 'any'];

export const formatGameVersion = (value?: string | null): string => {
  const normalized = value?.trim();
  if (!normalized) {
    return 'All Versions';
  }

  const lower = normalized.toLowerCase();
  if (UNIVERSAL_KEYWORDS.some(keyword => lower === keyword || lower.replace(/\s+/g, ' ') === keyword)) {
    return 'All Versions';
  }

  return normalized;
};
