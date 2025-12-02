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
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-3 font-sans">
      {isOpen && (
        <div className="flex w-[340px] flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5">
          
          {/* HEADER: Minimalista para cerrar */}
          <div className="flex items-center justify-between bg-[#1C2E3D] px-5 py-3 text-white">
            
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Cerrar asistente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* CUERPO DEL CHAT */}
          <div
            ref={scrollRef}
            className="flex h-[400px] flex-col overflow-y-auto bg-white px-6 py-6 scrollbar-thin scrollbar-thumb-slate-200"
          >
            {/* ESTADO INICIAL (VACÍO): Diseño fiel a Frame 51 */}
            {messages.length === 0 ? (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                
                {/* Texto de Bienvenida */}
                <div className="text-[#1C2E3D] text-[15px] leading-relaxed">
                  <p>
                    Hola, Soy tu <span className="font-bold">asistente virtual</span>, puedo resolver tus dudas sobre tu inversión en Gran Dzilam.
                  </p>
                  <p className="mt-1">¿Tienes alguna pregunta?</p>
                </div>

                {/* Botones de Sugerencias (Píldoras grises) */}
                <div className="flex flex-col gap-3">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      // Estilo fiel: Fondo gris muy claro, bordes redondeados, texto azulado suave
                      className="w-full rounded-2xl bg-[#F3F4F6] px-4 py-3 text-left text-[14px] text-[#5B7CA3] transition-all hover:bg-[#E5E7EB] hover:text-[#385C7A]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // HISTORIAL DE MENSAJES (Si ya hay conversación)
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
                          ? 'bg-[#385C7A] text-white rounded-br-none'
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

          {/* INPUT AREA: Diseño fiel a Frame 51 (Píldora con borde oscuro) */}
          <div className="bg-white px-5 pb-5 pt-2">
            <form
              onSubmit={handleSubmit}
              className="relative w-full"
            >
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escribe aquí tu pregunta..."
                // Estilo fiel: rounded-full, border específico color pizarra oscura/verde azulado
                className="w-full rounded-full border border-[#2F4F4F] py-3 pl-5 pr-12 text-[15px] text-slate-700 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2F4F4F] bg-white"
                disabled={status === 'loading'}
              />
              
              {/* Botón de envío discreto dentro del input (opcional, no sale en la imagen pero necesario para UX) */}
              {input.trim() && (
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#385C7A] p-2 text-white transition-all hover:bg-[#2A455C]"
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
        className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform hover:scale-110 active:scale-95"
        aria-expanded={isOpen}
      >
        {isOpen ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#385C7A" className="w-6 h-6">
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