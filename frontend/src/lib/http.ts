const sanitizeBaseUrl = (url?: string) => {
  if (!url) return '';
  return url.replace(/\/+$/, '');
};

const buildBaseUrl = () => sanitizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);

export const buildApiUrl = (path: string) => {
  const base = buildBaseUrl();
  if (!base) {
    return path;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export const apiFetch = (path: string, init?: RequestInit) => {
  return fetch(buildApiUrl(path), init);
};
