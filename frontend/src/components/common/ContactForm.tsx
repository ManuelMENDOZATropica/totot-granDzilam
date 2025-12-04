import React, { useMemo, useState } from 'react';

interface ContactFormData {
  nombre: string;
  correo: string;
  telefono: string;
  interes: string;
}

interface ContactFormProps {
  className?: string;
  submitLabel?: string;
  onSubmit?: (data: ContactFormData) => Promise<void> | void;
}

export const ContactForm = ({
  className = '',
  submitLabel = 'Enviar información',
  onSubmit,
}: ContactFormProps) => {
  const [formData, setFormData] = useState<ContactFormData>({
    nombre: '',
    correo: '',
    telefono: '',
    interes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const isValidEmail = (correo: string) => /\S+@\S+\.\S+/.test(correo);

  const validate = () => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Ingresa tu nombre';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'Ingresa tu correo';
    } else if (!isValidEmail(formData.correo)) {
      newErrors.correo = 'Ingresa un correo válido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'Ingresa tu teléfono';
    }

    if (!formData.interes.trim()) {
      newErrors.interes = 'Cuéntanos tu interés';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof ContactFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmissionError(null);
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      setSubmitted(true);
    } catch (error) {
      setSubmissionError((error as Error).message ?? 'No se pudo enviar tu información');
    } finally {
      setSubmitting(false);
    }
  };

  const helperText = useMemo(
    () => (submitted ? '¡Gracias! Nos pondremos en contacto contigo.' : 'Deja tu información y nos pondremos en contacto:'),
    [submitted],
  );

  return (
    <div className={`space-y-6 text-slate-800 pl-[80px] pr-[80px] ${className}`}>
      {/* ENCABEZADO: Correo y Teléfono */}
      <div className="flex flex-col sm:flex-row gap-8 pb-4 border-b border-slate-200/50">
        {/* Item Correo */}
        <div className="flex items-start gap-3">
          <div className="pt-1">
            {/* Icono Arroba (@) estilo espiral */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg">Correo electrónico</p>
            <a href="mailto:grandzilam@info.com" className="text-slate-600 hover:text-[#385C7A] transition-colors">
              grandzilam@info.com
            </a>
          </div>
        </div>

        {/* Item Teléfono */}
        <div className="flex items-start gap-3">
          <div className="pt-1">
            {/* Icono Teléfono */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg">Teléfono</p>
            <a href="tel:+0000000000" className="text-slate-600 hover:text-[#385C7A] transition-colors">
              +00 00 000 000
            </a>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <div>
        <h4 className="font-bold text-slate-900 text-lg mb-4">
          {helperText}
        </h4>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {submissionError ? <p className="text-sm text-red-600">{submissionError}</p> : null}
          {/* Campo Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-slate-700 font-medium mb-1">Nombre:</label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange('nombre')}
              className="w-full h-10 rounded-xl bg-[#DCDCDC] px-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#385C7A]/50 transition-all"
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
          </div>

          {/* Campo Correo */}
          <div>
            <label htmlFor="correo" className="block text-slate-700 font-medium mb-1">Correo:</label>
            <input
              type="email"
              id="correo"
              value={formData.correo}
              onChange={handleChange('correo')}
              className="w-full h-10 rounded-xl bg-[#DCDCDC] px-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#385C7A]/50 transition-all"
            />
            {errors.correo && <p className="mt-1 text-xs text-red-600">{errors.correo}</p>}
          </div>

          {/* Campo Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-slate-700 font-medium mb-1">Teléfono:</label>
            <input
              type="tel"
              id="telefono"
              value={formData.telefono}
              onChange={handleChange('telefono')}
              className="w-full h-10 rounded-xl bg-[#DCDCDC] px-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#385C7A]/50 transition-all"
            />
            {errors.telefono && <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>}
          </div>

          {/* Campo Interés (TextArea) */}
          <div>
            <label htmlFor="interes" className="block text-slate-700 font-medium mb-1">Interés:</label>
            <textarea
              id="interes"
              value={formData.interes}
              onChange={handleChange('interes')}
              className="w-full h-32 rounded-xl bg-[#DCDCDC] p-3 text-slate-900 outline-none resize-none focus:ring-2 focus:ring-[#385C7A]/50 transition-all"
            ></textarea>
            {errors.interes && <p className="mt-1 text-xs text-red-600">{errors.interes}</p>}
          </div>

          {/* Botón de Enviar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#385C7A] px-8 py-2 font-semibold text-white shadow-lg hover:bg-[#2a455c] transition-colors w-full sm:w-auto"
            >
              {submitting ? 'Enviando…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
