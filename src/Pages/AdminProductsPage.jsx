// src/Pages/AdminProductsPage.jsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { catalog } from '../api/mockApi';
import { useToast } from '../context/ToastContext';
import ProductFormModal from '../components/ProductFormModal';
import ConfirmModal from '../components/ConfirmModal';

function AdminProductsPage() {
  const { push } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    catalog.listProducts().then((list) => {
      setItems(list);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    const res =
      formModal.mode === 'create'
        ? await catalog.createProduct(data)
        : await catalog.updateProduct(formModal.item.id, data);
    setSubmitting(false);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push(formModal.mode === 'create' ? 'Producto creado correctamente.' : 'Producto actualizado.', 'success');
    setFormModal(null);
    load();
  };

  const handleDelete = async () => {
    setSubmitting(true);
    const res = await catalog.deleteProduct(deleteTarget.id);
    setSubmitting(false);
    setDeleteTarget(null);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push('Producto eliminado.', 'success');
    load();
  };

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Productos</h1>
        <button className="btn btn--primary" onClick={() => setFormModal({ mode: 'create' })}>
          <Plus size={16} /> Agregar producto
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Inventario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  Cargando productos...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  No hay productos registrados todavía.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => setFormModal({ mode: 'edit', item: p })}>
                        <Pencil size={15} /> Editar
                      </button>
                      <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(p)}>
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
        <ProductFormModal
          mode={formModal.mode}
          initial={formModal.item}
          submitting={submitting}
          onCancel={() => setFormModal(null)}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar producto"
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

export default AdminProductsPage;
