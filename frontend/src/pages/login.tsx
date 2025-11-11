import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { HeaderBar } from '@/components/layout/HeaderBar';
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
        <title>Iniciar sesión · Gran Dzilam</title>
      </Head>
      <main className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <HeaderBar />
          <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-semibold text-slate-900">Accede al CRM</h1>
              <p className="text-sm text-slate-500">
                Gestiona los lotes y la configuración del cotizador con tus credenciales administrativas.
              </p>
            </div>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Correo electrónico
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Contraseña
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </label>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? 'Ingresando…' : 'Iniciar sesión'}
              </button>
            </form>
            <p className="text-center text-xs text-slate-400">
              ¿Necesitas ayuda? Escríbenos a{' '}
              <Link href="mailto:hola@totot.me" className="text-slate-600 underline-offset-4 hover:text-slate-900">
                hola@totot.me
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
