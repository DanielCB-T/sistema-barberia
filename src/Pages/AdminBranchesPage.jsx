// src/Pages/AdminBranchesPage.jsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { catalog } from '../api/mockApi';
import { useToast } from '../context/ToastContext';
import BranchFormModal from '../components/BranchFormModal';
import ConfirmModal from '../components/ConfirmModal';

function AdminBranchesPage() {
  const { push } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    catalog.listBranches().then((list) => {
      setItems(list);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    const res =
      formModal.mode === 'create'
        ? await catalog.createBranch(data)
        : await catalog.updateBranch(formModal.item.id, data);
    setSubmitting(false);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push(formModal.mode === 'create' ? 'Sucursal creada correctamente.' : 'Sucursal actualizada.', 'success');
    setFormModal(null);
    load();
  };

  const handleDelete = async () => {
    setSubmitting(true);
    const res = await catalog.deleteBranch(deleteTarget.id);
    setSubmitting(false);
    setDeleteTarget(null);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push('Sucursal eliminada.', 'success');
    load();
  };

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Sucursales</h1>
        <button className="btn btn--primary" onClick={() => setFormModal({ mode: 'create' })}>
          <Plus size={16} /> Agregar sucursal
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Horario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  Cargando sucursales...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  No hay sucursales registradas todavía.
                </td>
              </tr>
            ) : (
              items.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.address}</td>
                  <td>{b.phone}</td>
                  <td>
                    {b.openingTime} - {b.closingTime}
                  </td>
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
        <BranchFormModal
          mode={formModal.mode}
          initial={formModal.item}
          submitting={submitting}
          onCancel={() => setFormModal(null)}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar sucursal"
          message={`¿Seguro que deseas eliminar "${deleteTarget.name}"? Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          danger
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default AdminBranchesPage;
