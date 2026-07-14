// src/components/AppointmentFormModal.jsx
import { useState } from 'react';
import Modal from './Modal';
import { soloLetras, validarTelefono, validarLongitud } from '../utils/utileria';

function toLocalInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// mode: 'create' | 'edit'
function AppointmentFormModal({ mode = 'create', initial, services, branches, onCancel, onSubmit, submitting }) {
  const [form, setForm] = useState({
    clientName: initial?.clientName || '',
    clientPhone: initial?.clientPhone || '',
    serviceId: initial?.serviceId || services[0]?.id || '',
    branchId: initial?.branchId || branches[0]?.id || '',
    dateTime: toLocalInputValue(initial?.dateTime) || '',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validar = () => {
    const errs = {};
    if (!form.clientName.trim()) {
      errs.clientName = 'El nombre del cliente es obligatorio.';
    } else if (!soloLetras(form.clientName.trim())) {
      errs.clientName = 'El nombre solo debe contener letras y espacios.';
    } else if (!validarLongitud(form.clientName, 80)) {
      errs.clientName = 'Máximo 80 caracteres.';
    }
    if (!validarTelefono(form.clientPhone)) {
      errs.clientPhone = 'El teléfono debe tener 10 dígitos, ej. 9511234567.';
    }
    if (!form.serviceId) errs.serviceId = 'Selecciona un servicio.';
    if (!form.branchId) errs.branchId = 'Selecciona una sucursal.';
    if (!form.dateTime) {
      errs.dateTime = 'Selecciona fecha y hora.';
    } else if (new Date(form.dateTime).getTime() < Date.now() - 60000) {
      errs.dateTime = 'La fecha y hora no puede ser en el pasado.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validar()) return;
    const service = services.find((s) => s.id === form.serviceId);
    onSubmit({ ...form, service, dateTime: new Date(form.dateTime).toISOString() });
  };

  return (
    <Modal title={mode === 'create' ? 'Agregar cita' : 'Editar cita'} onClose={onCancel}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="clientName">Nombre del cliente</label>
          <input id="clientName" value={form.clientName} onChange={set('clientName')} placeholder="Ej. Juan Pérez" />
          {errors.clientName && <div className="field-error">{errors.clientName}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="clientPhone">Teléfono</label>
          <input id="clientPhone" value={form.clientPhone} onChange={set('clientPhone')} placeholder="9511234567" />
          {errors.clientPhone && <div className="field-error">{errors.clientPhone}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="serviceId">Servicio</label>
          <select id="serviceId" value={form.serviceId} onChange={set('serviceId')}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category})
              </option>
            ))}
          </select>
          {errors.serviceId && <div className="field-error">{errors.serviceId}</div>}
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

        <div className="form-field">
          <label htmlFor="dateTime">Fecha y hora</label>
          <input id="dateTime" type="datetime-local" value={form.dateTime} onChange={set('dateTime')} />
          {errors.dateTime && <div className="field-error">{errors.dateTime}</div>}
        </div>

        <div className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--accent" disabled={submitting}>
            {submitting ? 'Guardando...' : mode === 'create' ? 'Agregar cita' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AppointmentFormModal;
