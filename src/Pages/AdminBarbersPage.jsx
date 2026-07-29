// src/Pages/AdminBarbersPage.jsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { catalog } from '../api/mockApi';
import { useToast } from '../context/ToastContext';
import BarberFormModal from '../components/BarberFormModal';
import ConfirmModal from '../components/ConfirmModal';

function AdminBarbersPage() {
  const { push } = useToast();
  const [barbers, setBarbers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(null); // { mode, item? }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    catalog.listBranches().then(setBranches);
  }, []);

  const load = () => {
    setLoading(true);
    catalog.listBarbers(branchFilter || undefined).then((list) => {
      setBarbers(list);
      setLoading(false);
    });
  };

  useEffect(load, [branchFilter]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    const res =
      formModal.mode === 'create'
        ? await catalog.createBarber(data)
        : await catalog.updateBarber(formModal.item.id, data);
    setSubmitting(false);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push(formModal.mode === 'create' ? 'Barbero creado correctamente.' : 'Barbero actualizado.', 'success');
    setFormModal(null);
    load();
  };

  const handleDelete = async () => {
    setSubmitting(true);
    const res = await catalog.deleteBarber(deleteTarget.id);
    setSubmitting(false);
    setDeleteTarget(null);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push('Barbero eliminado.', 'success');
    load();
  };

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Barberos</h1>
        <button
          className="btn btn--primary"
          onClick={() => setFormModal({ mode: 'create' })}
          disabled={branches.length === 0}
        >
          <Plus size={16} /> Agregar barbero
        </button>
      </div>

      <div className="table-wrap" style={{ padding: 16, marginBottom: 16 }}>
        <div className="form-field" style={{ marginBottom: 0, maxWidth: 260 }}>
          <label htmlFor="filtro-sucursal">Filtrar por sucursal</label>
          <select id="filtro-sucursal" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
            <option value="">Todas las sucursales</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Sucursal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  Cargando barberos...
                </td>
              </tr>
            ) : barbers.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  No hay barberos que coincidan con el filtro.
                </td>
              </tr>
            ) : (
              barbers.map((b) => (
                <tr key={b.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={b.avatar}
                      alt={b.name}
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    {b.name}
                  </td>
                  <td>{b.branchName || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => setFormModal({ mode: 'edit', item: b })}>
                        <Pencil size={15} /> Editar
                      </button>
                      <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(b)}>
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

      {formModal && (
        <BarberFormModal
          mode={formModal.mode}
          initial={formModal.item}
          branches={branches}
          submitting={submitting}
          onCancel={() => setFormModal(null)}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar barbero"
          message={`¿Seguro que deseas eliminar a "${deleteTarget.name}"? Sus citas ya agendadas se conservan, pero quedarán sin barbero asignado.`}
          confirmLabel="Sí, eliminar"
          danger
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default AdminBarbersPage;
