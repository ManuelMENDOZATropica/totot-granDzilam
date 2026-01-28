'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export const HeroLanding = () => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const playerRef = useRef<any>(null);

  const VIDEO_DESKTOP = "PAQ7kcfRbRM";
  const VIDEO_MOBILE = "nk6mU1qpGNQ";

  useEffect(() => {
    // Cargar API de YouTube
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      const isMobile = window.innerWidth < 768;
      const currentVideoId = isMobile ? VIDEO_MOBILE : VIDEO_DESKTOP;

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
          disablekb: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              setTimeout(() => setIsVideoReady(true), 800);
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
  }, []);

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black">

      {/* 🌀 LOADING STATE */}
      {!isVideoReady && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-white mb-4"></div>
        </div>
      )}

      {/* 🎥 CSS PARA FORZAR "OBJECT-COVER" EN IFRAME */}
      <style jsx global>{`
        .video-foreground {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        /* Lógica para Desktop (16:9) */
        @media (min-width: 768px) {
          .video-foreground iframe {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100vw;
            height: 56.25vw; /* 9/16 * 100 */
            min-height: 100vh;
            min-width: 177.78vh; /* 16/9 * 100 */
            transform: translate(-50%, -50%);
          }
        }

        /* Lógica para Mobile (9:16) */
        @media (max-width: 767px) {
          .video-foreground iframe {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 177.78vh; /* Forzamos ancho para cubrir alto */
            height: 100vh;
            min-width: 100vw;
            min-height: 177.78vw; /* 16/9 para vertical */
            transform: translate(-50%, -50%);
          }
        }
      `}</style>

      <div className={`video-foreground z-0 transition-opacity duration-1000 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}>
        <div id="youtube-player" />
        {/* Overlay para mejorar legibilidad y evitar clics */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Contenido UI (Flecha) */}
      <Link
        href="#macro-terreno"
        className="group z-30 absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full bg-white/10 p-4 border border-white/20 backdrop-blur-md transition hover:bg-white/20"
      >
        <div className="text-white animate-bounce">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </Link>
    </section>
  );
};

export default HeroLanding;