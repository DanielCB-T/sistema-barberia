// src/components/BarberFormModal.jsx
import { useState } from 'react';
import Modal from './Modal';
import ImageUploader from './ImageUploader';
import { validarCorreo, validarPassword } from '../utils/utileria';

function BarberFormModal({ mode, initial, branches, submitting, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    branchId: initial?.branchId || branches[0]?.id || '',
    password: '',
    confirmPassword: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio.';
    if (!form.email.trim() || !validarCorreo(form.email.trim())) {
      errs.email = 'Ingresa un correo electrónico válido.';
    }
    if (!form.branchId) errs.branchId = 'Selecciona una sucursal.';

    // La contraseña es obligatoria al crear; opcional al editar (solo si
    // el admin quiere cambiarla).
    if (mode === 'create' || form.password) {
      if (!validarPassword(form.password)) {
        errs.password =
          'Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.';
      }
      if (form.password !== form.confirmPassword) {
        errs.confirmPassword = 'Las contraseñas no coinciden.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, imageFile });
  };

  return (
    <Modal title={mode === 'create' ? 'Agregar barbero' : 'Editar barbero'} onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="name">Nombre completo</label>
          <input id="name" value={form.name} onChange={set('name')} />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>
        <div className="form-field">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" value={form.email} onChange={set('email')} />
          {errors.email && <div className="field-error">{errors.email}</div>}
        </div>
        <div className="form-field">
          <label htmlFor="phone">Teléfono</label>
          <input id="phone" value={form.phone} onChange={set('phone')} />
        </div>
        <div className="form-field">
          <label htmlFor="branchId">Sucursal</label>
          <select id="branchId" value={form.branchId} onChange={set('branchId')}>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.branchId && <div className="field-error">{errors.branchId}</div>}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-field" style={{ flex: 1 }}>
            <label htmlFor="password">
              {mode === 'create' ? 'Contraseña' : 'Nueva contraseña (opcional)'}
            </label>
            <input id="password" type="password" value={form.password} onChange={set('password')} />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>
          <div className="form-field" style={{ flex: 1 }}>
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
            />
            {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
          </div>
        </div>

        <ImageUploader label="Foto de perfil" currentUrl={initial?.avatar} onChange={setImageFile} />

        <div className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--accent" disabled={submitting}>
            {submitting ? 'Guardando...' : mode === 'create' ? 'Crear barbero' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default BarberFormModal;
