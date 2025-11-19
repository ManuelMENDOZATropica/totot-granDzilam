import { FormEvent, useEffect, useRef, useState } from 'react';
import { useChatbot } from '@/hooks/useChatbot';
import Image from 'next/image';

export const ChatbotWidget = () => {
  const { messages, status, error, sendMessage } = useChatbot();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-3">
      {isOpen && (
        <div className="flex w-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Asistente Gran Dzilam</p>
              <p className="text-xs text-slate-200">
                Resuelve dudas sobre la compra de lotes
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-slate-200 transition-colors hover:bg-white/10"
              aria-label="Cerrar asistente"
            >
              ×
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-3 text-sm text-slate-700"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <p
                  className={`max-w-[220px] rounded-2xl px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}

            {status === 'loading' && (
              <div className="flex justify-start">
                <p className="rounded-2xl bg-slate-100 px-3 py-2 text-slate-500">
                  Escribiendo…
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-slate-200 px-4 py-3"
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe tu pregunta..."
              className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={status === 'loading'}
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      {/* BOTÓN SOLO ICONO, FONDO BLANCO */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center rounded-full bg-white w-14 h-14 shadow-lg border border-slate-200 transition-transform hover:scale-105"
        aria-expanded={isOpen}
      >
        <Image
          src="/assets/support_agent.png"
          alt="Asistente"
          width={28}
          height={28}
        />
      </button>
    </div>
  );
};
