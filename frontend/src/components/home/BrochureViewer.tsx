import { useEffect, useMemo, useRef, useState } from 'react';

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';

type BrochureViewerProps = {
  url: string;
  unlockGatePage: number;
  unlocked: boolean;
  blurNotice: string;
  unlockHint: string;
  onUnlockRequest: (page: number) => void;
  onPageChange?: (current: number) => void;
  onDocumentLoad?: (total: number) => void;
};

async function loadPdfjs(): Promise<any | null> {
  if (typeof window === 'undefined') return null;
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${PDFJS_CDN}/pdf.min.js`;
    script.async = true;
    script.onload = () => resolve((window as any).pdfjsLib);
    script.onerror = () => reject(new Error('No se pudo cargar el visor de PDF.'));
    document.body.appendChild(script);
  });
}

export function preloadBrochureViewerAssets(url?: string) {
  if (typeof window === 'undefined') return;

  void loadPdfjs().catch(() => {
    /* ignored */
  });

  if (!url) return;

  void fetch(url, { cache: 'force-cache' }).catch(() => {
    /* ignored */
  });
}

export function BrochureViewer({
  url,
  unlockGatePage,
  unlocked,
  blurNotice,
  unlockHint,
  onUnlockRequest,
  onPageChange,
  onDocumentLoad,
}: BrochureViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [renderWidth, setRenderWidth] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const pdfInstanceRef = useRef<any | null>(null);
  const pdfjsLibRef = useRef<any | null>(null);
  const loadingTaskRef = useRef<any | null>(null);

  const pages = useMemo(() => {
    if (!numPages) return [];
    return Array.from({ length: numPages }, (_, index) => index + 1);
  }, [numPages]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setRenderWidth(entry.contentRect.width);
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingError(null);
      setNumPages(null);
      setCurrentPage(1);
      onPageChange?.(1);

      try {
        const pdfjsLib = await loadPdfjs();
        if (!pdfjsLib || cancelled) return;

        pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
        pdfjsLibRef.current = pdfjsLib;

        loadingTaskRef.current = pdfjsLib.getDocument(url);
        const pdf = await loadingTaskRef.current.promise;
        if (cancelled) return;

        pdfInstanceRef.current = pdf;
        setNumPages(pdf.numPages);
        onDocumentLoad?.(pdf.numPages);
      } catch (error: any) {
        if (cancelled) return;
        setLoadingError(error?.message ?? 'Error al cargar el brochure.');
      }
    };

    load();

    return () => {
      cancelled = true;
      loadingTaskRef.current?.destroy();
      pdfInstanceRef.current = null;
    };
  }, [url, onDocumentLoad, onPageChange]);

  useEffect(() => {
    if (!pages.length || !renderWidth || !pdfInstanceRef.current || !pdfjsLibRef.current) return;

    let cancelled = false;

    const renderPages = async () => {
      for (const pageNumber of pages) {
        const canvas = canvasRefs.current[pageNumber - 1];
        if (!canvas) continue;

        const page = await pdfInstanceRef.current.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: 1 });
        const scale = renderWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
        if (cancelled) return;
      }
    };

    renderPages();

    return () => {
      cancelled = true;
    };
  }, [pages, renderWidth]);

  useEffect(() => {
    if (!pages.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const pageNumber = Number(entry.target.getAttribute('data-page'));
          if (Number.isNaN(pageNumber)) return;

          setCurrentPage(pageNumber);
          onPageChange?.(pageNumber);

          if (!unlocked && pageNumber >= unlockGatePage) {
            onUnlockRequest(pageNumber);
          }
        });
      },
      { threshold: 0.6 },
    );

    pageRefs.current.slice(0, pages.length).forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [pages, unlockGatePage, unlocked, onPageChange, onUnlockRequest]);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto bg-slate-100 px-4 py-6">
      <div className="sticky top-0 z-10 mb-4 flex items-center justify-between rounded-xl bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
        <span>
          {currentPage} / {numPages ?? '—'}
        </span>
        {!unlocked && (
          <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">
            {blurNotice}
          </span>
        )}
      </div>

      {loadingError ? (
        <div className="py-20 text-center text-sm text-red-600">{loadingError}</div>
      ) : !numPages ? (
        <div className="py-20 text-center text-sm text-slate-600">Cargando brochure…</div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {pages.map((pageNumber) => {
            const isLockedSection = !unlocked && pageNumber >= unlockGatePage;

            return (
              <div
                key={pageNumber}
                ref={(el) => {
                  pageRefs.current[pageNumber - 1] = el;
                }}
                data-page={pageNumber}
                className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow"
              >
                <canvas
                  ref={(el) => {
                    canvasRefs.current[pageNumber - 1] = el;
                  }}
                  className={`w-full ${isLockedSection ? 'blur-[4px] brightness-90' : ''}`}
                />

                {isLockedSection ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/60 p-4">
                    <div className="pointer-events-auto max-w-sm rounded-xl bg-white/90 p-4 text-center text-sm font-semibold text-slate-800 shadow-lg">
                      <p>{blurNotice}</p>
                      <p className="mt-1 text-xs font-normal text-slate-600">{unlockHint}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
