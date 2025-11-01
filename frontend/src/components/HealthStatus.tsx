import { useEffect, useState } from 'react';
import { fetchHealth, type HealthResponse } from '@/lib/api';

export const HealthStatus = () => {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchHealth();
        setData(response);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return <p className="text-lg">Verificando el estado del backend...</p>;
  }

  if (error || !data) {
    return (
      <div className="rounded border border-red-400 bg-red-950/60 p-4">
        <p className="text-xl font-semibold text-red-200">Backend sin conexión</p>
        <p className="text-sm text-red-300">{error ?? 'No se recibió información de salud.'}</p>
      </div>
    );
  }

  return (
    <div className="rounded border border-emerald-400 bg-emerald-950/60 p-4">
      <p className="text-xl font-semibold text-emerald-200">Backend operativo</p>
      <p className="text-sm text-emerald-100">Estado: {data.status}</p>
      <p className="text-xs text-emerald-100/80">Actualizado: {new Date(data.timestamp).toLocaleString()}</p>
    </div>
  );
};
