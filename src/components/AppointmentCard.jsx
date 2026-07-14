// src/components/AppointmentCard.jsx
import { Clock, MapPin } from 'lucide-react';

function hoursUntil(dateTime) {
  return (new Date(dateTime).getTime() - Date.now()) / 3600000;
}

const statusLabels = {
  pendiente: 'Pendiente de confirmación',
  confirmada: 'Confirmada',
  pospuesta: 'Pospuesta por la barbería',
  cancelada: 'Cancelada',
  reagendacion_solicitada: 'Reagendación solicitada',
};

const branchNames = { 'br-1': 'Barbería Centro', 'br-2': 'Barbería Reforma' };

function AppointmentCard({ appointment, onCancel, onRequestReschedule }) {
  const canModify = hoursUntil(appointment.dateTime) >= 3;
  const isFinal = appointment.status === 'cancelada';

  return (
    <div className="appt-card">
      <div className="appt-card__time">
        <Clock size={16} />
        {new Date(appointment.dateTime).toLocaleString('es-MX', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      <div>
        <div className="appt-card__name">{appointment.serviceName}</div>
        <div className="appt-card__service">
          <MapPin size={13} style={{ verticalAlign: -2 }} /> {branchNames[appointment.branchId] || 'Sucursal'}
        </div>
      </div>
      <span className={`badge badge--${appointment.status}`}>{statusLabels[appointment.status]}</span>

      {!isFinal && (
        <div className="appt-card__footer">
          {!canModify && (
            <span style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
              Ya no se puede modificar (menos de 3h de anticipación)
            </span>
          )}
          {canModify && (
            <div className="appt-card__actions">
              <button className="btn btn--ghost btn--sm" onClick={() => onRequestReschedule(appointment)}>
                Solicitar reagendación
              </button>
              <button className="btn btn--danger btn--sm" onClick={() => onCancel(appointment)}>
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AppointmentCard;
