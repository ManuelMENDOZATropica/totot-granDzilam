import Head from 'next/head';
import { HealthStatus } from '@/components/HealthStatus';

export default function Home() {
  return (
    <>
      <Head>
        <title>Gran Dzilam</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
        <div>
          <h1 className="text-4xl font-bold">Gran Dzilam Platform</h1>
          <p className="mt-2 text-lg text-slate-300">
            Este panel verifica la salud del backend en tiempo real.
          </p>
        </div>
        <HealthStatus />
      </main>
    </>
  );
}
