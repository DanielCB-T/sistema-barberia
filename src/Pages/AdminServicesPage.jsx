// src/Pages/AdminServicesPage.jsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { catalog } from '../api/mockApi';
import { useToast } from '../context/ToastContext';
import ServiceFormModal from '../components/ServiceFormModal';
import ConfirmModal from '../components/ConfirmModal';

function AdminServicesPage() {
  const { push } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(null); // { mode, item? }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    catalog.listServices().then((list) => {
      setItems(list);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    const res =
      formModal.mode === 'create'
        ? await catalog.createService(data)
        : await catalog.updateService(formModal.item.id, data);
    setSubmitting(false);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push(formModal.mode === 'create' ? 'Servicio creado correctamente.' : 'Servicio actualizado.', 'success');
    setFormModal(null);
    load();
  };

  const handleDelete = async () => {
    setSubmitting(true);
    const res = await catalog.deleteService(deleteTarget.id);
    setSubmitting(false);
    setDeleteTarget(null);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push('Servicio eliminado.', 'success');
    load();
  };

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Servicios</h1>
        <button className="btn btn--primary" onClick={() => setFormModal({ mode: 'create' })}>
          <Plus size={16} /> Agregar servicio
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Duración</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  Cargando servicios...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  No hay servicios registrados todavía.
                </td>
              </tr>
            ) : (
              items.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.category}</td>
                  <td>${s.price.toFixed(2)}</td>
                  <td>{s.duration} min</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => setFormModal({ mode: 'edit', item: s })}>
                        <Pencil size={15} /> Editar
                      </button>
                      <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(s)}>
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
        <ServiceFormModal
          mode={formModal.mode}
          initial={formModal.item}
          submitting={submitting}
          onCancel={() => setFormModal(null)}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar servicio"
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

export default AdminServicesPage;
