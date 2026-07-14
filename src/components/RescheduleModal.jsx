// src/components/RescheduleModal.jsx
import { useState } from 'react';
import Modal from './Modal';
import { appointments } from '../api/mockApi';
import { useToast } from '../context/ToastContext';

function RescheduleModal({ appointment, onClose, onDone }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { push } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await appointments.requestReschedule(appointment.id, note);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    push('Solicitud de reagendación enviada. La barbería te contactará.', 'success');
    onDone?.(res.appointment);
    onClose();
  };

  return (
    <Modal title="Solicitar reagendación" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}>{error}</div>}
        <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: '0.9rem' }}>
          Cuéntanos qué día u horario prefieres para tu cita de <strong>{appointment.serviceName}</strong>.
          La barbería revisará tu solicitud y reprogramará la cita.
        </p>
        <div className="form-field">
          <label htmlFor="note">Horario preferido / comentarios</label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej. Prefiero el viernes por la tarde"
            required
          />
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--accent" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default RescheduleModal;
