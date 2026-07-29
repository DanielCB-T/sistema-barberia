// src/Pages/AdminNewsPage.jsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { catalog } from '../api/mockApi';
import { useToast } from '../context/ToastContext';
import NewsFormModal from '../components/NewsFormModal';
import ConfirmModal from '../components/ConfirmModal';

function AdminNewsPage() {
  const { push } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    catalog.listNews().then((list) => {
      setItems(list);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    const res =
      formModal.mode === 'create'
        ? await catalog.createNews(data)
        : await catalog.updateNews(formModal.item.id, data);
    setSubmitting(false);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push(formModal.mode === 'create' ? 'Noticia creada correctamente.' : 'Noticia actualizada.', 'success');
    setFormModal(null);
    load();
  };

  const handleDelete = async () => {
    setSubmitting(true);
    const res = await catalog.deleteNews(deleteTarget.id);
    setSubmitting(false);
    setDeleteTarget(null);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push('Noticia eliminada.', 'success');
    load();
  };

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Noticias</h1>
        <button className="btn btn--primary" onClick={() => setFormModal({ mode: 'create' })}>
          <Plus size={16} /> Agregar noticia
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  Cargando noticias...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  No hay noticias registradas todavía.
                </td>
              </tr>
            ) : (
              items.map((n) => (
                <tr key={n.id}>
                  <td>{n.title}</td>
                  <td>{new Date(n.date).toLocaleDateString('es-MX')}</td>
                  <td style={{ maxWidth: 360 }}>{n.summary}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => setFormModal({ mode: 'edit', item: n })}>
                        <Pencil size={15} /> Editar
                      </button>
                      <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(n)}>
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
        <NewsFormModal
          mode={formModal.mode}
          initial={formModal.item}
          submitting={submitting}
          onCancel={() => setFormModal(null)}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar noticia"
          message={`¿Seguro que deseas eliminar "${deleteTarget.title}"? Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          danger
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default AdminNewsPage;
