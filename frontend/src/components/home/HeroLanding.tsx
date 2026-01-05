'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export const HeroLanding = () => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const playerRef = useRef<any>(null);

  // IDs de tus videos
  const VIDEO_DESKTOP = "PAQ7kcfRbRM";
  const VIDEO_MOBILE = "nk6mU1qpGNQ";

  useEffect(() => {
    // 1. Detectar si es móvil al cargar y si cambia el tamaño
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);

    // 2. Cargar API de YouTube
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // 3. Inicializar el reproductor
    const initPlayer = () => {
      const currentVideoId = window.innerWidth < 768 ? VIDEO_MOBILE : VIDEO_DESKTOP;
      
      playerRef.current = new (window as any).YT.Player('youtube-player', {
        videoId: currentVideoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: currentVideoId,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          enablejsapi: 1,
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              // Esperamos un segundo extra para que suba la calidad/buffer
              setTimeout(() => setIsVideoReady(true), 1200);
            }
          },
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      
      {/* 🌀 SPINNER DE CARGA */}
      {!isVideoReady && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-white mb-4"></div>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Cargando experiencia HD</p>
        </div>
      )}

      {/* 🎥 REPRODUCTOR DINÁMICO */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}>
        <div 
          id="youtube-player" 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            ${isMobile 
              ? 'h-[100vh] w-[56.25vh] min-h-full min-w-[177.77vw]' // Proporción vertical para móvil
              : 'h-[100vh] w-[177.77vh] min-w-full min-h-[56.25vw]' // Proporción horizontal para desktop
            }`} 
        />
        {/* Capa de contraste */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Flecha con animación */}
      <Link
        href="#macro-terreno"
        className="group z-30 absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full bg-white/80 p-3 shadow-md backdrop-blur transition hover:scale-105 active:scale-95"
      >
        <span className="block h-8 w-8 text-gray-700 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9l7.5 7.5L19.5 9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5L12 12 19.5 4.5" />
          </svg>
        </span>
      </Link>
    </section>
  );
};

export default HeroLanding;