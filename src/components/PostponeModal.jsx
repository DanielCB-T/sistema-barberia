// src/components/PostponeModal.jsx
import { useState } from 'react';
import Modal from './Modal';
import { appointments } from '../api/mockApi';
import { useToast } from '../context/ToastContext';
import { MessageCircle } from 'lucide-react';

function toLocalInputValue(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function PostponeModal({ appointment, onClose, onDone }) {
  const [newDateTime, setNewDateTime] = useState(toLocalInputValue(appointment.dateTime));
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { push } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await appointments.postpone(appointment.id, {
      newDateTime: new Date(newDateTime).toISOString(),
      reason,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    push(`Cita pospuesta. Se notificó a ${appointment.clientName} por WhatsApp.`, 'success');
    onDone?.(res.appointment);
    onClose();
  };

  return (
    <Modal title="Posponer cita" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}>{error}</div>}
        <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: '0.9rem' }}>
          Cita de <strong>{appointment.clientName}</strong> — {appointment.serviceName}
        </p>
        <div className="form-field">
          <label htmlFor="newDateTime">Nueva fecha y hora</label>
          <input
            id="newDateTime"
            type="datetime-local"
            value={newDateTime}
            onChange={(e) => setNewDateTime(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="reason">Motivo (se incluirá en el aviso)</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. El barbero tuvo una emergencia"
            required
          />
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            fontSize: '0.82rem',
            color: 'var(--muted)',
            marginBottom: 6,
          }}
        >
          <MessageCircle size={16} />
          Se enviará un aviso automático al {appointment.clientPhone}
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--accent" disabled={submitting}>
            {submitting ? 'Enviando aviso...' : 'Posponer y notificar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PostponeModal;
