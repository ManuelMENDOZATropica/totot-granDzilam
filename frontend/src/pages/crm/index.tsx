import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
  AdminLot,
  AdminUser,
  CreateUserPayload,
  SaveLotPayload,
  UpdateUserPayload,
  createAdminLot,
  createAdminUser,
  deleteAdminLot,
  deleteAdminUser,
  fetchAdminLots,
  fetchAdminUsers,
  updateAdminLot,
  updateAdminUser,
} from '@/lib/admin';
import type { EstadoLote } from '@/lib/api';
import type { UserRole } from '@/lib/auth';
import {
  ContactSubmission,
  assignContactSubmission,
  fetchAdminContactSubmissions,
  fetchMyContactSubmissions,
} from '@/lib/contactSubmissions';

type AdminTab = 'lots' | 'users' | 'contacts';

interface LotFormState {
  identifier: string;
  superficieM2: string;
  precio: string;
  estado: EstadoLote;
  order: string;
}

interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const lotFormInitialState: LotFormState = {
  identifier: '',
  superficieM2: '',
  precio: '',
  estado: 'disponible',
  order: '',
};

const userFormInitialState: UserFormState = {
  name: '',
  email: '',
  password: '',
  role: 'viewer',
};

const estadoOptions: EstadoLote[] = ['disponible', 'apartado', 'vendido'];
const roleOptions: UserRole[] = ['admin', 'editor', 'viewer'];

