// src/components/BranchFormModal.jsx
import { useState } from 'react';
import Modal from './Modal';

function BranchFormModal({ mode, initial, submitting, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    address: initial?.address || '',
    phone: initial?.phone || '',
    openingTime: initial?.openingTime || '10:00',
    closingTime: initial?.closingTime || '20:00',
    image: initial?.image || '',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio.';
    if (!form.address.trim()) errs.address = 'La dirección es obligatoria.';
    if (!form.phone.trim()) errs.phone = 'El teléfono es obligatorio.';
    if (form.closingTime <= form.openingTime) {
      errs.closingTime = 'El horario de cierre debe ser después del de apertura.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <Modal title={mode === 'create' ? 'Agregar sucursal' : 'Editar sucursal'} onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="name">Nombre</label>
          <input id="name" value={form.name} onChange={set('name')} />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>
        <div className="form-field">
          <label htmlFor="address">Dirección</label>
          <input id="address" value={form.address} onChange={set('address')} />
          {errors.address && <div className="field-error">{errors.address}</div>}
        </div>
        <div className="form-field">
          <label htmlFor="phone">Teléfono</label>
          <input id="phone" value={form.phone} onChange={set('phone')} />
          {errors.phone && <div className="field-error">{errors.phone}</div>}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-field" style={{ flex: 1 }}>
            <label htmlFor="openingTime">Hora de apertura</label>
            <input id="openingTime" type="time" value={form.openingTime} onChange={set('openingTime')} />
          </div>
          <div className="form-field" style={{ flex: 1 }}>
            <label htmlFor="closingTime">Hora de cierre</label>
            <input id="closingTime" type="time" value={form.closingTime} onChange={set('closingTime')} />
            {errors.closingTime && <div className="field-error">{errors.closingTime}</div>}
          </div>
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
            {submitting ? 'Guardando...' : mode === 'create' ? 'Crear sucursal' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default BranchFormModal;
