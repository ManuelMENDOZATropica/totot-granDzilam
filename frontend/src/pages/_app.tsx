import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </LanguageProvider>
  );
}
