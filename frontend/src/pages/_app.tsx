import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const mainCanvas = document.getElementById('main-canvas');

    const applyScale = () => {
      if (!mainCanvas) {
        return;
      }

      const scaleFactor = window.innerWidth / 1920;

      mainCanvas.style.transform = `scale(${scaleFactor})`;
      mainCanvas.style.transformOrigin = 'top center';

      const originalHeight = mainCanvas.scrollHeight;
      document.body.style.height = `${originalHeight * scaleFactor}px`;
      document.body.style.overflowX = 'hidden';
    };

    applyScale();

    window.addEventListener('load', applyScale);
    window.addEventListener('resize', applyScale);
    window.addEventListener('pageshow', applyScale);

    return () => {
      window.removeEventListener('load', applyScale);
      window.removeEventListener('resize', applyScale);
      window.removeEventListener('pageshow', applyScale);
    };
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <div id="main-canvas">
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}
