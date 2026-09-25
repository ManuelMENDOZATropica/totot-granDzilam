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

/**
 * R2 — `credentials: 'include'` es lo que hace que el navegador adjunte la cookie de
 * sesión httpOnly. Sin esto la cookie existe pero nunca viaja, porque el backend está en
 * otro origen. Va en todas las llamadas: las públicas simplemente la ignoran.
 */
export const apiFetch = (path: string, init?: RequestInit) => {
  return fetch(buildApiUrl(path), { credentials: 'include', ...init });
};
