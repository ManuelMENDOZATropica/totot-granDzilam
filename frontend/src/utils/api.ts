export const getApiBaseUrl = () => (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

export const buildApiUrl = (path: string) => {
  const base = getApiBaseUrl();
  if (!path.startsWith('/')) {
    return base ? `${base}/${path}` : `/${path}`;
  }

  return base ? `${base}${path}` : path;
};
