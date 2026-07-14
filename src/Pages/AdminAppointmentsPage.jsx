// src/Pages/AdminAppointmentsPage.jsx
//
// Tabla de datos (citas) con filtros, paginación reflejada en la URL y CRUD
// completo (agregar, editar, eliminar), además de las acciones propias del
// barbero (aceptar / posponer). En cada acción de CRUD se hace primero una
// petición real a una API (DummyJSON) para practicar la llamada HTTP, y
// después se refleja el cambio en el estado local para que la tabla se
// actualice visualmente.
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, CalendarClock, Pencil, Trash2, Plus, Search } from 'lucide-react';
import { appointments as appointmentsApi, catalog } from '../api/mockApi';
import { crearRegistroReal, editarRegistroReal, eliminarRegistroReal } from '../api/dummyPractice';
import { useToast } from '../context/ToastContext';
import PostponeModal from '../components/PostponeModal';
import ConfirmModal from '../components/ConfirmModal';
import AppointmentFormModal from '../components/AppointmentFormModal';
import Pagination from '../components/Pagination';

const CATEGORIES = ['Barba', 'Corte', 'Limpieza', 'Degradado'];
const STATUSES = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'pospuesta', label: 'Pospuesta' },
  { value: 'reagendacion_solicitada', label: 'Reagendación solicitada' },
  { value: 'cancelada', label: 'Cancelada' },
];
const PAGE_SIZE_OPTIONS = [10, 20, 40, 50];

function AdminAppointmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { push } = useToast();

  // --- Estado derivado de la URL (filtros + paginación compartibles) ---
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const soloProximas = searchParams.get('proximas') === '1';

  const [searchInput, setSearchInput] = useState(search);

  const updateParams = useCallback(
    (changes) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(changes).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') next.delete(key);
        else next.set(key, value);
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  // --- Datos ---
  const [data, setData] = useState({ items: [], total: 0 });
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    appointmentsApi
      .listAll({ category, status, search, onlyUpcoming: soloProximas, page, pageSize: limit })
      .then((res) => setData(res))
      .catch(() => setError('No se pudieron cargar las citas. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [category, status, search, soloProximas, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    catalog.listServices().then(setServices);
    catalog.listBranches().then(setBranches);
  }, []);

  // Debounce del buscador de texto -> se refleja en la URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search) updateParams({ search: searchInput, page: 1 });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const totalPages = Math.max(1, Math.ceil(data.total / limit));

  // --- Modales ---
  const [postponeTarget, setPostponeTarget] = useState(null);
  const [formModal, setFormModal] = useState(null); // { mode: 'create'|'edit', appointment? }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmEdit, setConfirmEdit] = useState(null); // payload pendiente de confirmar
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = async (id) => {
    const res = await appointmentsApi.accept(id);
    if (!res.ok) push(res.error, 'error');
    else {
      push('Cita confirmada. Se notificó al cliente por WhatsApp.', 'success');
      load();
    }
  };

  // 1) Agregar cita: llamada real a la API + reflejo en estado local
  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await crearRegistroReal(
        `Cita: ${payload.clientName} - ${payload.service.name} - ${payload.dateTime}`
      );
    } catch {
      // Si la API de práctica falla, igual seguimos con el flujo local
    }
    const res = await appointmentsApi.createByAdmin(payload);
    setSubmitting(false);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push('Cita agregada correctamente.', 'success');
    setFormModal(null);
    load();
  };

  // 2) Editar cita: se pide confirmación antes de aplicar el cambio
  const handleEditSubmit = (payload) => {
    setConfirmEdit({ id: formModal.appointment.id, payload });
  };

  const confirmarEdicion = async () => {
    if (!confirmEdit) return;
    setSubmitting(true);
    try {
      await editarRegistroReal(
        confirmEdit.id,
        `Cita: ${confirmEdit.payload.clientName} - ${confirmEdit.payload.service.name}`
      );
    } catch {
      // Continúa aunque falle la API de práctica
    }
    const { service, ...rest } = confirmEdit.payload;
    const res = await appointmentsApi.update(confirmEdit.id, {
      ...rest,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      duration: service.duration,
    });
    setSubmitting(false);
    setConfirmEdit(null);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push('Cita editada correctamente.', 'success');
    setFormModal(null);
    load();
  };

  // 3) Eliminar cita: se pide confirmación antes de borrar
  const confirmarEliminacion = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await eliminarRegistroReal();
    } catch {
      // Continúa aunque falle la API de práctica
    }
    const res = await appointmentsApi.remove(deleteTarget.id);
    setSubmitting(false);
    if (!res.ok) {
      push(res.error, 'error');
    } else {
      push('Cita eliminada.', 'success');
      load();
    }
    setDeleteTarget(null);
  };

  const activeFiltersCount = [category, status, soloProximas ? '1' : ''].filter(Boolean).length;

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Gestión de citas</h1>
        <button className="btn btn--primary" onClick={() => setFormModal({ mode: 'create' })}>
          <Plus size={16} /> Agregar cita
        </button>
      </div>

      {/* --- Filtros --- */}
      <div className="table-wrap" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div className="search-bar" style={{ minWidth: 220 }}>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por cliente o servicio"
              aria-label="Buscar por cliente o servicio"
            />
            <button type="button" aria-label="Buscar">
              <Search size={16} />
            </button>
          </div>

          <div className="form-field" style={{ marginBottom: 0 }}>
            <label htmlFor="filtro-categoria">Categoría</label>
            <select
              id="filtro-categoria"
              value={category}
              onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
            >
              <option value="">Todas</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field" style={{ marginBottom: 0 }}>
            <label htmlFor="filtro-estado">Estado</label>
            <select
              id="filtro-estado"
              value={status}
              onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
            >
              <option value="">Todos</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--muted)' }}>
            <input
              type="checkbox"
              checked={soloProximas}
              onChange={(e) => updateParams({ proximas: e.target.checked ? '1' : null, page: 1 })}
            />
            Solo hoy y mañana
          </label>

          <div className="form-field" style={{ marginBottom: 0, marginLeft: 'auto' }}>
            <label htmlFor="page-size">Registros por página</label>
            <select
              id="page-size"
              value={limit}
              onChange={(e) => updateParams({ limit: e.target.value, page: 1 })}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => updateParams({ category: null, status: null, proximas: null, page: 1 })}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* --- Tabla --- */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Fecha y hora</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  Cargando citas...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--danger)' }}>
                  {error}
                </td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  No hay citas que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              data.items.map((a) => (
                <tr key={a.id}>
                  <td>{a.clientName}</td>
                  <td>{a.serviceName}</td>
                  <td>{new Date(a.dateTime).toLocaleString('es-MX')}</td>
                  <td>{a.clientPhone}</td>
                  <td>
                    <span className={`badge badge--${a.status}`}>{a.status.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {a.status === 'pendiente' && (
                        <button className="btn btn--primary btn--sm" onClick={() => handleAccept(a.id)}>
                          <CheckCircle2 size={15} /> Aceptar
                        </button>
                      )}
                      {a.status !== 'cancelada' && (
                        <button className="btn btn--ghost btn--sm" onClick={() => setPostponeTarget(a)}>
                          <CalendarClock size={15} /> Posponer
                        </button>
                      )}
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => setFormModal({ mode: 'edit', appointment: a })}
                      >
                        <Pencil size={15} /> Editar
                      </button>
                      <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(a)}>
                        <Trash2 size={15} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16 }}>
        <Pagination page={page} totalPages={totalPages} onChange={(p) => updateParams({ page: p })} />
      </div>

      {postponeTarget && (
        <PostponeModal appointment={postponeTarget} onClose={() => setPostponeTarget(null)} onDone={load} />
      )}

      {formModal && services.length > 0 && branches.length > 0 && (
        <AppointmentFormModal
          mode={formModal.mode}
          initial={formModal.appointment}
          services={services}
          branches={branches}
          submitting={submitting}
          onCancel={() => setFormModal(null)}
          onSubmit={formModal.mode === 'create' ? handleCreate : handleEditSubmit}
        />
      )}

      {confirmEdit && (
        <ConfirmModal
          title="Confirmar edición"
          message="¿Seguro que deseas guardar los cambios de esta cita?"
          confirmLabel="Sí, guardar cambios"
          onConfirm={confirmarEdicion}
          onClose={() => setConfirmEdit(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar cita"
          message={`¿Seguro que deseas eliminar la cita de ${deleteTarget.clientName}? Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          danger
          onConfirm={confirmarEliminacion}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default AdminAppointmentsPage;
