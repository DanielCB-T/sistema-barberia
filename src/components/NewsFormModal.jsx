// src/components/NewsFormModal.jsx
import { useState } from 'react';
import Modal from './Modal';

function NewsFormModal({ mode, initial, submitting, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    summary: initial?.summary || '',
    date: initial?.date || new Date().toISOString().slice(0, 10),
    image: initial?.image || '',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'El título es obligatorio.';
    if (!form.summary.trim()) errs.summary = 'La descripción es obligatoria.';
    if (!form.date) errs.date = 'La fecha es obligatoria.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <Modal title={mode === 'create' ? 'Agregar noticia' : 'Editar noticia'} onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="title">Título</label>
          <input id="title" value={form.title} onChange={set('title')} />
          {errors.title && <div className="field-error">{errors.title}</div>}
        </div>
        <div className="form-field">
          <label htmlFor="summary">Descripción</label>
          <textarea id="summary" value={form.summary} onChange={set('summary')} />
          {errors.summary && <div className="field-error">{errors.summary}</div>}
        </div>
        <div className="form-field">
          <label htmlFor="date">Fecha</label>
          <input id="date" type="date" value={form.date} onChange={set('date')} />
          {errors.date && <div className="field-error">{errors.date}</div>}
        </div>
        <div className="form-field">
          <label htmlFor="image">URL de imagen</label>
          <input id="image" value={form.image} onChange={set('image')} placeholder="https://..." />
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--accent" disabled={submitting}>
            {submitting ? 'Guardando...' : mode === 'create' ? 'Crear noticia' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default NewsFormModal;
