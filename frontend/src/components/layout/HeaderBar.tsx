import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const HeaderBar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    void router.push('/');
  };

  return (
    <header className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
      <Link
        href="/"
        className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 transition-colors hover:text-slate-900"
      >
        Gran Dzilam
      </Link>
      {user ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
          >
            <span className="hidden text-xs uppercase tracking-[0.3em] text-slate-400 sm:inline">{user.role}</span>
            <span>{user.name}</span>
          </button>
          {menuOpen ? (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              {user.role === 'admin' ? (
                <Link
                  href="/crm"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Panel CRM
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Cerrar sesión
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
        >
          Iniciar sesión
        </Link>
      )}
    </header>
  );
};
