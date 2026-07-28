// src/Pages/AdminClientPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Clock } from 'lucide-react';
import { clients } from '../api/mockApi';

function formatRange(dateTime, duration) {
  const start = new Date(dateTime);
  const end = new Date(start.getTime() + duration * 60000);
  const fmt = (d) => d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${start.toLocaleDateString('es-MX')} · ${fmt(start)} - ${fmt(end)}`;
}

function AdminClientPage() {
  const { id } = useParams();
  const [data, setData] = useState(undefined); // undefined = cargando, null = no encontrado
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    clients.getHistory(id).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [id]);

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Ficha del cliente</h1>
      </div>

      <Link to="/admin/gestion-citas" className="btn btn--ghost btn--sm" style={{ marginBottom: 18 }}>
        <ArrowLeft size={16} /> Volver a citas
      </Link>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Cargando cliente...</p>
      ) : !data ? (
        <div className="empty-state">
          <h3>No encontramos a este cliente</h3>
          <p>Puede que no tenga ninguna cita registrada todavía.</p>
        </div>
      ) : (
        <>
          <div className="client-profile">
            <img
              className="client-profile__avatar"
              src={data.client.avatar || `https://i.pravatar.cc/100?u=${data.client.id}`}
              alt={data.client.name}
            />
            <div>
              <div className="client-profile__name">
                {data.client.name}
                {!data.client.registered && <span className="badge badge--pendiente">Sin cuenta</span>}
              </div>
              <div className="client-profile__meta">
                {data.client.phone && (
                  <span>
                    <Phone size={14} /> {data.client.phone}
                  </span>
                )}
                {data.client.email && (
                  <span>
                    <Mail size={14} /> {data.client.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <h2 className="content__subtitle">Historial de citas ({data.appointments.length})</h2>

          {data.appointments.length === 0 ? (
            <div className="empty-state">
              <h3>Sin citas registradas</h3>
              <p>Este cliente todavía no tiene citas.</p>
            </div>
          ) : (
            <div className="appt-grid">
              {data.appointments.map((a) => (
                <div className="appt-card" key={a.id}>
                  <div className="appt-card__time">
                    <Clock size={16} />
                    {formatRange(a.dateTime, a.duration)}
                  </div>
                  <div className="appt-card__service">
                    {a.serviceName}
                    {a.barberName ? ` · ${a.barberName}` : ''}
                  </div>
                  <span className={`badge badge--${a.status}`}>{a.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminClientPage;
