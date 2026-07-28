// src/components/ServiceFormModal.jsx
import { useState } from 'react';
import Modal from './Modal';

const CATEGORIES = ['Corte', 'Barba', 'Limpieza', 'Degradado', 'Color'];

function ServiceFormModal({ mode, initial, submitting, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    category: initial?.category || CATEGORIES[0],
    price: initial?.price ?? '',
    duration: initial?.duration ?? '',
    description: initial?.description || '',
    image: initial?.image || '',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio.';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Ingresa un precio válido.';
    if (!form.duration || Number(form.duration) < 5) errs.duration = 'La duración mínima es 5 minutos.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      price: Number(form.price),
      duration: Number(form.duration),
    });
  };

  return (
    <Modal title={mode === 'create' ? 'Agregar servicio' : 'Editar servicio'} onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="name">Nombre</label>
          <input id="name" value={form.name} onChange={set('name')} />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>
        <div className="form-field">
          <label htmlFor="category">Categoría</label>
          <select id="category" value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-field" style={{ flex: 1 }}>
            <label htmlFor="price">Precio (MXN)</label>
            <input id="price" type="number" min="0" step="1" value={form.price} onChange={set('price')} />
            {errors.price && <div className="field-error">{errors.price}</div>}
          </div>
          <div className="form-field" style={{ flex: 1 }}>
            <label htmlFor="duration">Duración (min)</label>
            <input id="duration" type="number" min="5" step="5" value={form.duration} onChange={set('duration')} />
            {errors.duration && <div className="field-error">{errors.duration}</div>}
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="description">Descripción</label>
          <textarea id="description" value={form.description} onChange={set('description')} />
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
            {submitting ? 'Guardando...' : mode === 'create' ? 'Crear servicio' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ServiceFormModal;
