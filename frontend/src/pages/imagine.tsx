import Head from 'next/head';
import { Inter } from 'next/font/google';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ImaginePreview } from '@/components/imagine/ImaginePreview';
import { imagineSizes, type ImagineSize, useImagine } from '@/hooks/useImagine';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const shortcutPrompts = [
  'Casa moderna',
  'Glamping ecológico',
  'Huerto + terraza',
  'Cabaña rústica',
];

const labelForSize = (size: ImagineSize) => {
  switch (size) {
    case '1024x1024':
      return '1024 px';
    case '768x768':
      return '768 px';
    case '512x512':
    default:
      return '512 px';
  }
};

export default function ImaginePage() {
  const { status, result, error, generate, reset, lastPrompt } = useImagine();
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImagineSize>('1024x1024');
  const promptLoaded = useRef(false);

  useEffect(() => {
    if (!promptLoaded.current && lastPrompt) {
      setPrompt(lastPrompt);
      promptLoaded.current = true;
    }
  }, [lastPrompt]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await generate(prompt, size);
  };

  const handleShortcut = (value: string) => {
    setPrompt(value);
  };

  const handleRetry = () => {
    reset();
  };

  return (
    <>
      <Head>
        <title>Gran Dzilam · Imagina tu lote</title>
        <meta
          name="description"
          content="Describe lo que imaginas en tu lote y recibe inspiración visual con el asistente creativo de Gran Dzilam."
        />
      </Head>
      <main className={`${inter.variable} min-h-screen bg-white text-slate-900`}>
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Gran Dzilam</p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Imagina tu lote ideal</h1>
            <p className="text-sm text-slate-500 sm:text-base">
              Cuéntanos qué te gustaría crear y generaremos un concepto visual y un texto inspirador en segundos.
            </p>
          </header>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
            <form className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="prompt" className="text-sm font-medium text-slate-700">
                  Describe lo que imaginas en tu lote
                </label>
                <textarea
                  id="prompt"
                  name="prompt"
                  rows={6}
                  placeholder="Describe lo que imaginas en tu lote…"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-slate-400"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {shortcutPrompts.map((shortcut) => (
                  <button
                    key={shortcut}
                    type="button"
                    onClick={() => handleShortcut(shortcut)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
                  >
                    {shortcut}
                  </button>
                ))}
              </div>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-medium text-slate-700">Tamaño de la imagen</legend>
                <div className="flex gap-2">
                  {imagineSizes.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSize(option)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        size === option
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'
                      }`}
                      aria-pressed={size === option}
                    >
                      {labelForSize(option)}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                className="flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Imaginando…' : 'Imaginar mi lote'}
              </button>
            </form>

            <ImaginePreview status={status} result={result} error={error} onRetry={handleRetry} />
          </div>
        </div>
      </main>
    </>
  );
}
