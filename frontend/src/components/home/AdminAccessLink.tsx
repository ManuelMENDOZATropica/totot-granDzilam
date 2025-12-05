import Link from 'next/link';
import type { AuthUser } from '@/lib/auth';

interface AdminAccessLinkProps {
  mounted: boolean;
  user: AuthUser | null;
  className?: string;
}

export const AdminAccessLink = ({ mounted, user, className }: AdminAccessLinkProps) => {
  const containerClassName = className ?? 'absolute top-6 right-6 z-[20]';

  return (
    <div className={containerClassName}>
      {mounted && user ? (
        <Link
          href="/crm"
          className="flex flex-col items-start rounded-2xl bg-white/20 px-5 py-3 text-left text-white shadow-lg backdrop-blur transition hover:bg-white/30"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">{user.role}</span>
          <span className="text-base font-semibold">Panel admin</span>
          <span className="text-sm text-white/90">{user.name}</span>
        </Link>
      ) : (
        <Link
          href="/crm"
          className="rounded-full bg-[#385C7A] px-5 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-[#2d4a63]"
        >
          Acceso administrativo
        </Link>
      )}
    </div>
  );
};
