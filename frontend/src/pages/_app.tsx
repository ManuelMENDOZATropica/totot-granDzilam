import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const mainCanvas = document.getElementById('main-canvas');

    const ajustarEscala = () => {
      if (!mainCanvas) {
        return;
      }

      const isMobile = window.innerWidth <= 1024;

      if (isMobile) {
        mainCanvas.style.transform = 'none';
        document.body.style.height = 'auto';
        return;
      }

      const ratio = window.innerWidth / 1920;
      mainCanvas.style.transform = `scale(${ratio})`;

      const scaledHeight = mainCanvas.offsetHeight * ratio;
      document.body.style.height = `${scaledHeight}px`;
      document.body.style.overflowX = 'hidden';
    };

    ajustarEscala();

    window.addEventListener('load', ajustarEscala);
    window.addEventListener('resize', ajustarEscala);
    window.addEventListener('pageshow', ajustarEscala);

    return () => {
      window.removeEventListener('load', ajustarEscala);
      window.removeEventListener('resize', ajustarEscala);
      window.removeEventListener('pageshow', ajustarEscala);
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
