// src/components/AdminAppointmentCard.jsx
import { Clock } from 'lucide-react';

function formatRange(dateTime, duration) {
  const start = new Date(dateTime);
  const end = new Date(start.getTime() + duration * 60000);
  const fmt = (d) => d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${fmt(start)} - ${fmt(end)}`;
}

function AdminAppointmentCard({ appointment }) {
  return (
    <div className="appt-card">
      <div className="appt-card__time">
        <Clock size={16} />
        {formatRange(appointment.dateTime, appointment.duration)}
      </div>
      <div className="appt-card__person">
        <img
          className="appt-card__avatar"
          src={`https://i.pravatar.cc/100?u=${appointment.clientId}`}
          alt={appointment.clientName}
        />
        <div>
          <div className="appt-card__name">{appointment.clientName}</div>
          <div className="appt-card__service">{appointment.serviceName}</div>
        </div>
      </div>
      <span className={`badge badge--${appointment.status}`}>{appointment.status.replace('_', ' ')}</span>
    </div>
  );
}

export default AdminAppointmentCard;
