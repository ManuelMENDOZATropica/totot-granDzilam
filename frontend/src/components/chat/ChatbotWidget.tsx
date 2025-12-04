import { FormEvent, useEffect, useRef, useState } from 'react';
import { useChatbot } from '@/hooks/useChatbot';
import Image from 'next/image';

export const ChatbotWidget = () => {
  const { messages, status, error, sendMessage } = useChatbot();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Preguntas sugeridas basadas en la imagen "Frame 51"
  const suggestions = [
    '¿Puedo personalizar mi financiamiento?',
    '¿Puedo personalizar la superficie?',
    '¿Qué proyectos hay en la zona?',
  ];

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

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 md:right-10 z-[40] flex flex-col items-end gap-3 font-sans">
      {isOpen && (
        <div className="flex w-[90vw] max-w-[540px] flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-[#efeeeb] shadow-2xl ring-1 ring-black/5 sm:w-[540px]">
          
          {/* HEADER: Minimalista para cerrar */}
          <div className="flex items-center justify-end bg-[#efeeeb] px-1 py-1">
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* CUERPO DEL CHAT */}
          <div
            ref={scrollRef}
            className="flex h-[400px] max-h-[60vh] flex-col overflow-y-auto bg-[#efeeeb] px-4 py-6 overlay-scrollbar"
          >
            {/* ESTADO INICIAL (VACÍO) */}
            {messages.length === 0 ? (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                
                {/* 1. CAMBIO: Todo envuelto en un globo de bot */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] rounded-2xl rounded-bl-none bg-[#F3F4F6] p-4 text-slate-800 shadow-sm">
                    
                    {/* Texto de Bienvenida */}
                    <div className="mb-4 text-[15px] leading-relaxed text-[#1C2E3D]">
                      <p>
                        Hola, Soy tu <span className="font-bold">asistente virtual</span>, puedo resolver tus dudas sobre tu inversión en Gran Dzilam.
                      </p>
                      <p className="mt-1">¿Tienes alguna pregunta?</p>
                    </div>

                    {/* Botones de Sugerencias */}
                    {/* Ahora dentro del globo, usamos bg-white para contraste */}
                    <div className="flex flex-col gap-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full rounded-xl bg-white border border-slate-100 px-3 py-2 text-left text-[13px] text-[#355F62] shadow-sm transition-all hover:bg-slate-50 hover:text-[#2A4A4D]"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>

                  </div>
                </div>

              </div>
            ) : (
              // HISTORIAL DE MENSAJES
              <div className="flex flex-col gap-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        message.role === 'user'
                          // 2. CAMBIO: Color del usuario actualizado a #355F62
                          ? 'bg-[#355F62] text-white rounded-br-none'
                          : 'bg-[#F3F4F6] text-slate-800 rounded-bl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {/* Indicador de "Escribiendo..." */}
                {status === 'loading' && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 rounded-2xl bg-[#F3F4F6] px-4 py-3 rounded-bl-none">
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"></span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                    Error: {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="bg-[#efeeeb] px-5 pb-5 pt-2">
            <form
              onSubmit={handleSubmit}
              className="relative w-full"
            >
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escribe aquí tu pregunta..."
                className="w-full rounded-full border border-[#2F4F4F] py-3 pl-5 pr-12 text-[15px] text-slate-700 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2F4F4F] bg-white"
                disabled={status === 'loading'}
              />
              
              {/* Botón de envío */}
              {input.trim() && (
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#355F62] p-2 text-white transition-all hover:bg-[#2A4A4D]"
                  aria-label="Enviar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE (Toggle) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-100 bg-[#efeeeb] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform hover:scale-110 active:scale-95"
        aria-expanded={isOpen}
      >
        {isOpen ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#355F62" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
             </svg>
        ) : (
            <Image
              src="/assets/support_agent.png"
              alt="Asistente"
              width={32}
              height={32}
            />
        )}
      </button>
    </div>
  );
};