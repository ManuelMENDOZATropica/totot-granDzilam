import Head from 'next/head';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchAdminLots,
  createAdminLot,
  updateAdminLot,
  deleteAdminLot,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  type AdminLot,
  type SaveLotPayload,
  type AdminUser,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '@/lib/admin';
import {
  fetchFinanceSettings,
  updateFinanceSettings,
  type FinanceSettingsDTO,
} from '@/lib/financeSettings';
import { formatearMoneda } from '@/lib/formatoMoneda';

const LOT_ESTADOS: SaveLotPayload['estado'][] = ['disponible', 'vendido', 'apartado'];

const emptyLotForm: SaveLotPayload & { order?: number } = {
  identifier: '',
  superficieM2: 0,
  precio: 0,
  estado: 'disponible',
  order: 0,
};

const emptyUserForm: CreateUserPayload = {
  email: '',
  name: '',
  password: '',
  role: 'editor',
};

type TabId = 'lots' | 'settings' | 'users';

const tabs: { id: TabId; label: string }[] = [
  { id: 'lots', label: 'Lotes' },
  { id: 'settings', label: 'Financiamiento' },
  { id: 'users', label: 'Usuarios' },
];

export default function CRMPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('lots');

  const [lots, setLots] = useState<AdminLot[]>([]);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [lotsError, setLotsError] = useState<string | null>(null);
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [lotForm, setLotForm] = useState({ ...emptyLotForm });

  const [settings, setSettings] = useState<FinanceSettingsDTO | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsForm, setSettingsForm] = useState<FinanceSettingsDTO | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<CreateUserPayload>({ ...emptyUserForm });

  const authorized = useMemo(() => {
    return Boolean(!isLoading && user && user.role === 'admin' && token);
  }, [isLoading, token, user]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        void router.replace(`/login?next=${encodeURIComponent('/crm')}`);
      } else if (user.role !== 'admin') {
        void router.replace('/');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!authorized || !token) {
      return;
    }

    const loadLots = async () => {
      setLotsLoading(true);
      setLotsError(null);
      try {
        const data = await fetchAdminLots(token);
        setLots(data);
      } catch (error) {
        setLotsError((error as Error).message);
      } finally {
        setLotsLoading(false);
      }
    };

    const loadSettings = async () => {
      setSettingsLoading(true);
      setSettingsError(null);
      try {
        const data = await fetchFinanceSettings();
        setSettings(data);
        setSettingsForm(data);
      } catch (error) {
        setSettingsError((error as Error).message);
      } finally {
        setSettingsLoading(false);
      }
    };

    const loadUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const data = await fetchAdminUsers(token);
        setUsers(data);
      } catch (error) {
        setUsersError((error as Error).message);
      } finally {
        setUsersLoading(false);
      }
    };

    void loadLots();
    void loadSettings();
    void loadUsers();
  }, [authorized, token]);

  const resetLotForm = () => {
    setLotForm({ ...emptyLotForm });
    setEditingLotId(null);
  };

  const handleLotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    const payload: SaveLotPayload = {
      identifier: lotForm.identifier.trim(),
      superficieM2: Number(lotForm.superficieM2),
      precio: Number(lotForm.precio),
      estado: lotForm.estado,
      order: Number(lotForm.order ?? 0),
    };

    try {
      setLotsLoading(true);
      if (editingLotId) {
        const updated = await updateAdminLot(token, editingLotId, payload);
        setLots((prev) => prev.map((lot) => (lot.id === updated.id ? updated : lot)));
      } else {
        const created = await createAdminLot(token, payload);
        setLots((prev) => [...prev, created]);
      }
      resetLotForm();
    } catch (error) {
      setLotsError((error as Error).message);
    } finally {
      setLotsLoading(false);
    }
  };

  const handleLotEdit = (lot: AdminLot) => {
    setEditingLotId(lot.id);
    setLotForm({
      identifier: lot.identifier,
      superficieM2: lot.superficieM2,
      precio: lot.precio,
      estado: lot.estado,
      order: lot.order,
    });
  };

  const handleLotDelete = async (id: string) => {
    if (!token || !window.confirm('¿Eliminar este lote?')) return;
    try {
      setLotsLoading(true);
      await deleteAdminLot(token, id);
      setLots((prev) => prev.filter((lot) => lot.id !== id));
      if (editingLotId === id) {
        resetLotForm();
      }
    } catch (error) {
      setLotsError((error as Error).message);
    } finally {
      setLotsLoading(false);
    }
  };

  const handleSettingsChange = (key: keyof FinanceSettingsDTO, value: number) => {
    setSettingsForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSettingsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !settingsForm) return;

    try {
      setSettingsLoading(true);
      setSettingsError(null);
      setSettingsMessage(null);
      const updated = await updateFinanceSettings(token, settingsForm);
      setSettings(updated);
      setSettingsForm(updated);
      setSettingsMessage('Configuración guardada correctamente.');
    } catch (error) {
      setSettingsError((error as Error).message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const resetUserForm = () => {
    setUserForm({ ...emptyUserForm });
    setEditingUserId(null);
  };

  const handleUserSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    try {
      setUsersLoading(true);
      if (editingUserId) {
        const payload: UpdateUserPayload = {
          email: userForm.email,
          name: userForm.name,
          role: userForm.role,
          password: userForm.password ? userForm.password : undefined,
        };
        const updated = await updateAdminUser(token, editingUserId, payload);
        setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const payload: CreateUserPayload = {
          email: userForm.email,
          name: userForm.name,
          password: userForm.password,
          role: userForm.role,
        };
        const created = await createAdminUser(token, payload);
        setUsers((prev) => [...prev, created]);
      }
      resetUserForm();
    } catch (error) {
      setUsersError((error as Error).message);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserEdit = (record: AdminUser) => {
    setEditingUserId(record.id);
    setUserForm({
      email: record.email,
      name: record.name,
      password: '',
      role: record.role,
    });
  };

  const handleUserDelete = async (id: string) => {
    if (!token || !window.confirm('¿Eliminar este usuario?')) return;

    try {
      setUsersLoading(true);
      await deleteAdminUser(token, id);
      setUsers((prev) => prev.filter((record) => record.id !== id));
      if (editingUserId === id) {
        resetUserForm();
      }
    } catch (error) {
      setUsersError((error as Error).message);
    } finally {
      setUsersLoading(false);
    }
  };

  if (!authorized) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <HeaderBar />
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
            Cargando acceso…
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Panel administrativo · Gran Dzilam</title>
      </Head>
      <main className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <HeaderBar />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold text-slate-900">Panel administrativo</h1>
              <p className="text-sm text-slate-500">
                Administra la disponibilidad de lotes, la configuración de financiamiento y los usuarios con acceso al CRM.
              </p>
            </div>
            <nav className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {activeTab === 'lots' ? (
              <section className="flex flex-col gap-6">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Identificador</th>
                        <th className="px-4 py-3 text-right">Superficie (m²)</th>
                        <th className="px-4 py-3 text-right">Precio</th>
                        <th className="px-4 py-3 text-left">Estado</th>
                        <th className="px-4 py-3 text-right">Orden</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {lots.map((lot) => (
                        <tr key={lot.id}>
                          <td className="px-4 py-3 font-semibold text-slate-900">{lot.identifier}</td>
                          <td className="px-4 py-3 text-right">{lot.superficieM2}</td>
                          <td className="px-4 py-3 text-right">{formatearMoneda(lot.precio)}</td>
                          <td className="px-4 py-3 text-left capitalize">{lot.estado}</td>
                          <td className="px-4 py-3 text-right">{lot.order}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleLotEdit(lot)}
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLotDelete(lot.id)}
                                className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 transition hover:border-red-500 hover:text-red-700"
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
                {lotsError ? <p className="text-sm text-red-600">{lotsError}</p> : null}
                <form className="grid gap-4 rounded-xl border border-slate-200 p-6" onSubmit={handleLotSubmit}>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingLotId ? 'Editar lote' : 'Agregar lote'}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Identificador
                      <input
                        type="text"
                        value={lotForm.identifier}
                        onChange={(event) => setLotForm((prev) => ({ ...prev, identifier: event.target.value }))}
                        required
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Superficie (m²)
                      <input
                        type="number"
                        min={0}
                        value={lotForm.superficieM2}
                        onChange={(event) => setLotForm((prev) => ({ ...prev, superficieM2: Number(event.target.value) }))}
                        required
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Precio (MXN)
                      <input
                        type="number"
                        min={0}
                        value={lotForm.precio}
                        onChange={(event) => setLotForm((prev) => ({ ...prev, precio: Number(event.target.value) }))}
                        required
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Orden
                      <input
                        type="number"
                        value={lotForm.order ?? 0}
                        onChange={(event) => setLotForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Estado
                      <select
                        value={lotForm.estado}
                        onChange={(event) => setLotForm((prev) => ({ ...prev, estado: event.target.value as SaveLotPayload['estado'] }))}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        {LOT_ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={lotsLoading}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {editingLotId ? 'Guardar cambios' : 'Agregar lote'}
                    </button>
                    {editingLotId ? (
                      <button
                        type="button"
                        onClick={resetLotForm}
                        className="text-sm text-slate-500 underline-offset-4 hover:text-slate-900"
                      >
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </form>
              </section>
            ) : null}

            {activeTab === 'settings' ? (
              <section className="flex flex-col gap-6">
                <div className="rounded-xl border border-slate-200 p-6">
                  <h2 className="text-lg font-semibold text-slate-900">Parámetros de financiamiento</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Ajusta los rangos permitidos para el enganche y el plazo, además del interés aplicado al saldo a financiar.
                  </p>
                  {settingsError ? <p className="mt-3 text-sm text-red-600">{settingsError}</p> : null}
                  {settingsMessage ? <p className="mt-3 text-sm text-emerald-600">{settingsMessage}</p> : null}
                  <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSettingsSubmit}>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Enganche mínimo (%)
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={settingsForm?.minEnganche ?? 0}
                        onChange={(event) => handleSettingsChange('minEnganche', Number(event.target.value))}
                        required
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Enganche máximo (%)
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={settingsForm?.maxEnganche ?? 0}
                        onChange={(event) => handleSettingsChange('maxEnganche', Number(event.target.value))}
                        required
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Enganche predeterminado (%)
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={settingsForm?.defaultEnganche ?? 0}
                        onChange={(event) => handleSettingsChange('defaultEnganche', Number(event.target.value))}
                        required
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Plazo mínimo (meses)
                      <input
                        type="number"
                        min={1}
                        value={settingsForm?.minMeses ?? 0}
                        onChange={(event) => handleSettingsChange('minMeses', Number(event.target.value))}
                        required
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Plazo máximo (meses)
                      <input
                        type="number"
                        min={1}
                        value={settingsForm?.maxMeses ?? 0}
                        onChange={(event) => handleSettingsChange('maxMeses', Number(event.target.value))}
                        required
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Plazo predeterminado (meses)
                      <input
                        type="number"
                        min={1}
                        value={settingsForm?.defaultMeses ?? 0}
                        onChange={(event) => handleSettingsChange('defaultMeses', Number(event.target.value))}
                        required
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Interés aplicado (%)
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        value={settingsForm?.interes ?? 0}
                        onChange={(event) => handleSettingsChange('interes', Number(event.target.value))}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                    <div className="sm:col-span-2 flex items-center justify-end gap-3">
                      <button
                        type="submit"
                        disabled={settingsLoading}
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        Guardar cambios
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            ) : null}

            {activeTab === 'users' ? (
              <section className="flex flex-col gap-6">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Nombre</th>
                        <th className="px-4 py-3 text-left">Correo</th>
                        <th className="px-4 py-3 text-left">Rol</th>
                        <th className="px-4 py-3 text-left">Creado</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {users.map((record) => (
                        <tr key={record.id}>
                          <td className="px-4 py-3 font-semibold text-slate-900">{record.name}</td>
                          <td className="px-4 py-3">{record.email}</td>
                          <td className="px-4 py-3 capitalize">{record.role}</td>
                          <td className="px-4 py-3 text-sm text-slate-400">
                            {new Date(record.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleUserEdit(record)}
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUserDelete(record.id)}
                                className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 transition hover:border-red-500 hover:text-red-700"
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
                {usersError ? <p className="text-sm text-red-600">{usersError}</p> : null}
                <form className="grid gap-4 rounded-xl border border-slate-200 p-6" onSubmit={handleUserSubmit}>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingUserId ? 'Editar usuario' : 'Agregar usuario'}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Nombre completo
                      <input
                        type="text"
                        value={userForm.name}
                        onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))}
                        required
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Correo
                      <input
                        type="email"
                        value={userForm.email}
                        onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
                        required
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Rol
                      <select
                        value={userForm.role}
                        onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value as CreateUserPayload['role'] }))}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="admin">Administrador</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Consulta</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                      Contraseña
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
                        required={!editingUserId}
                        placeholder={editingUserId ? 'Dejar en blanco para conservar' : ''}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={usersLoading}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {editingUserId ? 'Guardar cambios' : 'Agregar usuario'}
                    </button>
                    {editingUserId ? (
                      <button
                        type="button"
                        onClick={resetUserForm}
                        className="text-sm text-slate-500 underline-offset-4 hover:text-slate-900"
                      >
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </form>
              </section>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}
