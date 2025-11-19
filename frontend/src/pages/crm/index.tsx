import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const next = typeof router.query.next === 'string' ? router.query.next : '/';

  useEffect(() => {
    if (!isLoading && user) {
      void router.replace(next);
    }
  }, [user, isLoading, router, next]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      void router.replace(next);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Acceso al portal administrativo · Gran Dzilam</title>
      </Head>

      {/* Fondo general */}
      <main className="min-h-screen bg-[#E4E0D9]">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
          {/* SOLO logo centrado arriba */}
          <header className="flex justify-center pt-2 pb-10">
            <Link
    href="/"
    className="absolute right-10 top-10 rounded-full bg-[#385C7A] px-5 py-2 text-sm font-medium text-white shadow transition hover:bg-[#2E495F]"
  >
    Volver a pantalla de inicio
  </Link>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-transparent">
              <Image
                src="/assets/GDsecundario.png"
                alt="Gran Dzilam"
                width={80}
                height={80}
                className="h-20 w-20 object-contain"
                priority
              />
            </div>
          </header>

          {/* Tarjeta de login */}
          <section className="flex flex-1 items-start justify-center">
            <div className="w-full max-w-2xl rounded-[24px] bg-[#F4F4F4] px-10 py-10 shadow-md">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-semibold text-slate-900">
                  Acceso al portal administrativo
                </h1>
                <p className="mt-3 text-sm text-slate-600">
                  Gestiona los lotes y la configuración del cotizador con tus credenciales
                  administrativas
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="text-sm text-slate-700">
                  <label className="flex flex-col gap-2">
                    Correo electrónico
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="h-11 rounded-full bg-[#ECE5DD] px-4 text-sm text-slate-900 outline-none ring-0 transition focus:bg-white focus:ring-2 focus:ring-[#385C7A]"
                    />
                  </label>
                </div>

                <div className="text-sm text-slate-700">
                  <label className="flex flex-col gap-2">
                    Contraseña
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      className="h-11 rounded-full bg-[#ECE5DD] px-4 text-sm text-slate-900 outline-none ring-0 transition focus:bg-white focus:ring-2 focus:ring-[#385C7A]"
                    />
                  </label>
                </div>

                {error ? (
                  <p className="text-sm text-red-600">{error}</p>
                ) : null}

                <div className="mt-6 flex justify-center">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-full bg-[#385C7A] px-10 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#2E495F] disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {submitting ? 'Ingresando…' : 'Iniciar sesión'}
                  </button>
                </div>
              </form>

              <p className="mt-6 text-center text-xs text-slate-500">
                ¿Necesitas ayuda? Escríbenos a{' '}
                <Link
                  href="mailto:hola@totot.me"
                  className="font-medium text-slate-700 underline-offset-4 hover:text-slate-900"
                >
                  hola@totot.me
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
