/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // R1 — Antes esto era hostname '**' en http y https, lo que convertía
    // /_next/image en un proxy abierto: cualquiera podía re-servir imágenes de terceros
    // a costa del ancho de banda y la CPU del proyecto. Se acota al backend propio.
    remotePatterns: [
      { protocol: 'https', hostname: 'totot-grandzilam.onrender.com' },
    ],
  },
};

export default nextConfig;
