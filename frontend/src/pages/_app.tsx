import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.body.style.height = 'auto';
    document.body.style.overflowX = 'hidden';
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
