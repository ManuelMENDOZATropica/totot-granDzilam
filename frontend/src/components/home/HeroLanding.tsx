'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export const HeroLanding = () => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const playerRef = useRef<any>(null);

  const VIDEO_DESKTOP = "PAQ7kcfRbRM";
  const VIDEO_MOBILE = "nk6mU1qpGNQ";

  useEffect(() => {
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
    /* Forzamos w-screen y corregimos posición para ignorar el contenedor de 1920px. 
       Si el padre limita el ancho, 'left-1/2 -translate-x-1/2 w-screen' lo centra al viewport real.
    */
    <section className="relative h-screen w-screen left-1/2 -translate-x-1/2 overflow-hidden bg-black">

      {/* 🌀 LOADING STATE */}
      {!isVideoReady && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-white mb-4"></div>
        </div>
      )}

      {/* 🎥 CSS PARA "OBJECT-COVER" REAL */}
      <style jsx global>{`
        .video-foreground {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .video-foreground iframe {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(1.1); /* Escala extra para evitar fugas de luz */
          width: 100vw;
          height: 56.25vw; /* 16:9 */
          min-height: 100vh;
          min-width: 177.77vh; /* 16:9 */
        }

        /* Ajustes de Aspect Ratio para asegurar que siempre cubra */
        @media (min-aspect-ratio: 16/9) {
          .video-foreground iframe {
            height: 56.25vw;
          }
        }
        @media (max-aspect-ratio: 16/9) {
          .video-foreground iframe {
            width: 177.77vh;
          }
        }
      `}</style>

      <div className={`video-foreground z-0 transition-opacity duration-1000 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}>
        <div id="youtube-player" className="w-full h-full" />
        {/* Overlay para contraste y evitar clics en el video */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
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