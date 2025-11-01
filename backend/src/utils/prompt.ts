const BLOCKED_KEYWORDS = [
  'arma',
  'armas',
  'violencia',
  'sangre',
  'asesinato',
  'drogas',
  'ilegal',
  'explosivo',
  'terrorismo',
  'abuso',
];

export const sanitizePrompt = (value: string): string => {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= 400) {
    return trimmed;
  }

  return trimmed.slice(0, 400).trimEnd();
};

export const isPromptAllowed = (prompt: string): boolean => {
  const normalized = prompt.toLowerCase();
  return !BLOCKED_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

export const buildCacheKey = (prompt: string, size: string) => `${prompt}::${size}`;
