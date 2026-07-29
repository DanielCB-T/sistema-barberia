// src/components/BranchFormModal.jsx
import { useState } from 'react';
import Modal from './Modal';
// <-- Elimina la línea de ImageUploader

function BranchFormModal({ mode, initial, submitting, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    address: initial?.address || '',
    phone: initial?.phone || '',
    openingTime: initial?.openingTime || '10:00',
    closingTime: initial?.closingTime || '20:00',
    image: initial?.image || '', // <-- Mantén esta línea
  });
  // <-- Elimina la línea 'const [imageFile, setImageFile] = useState(null);'
  const [errors, setErrors] = useState({});

  // ... validate y set se mantienen igual ...

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form); // <-- Mantén esta línea (envía el objeto form normal)
  };

  return (
    <Modal title={mode === 'create' ? 'Agregar sucursal' : 'Editar sucursal'} onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        {/* ... los campos de nombre, dirección, teléfono y horarios se mantienen igual ... */}
        
        {/* <-- Reemplaza la sección de imagen con esto: */}
        <div className="form-field">
          <label htmlFor="image">URL de imagen</label>
          <input id="image" value={form.image} onChange={set('image')} placeholder="https://..." />
        </div>

        <div className="modal__footer">
          {/* ... botones iguales ... */}
        </div>
      </form>
    </Modal>
  );
}

export default BranchFormModal;