export default function CrmPage() {
  const router = useRouter();
  const { user, token, login, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('lots');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [lots, setLots] = useState<AdminLot[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [lotsError, setLotsError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [lotFormError, setLotFormError] = useState<string | null>(null);
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [contactAssigningId, setContactAssigningId] = useState<string | null>(null);

  const [lotForm, setLotForm] = useState<LotFormState>(lotFormInitialState);
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [lotSaving, setLotSaving] = useState(false);

  const [userFormState, setUserFormState] = useState<UserFormState>(userFormInitialState);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userSaving, setUserSaving] = useState(false);

  const availableTabs = useMemo<AdminTab[]>(() => (user?.role === 'admin' ? ['lots', 'users', 'contacts'] : ['contacts']), [
    user?.role,
  ]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const queryTab = router.query.tab;
    const requestedTab =
      typeof queryTab === 'string' && ['lots', 'users', 'contacts'].includes(queryTab)
        ? (queryTab as AdminTab)
        : null;
    const nextTab = requestedTab && availableTabs.includes(requestedTab) ? requestedTab : availableTabs[0];

    setActiveTab(nextTab);

    if (nextTab !== requestedTab) {
      void router.replace({ pathname: '/crm', query: { tab: nextTab } }, undefined, { shallow: true });
    }
  }, [router.isReady, router.query.tab, availableTabs, router]);

  const handleTabChange = (tab: AdminTab) => {
    if (!availableTabs.includes(tab)) {
      return;
    }
    setActiveTab(tab);
    void router.replace({ pathname: '/crm', query: { tab } }, undefined, { shallow: true });
  };

  const loadLots = useCallback(async () => {
    if (!token) {
      return;
    }
    setLotsLoading(true);
    setLotsError(null);
    try {
      const items = await fetchAdminLots(token);
      setLots(items);
    } catch (error) {
      setLotsError((error as Error).message);
    } finally {
      setLotsLoading(false);
    }
  }, [token]);

  const loadUsers = useCallback(async () => {
    if (!token) {
      return;
    }
    setUsersLoading(true);
    setUsersError(null);
    try {
      const items = await fetchAdminUsers(token);
      setUsers(items);
    } catch (error) {
      setUsersError((error as Error).message);
    } finally {
      setUsersLoading(false);
    }
  }, [token]);

  const loadContactSubmissions = useCallback(async () => {
    if (!token || !user) {
      return;
    }

    setContactsLoading(true);
    setContactsError(null);

    try {
      const items =
        user.role === 'admin'
          ? await fetchAdminContactSubmissions(token)
          : await fetchMyContactSubmissions(token);
      setContactSubmissions(items);
    } catch (error) {
      setContactsError((error as Error).message);
    } finally {
      setContactsLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      return;
    }
    void loadLots();
    void loadUsers();
  }, [token, user, loadLots, loadUsers]);

  useEffect(() => {
    if (!token || !user) {
      return;
    }
    void loadContactSubmissions();
  }, [token, user, loadContactSubmissions]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      await login(email, password);
      setEmail('');
      setPassword('');
      void router.replace({ pathname: '/crm', query: { tab: activeTab } }, undefined, { shallow: true });
    } catch (error) {
      setAuthError((error as Error).message);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLotFieldChange = (field: keyof LotFormState, value: string) => {
    setLotForm((previous) => ({ ...previous, [field]: value }));
  };

  const resetLotForm = () => {
    setEditingLotId(null);
    setLotForm(lotFormInitialState);
    setLotFormError(null);
  };

  const handleLotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    const superficieM2 = Number(lotForm.superficieM2);
    const precio = Number(lotForm.precio);
    const orderValue = lotForm.order.trim() === '' ? undefined : Number(lotForm.order);

    if (!lotForm.identifier.trim()) {
      setLotFormError('El identificador es obligatorio');
      return;
    }

    if (Number.isNaN(superficieM2) || Number.isNaN(precio) || superficieM2 <= 0 || precio <= 0) {
      setLotFormError('La superficie y el precio deben ser números válidos mayores a 0');
      return;
    }

    if (orderValue !== undefined && Number.isNaN(orderValue)) {
      setLotFormError('El orden debe ser un número válido');
      return;
    }

    const payload: SaveLotPayload = {
      identifier: lotForm.identifier.trim(),
      superficieM2,
      precio,
      estado: lotForm.estado,
      ...(orderValue !== undefined ? { order: orderValue } : {}),
    };

    setLotFormError(null);
    setLotSaving(true);

    try {
      if (editingLotId) {
        await updateAdminLot(token, editingLotId, payload);
      } else {
        await createAdminLot(token, payload);
      }
      resetLotForm();
      await loadLots();
    } catch (error) {
      setLotFormError((error as Error).message);
    } finally {
      setLotSaving(false);
    }
  };

  const handleLotEdit = (lot: AdminLot) => {
    setEditingLotId(lot.id);
    setLotForm({
      identifier: lot.identifier,
      superficieM2: lot.superficieM2.toString(),
      precio: lot.precio.toString(),
      estado: lot.estado,
      order: typeof lot.order === 'number' ? lot.order.toString() : '',
    });
  };

  const handleLotDelete = async (lot: AdminLot) => {
    if (!token) {
      return;
    }
    if (typeof window !== 'undefined' && !window.confirm(`¿Eliminar el lote ${lot.identifier}?`)) {
      return;
    }
    setLotsError(null);
    try {
      await deleteAdminLot(token, lot.id);
      setLots((previous) => previous.filter((item) => item.id !== lot.id));
    } catch (error) {
      setLotsError((error as Error).message);
    }
  };

  const handleUserFieldChange = (field: keyof UserFormState, value: string) => {
    setUserFormState((previous) => ({ ...previous, [field]: value }));
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setUserFormState(userFormInitialState);
    setUserFormError(null);
  };

  const handleUserSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    if (!userFormState.name.trim() || !userFormState.email.trim()) {
      setUserFormError('El nombre y el correo electrónico son obligatorios');
      return;
    }

    setUserFormError(null);
    setUserSaving(true);

    try {
      if (editingUserId) {
        const payload: UpdateUserPayload = {
          name: userFormState.name.trim(),
          email: userFormState.email.trim(),
          role: userFormState.role,
          ...(userFormState.password ? { password: userFormState.password } : {}),
        };
        await updateAdminUser(token, editingUserId, payload);
      } else {
        if (!userFormState.password) {
          setUserFormError('Debes definir una contraseña temporal para el usuario');
          setUserSaving(false);
          return;
        }
        const payload: CreateUserPayload = {
          name: userFormState.name.trim(),
          email: userFormState.email.trim(),
          role: userFormState.role,
          password: userFormState.password,
        };
        await createAdminUser(token, payload);
      }
      resetUserForm();
      await loadUsers();
    } catch (error) {
      setUserFormError((error as Error).message);
    } finally {
      setUserSaving(false);
    }
  };

  const handleUserEdit = (adminUser: AdminUser) => {
    setEditingUserId(adminUser.id);
    setUserFormState({
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      password: '',
    });
  };

  const handleUserDelete = async (adminUser: AdminUser) => {
    if (!token) {
      return;
    }
    if (typeof window !== 'undefined' && !window.confirm(`¿Eliminar al usuario ${adminUser.email}?`)) {
      return;
    }
    setUsersError(null);
    try {
      await deleteAdminUser(token, adminUser.id);
      setUsers((previous) => previous.filter((item) => item.id !== adminUser.id));
    } catch (error) {
      setUsersError((error as Error).message);
    }
  };

  const handleAssignContact = async (submissionId: string, assignedTo: string | null) => {
    if (!token || user?.role !== 'admin') {
      return;
    }

    setContactAssigningId(submissionId);
    setContactsError(null);

    try {
      const updated = await assignContactSubmission(token, submissionId, assignedTo);
      setContactSubmissions((previous) => previous.map((item) => (item.id === submissionId ? updated : item)));
    } catch (error) {
      setContactsError((error as Error).message);
    } finally {
      setContactAssigningId(null);
    }
  };

  const lotsEmpty = useMemo(() => !lotsLoading && lots.length === 0, [lotsLoading, lots.length]);
  const usersEmpty = useMemo(() => !usersLoading && users.length === 0, [usersLoading, users.length]);
  const contactsEmpty = useMemo(
    () => !contactsLoading && contactSubmissions.length === 0,
    [contactsLoading, contactSubmissions.length],
  );
  const isAdmin = user?.role === 'admin';

  const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));

  const tabLabels: Record<AdminTab, string> = {
    lots: 'Lotes',
    users: 'Usuarios',
    contacts: 'Contactos',
  };

  if (!user && isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#E4E0D9]">
        <p className="text-sm text-slate-600">Cargando sesión…</p>
      </main>
    );
  }

  if (!user || !token) {
    return (
      <>
        <Head>
          <title>Acceso al portal administrativo · Gran Dzilam</title>
        </Head>

        <main className="min-h-screen bg-[#E4E0D9]">
          <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
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

            <section className="flex flex-1 items-start justify-center">
              <div className="w-full max-w-2xl rounded-[24px] bg-[#F4F4F4] px-10 py-10 shadow-md">
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-semibold text-slate-900">Acceso al portal administrativo</h1>
                  <p className="mt-3 text-sm text-slate-600">
                    Gestiona los lotes y la configuración del cotizador con tus credenciales administrativas
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleLogin}>
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

                  {authError ? <p className="text-sm text-red-600">{authError}</p> : null}

                  <div className="mt-6 flex justify-center">
                    <button
                      type="submit"
                      disabled={authSubmitting}
                      className="inline-flex items-center justify-center rounded-full bg-[#385C7A] px-10 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#2E495F] disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {authSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
                    </button>
                  </div>
                </form>

                <p className="mt-6 text-center text-xs text-slate-500">
                  ¿Necesitas ayuda? Escríbenos a{' '}
                  <Link href="mailto:hola@totot.me" className="font-medium text-slate-700 underline-offset-4 hover:text-slate-900">
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

  return (
    <>
      <Head>
        <title>Panel administrativo · Gran Dzilam</title>
      </Head>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Panel administrativo</p>
              <h1 className="text-2xl font-semibold text-slate-900">Hola, {user.name}</h1>
              <p className="text-sm text-slate-500">Gestiona los lotes, usuarios y mensajes de contacto</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
                {user.role}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-white text-slate-600 shadow-sm hover:bg-slate-100'
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {activeTab === 'lots' ? (
            <section className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingLotId ? 'Editar lote' : 'Agregar nuevo lote'}
                  </h2>
                  <p className="text-sm text-slate-500">Completa la información del lote disponible para el cotizador.</p>
                </div>
                {lotFormError ? <p className="mb-4 text-sm text-red-600">{lotFormError}</p> : null}
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleLotSubmit}>
                  <label className="text-sm text-slate-600">
                    Identificador
                    <input
                      type="text"
                      value={lotForm.identifier}
                      onChange={(event) => handleLotFieldChange('identifier', event.target.value)}
                      required
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Superficie (m²)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={lotForm.superficieM2}
                      onChange={(event) => handleLotFieldChange('superficieM2', event.target.value)}
                      required
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Precio
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={lotForm.precio}
                      onChange={(event) => handleLotFieldChange('precio', event.target.value)}
                      required
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Estado
                    <select
                      value={lotForm.estado}
                      onChange={(event) => handleLotFieldChange('estado', event.target.value)}
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    >
                      {estadoOptions.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-slate-600">
                    Orden (opcional)
                    <input
                      type="number"
                      value={lotForm.order}
                      onChange={(event) => handleLotFieldChange('order', event.target.value)}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={lotSaving}
                      className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {lotSaving ? 'Guardando…' : editingLotId ? 'Guardar cambios' : 'Agregar lote'}
                    </button>
                    {editingLotId ? (
                      <button
                        type="button"
                        onClick={resetLotForm}
                        className="text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-900"
                      >
                        Cancelar edición
                      </button>
                    ) : null}
                  </div>
                </form>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Lotes registrados</h3>
                    <p className="text-sm text-slate-500">Consulta y actualiza la información disponible.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadLots()}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    Actualizar
                  </button>
                </div>
                {lotsError ? <p className="mb-4 text-sm text-red-600">{lotsError}</p> : null}
                {lotsLoading ? (
                  <p className="text-sm text-slate-500">Cargando lotes…</p>
                ) : lotsEmpty ? (
                  <p className="text-sm text-slate-500">Aún no hay lotes registrados.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600">
                      <thead>
                        <tr>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Identificador</th>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Superficie</th>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Precio</th>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Estado</th>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lots.map((lot) => (
                          <tr key={lot.id} className="border-t border-slate-100">
                            <td className="py-2 pr-4 font-medium text-slate-900">{lot.identifier}</td>
                            <td className="py-2 pr-4">{lot.superficieM2.toLocaleString('es-MX')} m²</td>
                            <td className="py-2 pr-4">${lot.precio.toLocaleString('es-MX')}</td>
                            <td className="py-2 pr-4 capitalize">{lot.estado}</td>
                            <td className="py-2 pr-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleLotEdit(lot)}
                                  className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-900"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleLotDelete(lot)}
                                  className="text-sm font-semibold text-red-600 underline-offset-4 hover:text-red-700"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {activeTab === 'users' ? (
            <section className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingUserId ? 'Editar usuario' : 'Crear nuevo usuario'}
                  </h2>
                  <p className="text-sm text-slate-500">Otorga acceso al panel a tu equipo.</p>
                </div>
                {userFormError ? <p className="mb-4 text-sm text-red-600">{userFormError}</p> : null}
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleUserSubmit}>
                  <label className="text-sm text-slate-600">
                    Nombre completo
                    <input
                      type="text"
                      value={userFormState.name}
                      onChange={(event) => handleUserFieldChange('name', event.target.value)}
                      required
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Correo electrónico
                    <input
                      type="email"
                      value={userFormState.email}
                      onChange={(event) => handleUserFieldChange('email', event.target.value)}
                      required
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Rol
                    <select
                      value={userFormState.role}
                      onChange={(event) => handleUserFieldChange('role', event.target.value)}
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-slate-600">
                    {editingUserId ? 'Contraseña (opcional)' : 'Contraseña temporal'}
                    <input
                      type="password"
                      value={userFormState.password}
                      onChange={(event) => handleUserFieldChange('password', event.target.value)}
                      placeholder={editingUserId ? 'Mantener contraseña actual' : 'Define una contraseña inicial'}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={userSaving}
                      className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {userSaving ? 'Guardando…' : editingUserId ? 'Guardar cambios' : 'Crear usuario'}
                    </button>
                    {editingUserId ? (
                      <button
                        type="button"
                        onClick={resetUserForm}
                        className="text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-900"
                      >
                        Cancelar edición
                      </button>
                    ) : null}
                  </div>
                </form>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Usuarios del CRM</h3>
                    <p className="text-sm text-slate-500">Administra los accesos disponibles.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadUsers()}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    Actualizar
                  </button>
                </div>
                {usersError ? <p className="mb-4 text-sm text-red-600">{usersError}</p> : null}
                {usersLoading ? (
                  <p className="text-sm text-slate-500">Cargando usuarios…</p>
                ) : usersEmpty ? (
                  <p className="text-sm text-slate-500">Aún no hay usuarios registrados.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600">
                      <thead>
                        <tr>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Nombre</th>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Correo</th>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Rol</th>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((adminUser) => (
                          <tr key={adminUser.id} className="border-t border-slate-100">
                            <td className="py-2 pr-4 font-medium text-slate-900">{adminUser.name}</td>
                            <td className="py-2 pr-4">{adminUser.email}</td>
                            <td className="py-2 pr-4 uppercase tracking-wide text-slate-500">{adminUser.role}</td>
                            <td className="py-2 pr-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUserEdit(adminUser)}
                                  className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-900"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleUserDelete(adminUser)}
                                  className="text-sm font-semibold text-red-600 underline-offset-4 hover:text-red-700"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {activeTab === 'contacts' ? (
            <section className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {isAdmin ? 'Mensajes recibidos' : 'Contactos asignados para ti'}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {isAdmin
                        ? 'Asigna a un miembro del equipo los mensajes de los formularios de contacto.'
                        : 'Consulta los mensajes que te asignaron desde los formularios de contacto.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadContactSubmissions()}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    Actualizar
                  </button>
                </div>
                {contactsError ? <p className="mb-4 text-sm text-red-600">{contactsError}</p> : null}
                {contactsLoading ? (
                  <p className="text-sm text-slate-500">Cargando contactos…</p>
                ) : contactsEmpty ? (
                  <p className="text-sm text-slate-500">
                    {isAdmin ? 'Aún no hay registros de formularios de contacto.' : 'Aún no tienes mensajes asignados.'}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600">
                      <thead>
                        <tr>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Nombre</th>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Correo</th>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Teléfono</th>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Interés</th>
                          <th className="py-2 pr-4 font-semibold text-slate-500">Recibido</th>
                          {isAdmin ? (
                            <th className="py-2 pr-4 font-semibold text-slate-500">Asignado a</th>
                          ) : null}
                        </tr>
                      </thead>
                      <tbody>
                        {contactSubmissions.map((submission) => (
                          <tr key={submission.id} className="border-t border-slate-100 align-top">
                            <td className="py-2 pr-4 font-medium text-slate-900">{submission.nombre}</td>
                            <td className="py-2 pr-4">
                              <a
                                className="text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
                                href={`mailto:${submission.correo}`}
                              >
                                {submission.correo}
                              </a>
                            </td>
                            <td className="py-2 pr-4">
                              <a
                                className="text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
                                href={`tel:${submission.telefono}`}
                              >
                                {submission.telefono}
                              </a>
                            </td>
                            <td className="py-2 pr-4 max-w-[280px] whitespace-pre-wrap text-slate-700">{submission.interes}</td>
                            <td className="py-2 pr-4 text-slate-500">{formatDateTime(submission.createdAt)}</td>
                            {isAdmin ? (
                              <td className="py-2 pr-4">
                                <div className="flex items-center gap-2">
                                  <select
                                    value={submission.assignedTo?.id ?? ''}
                                    onChange={(event) =>
                                      void handleAssignContact(
                                        submission.id,
                                        event.target.value === '' ? null : event.target.value,
                                      )
                                    }
                                    className="rounded-2xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                                    disabled={contactAssigningId === submission.id}
                                  >
                                    <option value="">Sin asignar</option>
                                    {users.map((adminUser) => (
                                      <option key={adminUser.id} value={adminUser.id}>
                                        {adminUser.name} ({adminUser.email})
                                      </option>
                                    ))}
                                  </select>
                                  {contactAssigningId === submission.id ? (
                                    <span className="text-xs text-slate-500">Guardando…</span>
                                  ) : null}
                                </div>
                              </td>
                            ) : null}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
