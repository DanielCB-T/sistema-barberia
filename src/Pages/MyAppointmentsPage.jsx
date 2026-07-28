// src/Pages/MyAppointmentsPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { appointments as appointmentsApi } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AppointmentCard from '../components/AppointmentCard';
import BookingModal from '../components/BookingModal';
import RescheduleModal from '../components/RescheduleModal';
import ConfirmModal from '../components/ConfirmModal';

function MyAppointmentsPage() {
  const { user } = useAuth();
  const { push } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [reschedTarget, setReschedTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    appointmentsApi.listForClient(user.id).then((data) => {
      setList(data);
      setLoading(false);
    });
  }, [user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async () => {
    const res = await appointmentsApi.cancel(cancelTarget.id);
    if (!res.ok) {
      push(res.error, 'error');
    } else {
      push('Cita cancelada.', 'success');
      load();
    }
    setCancelTarget(null);
  };

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Mis citas</h1>
        <button className="btn btn--accent" onClick={() => setShowBooking(true)}>
          <Plus size={18} /> Agendar cita
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Cargando tus citas...</p>
      ) : list.length === 0 ? (
        <div className="empty-state">
          <h3>Aún no tienes citas</h3>
          <p>Agenda tu primera cita con el botón de arriba.</p>
        </div>
      ) : (
        <div className="appt-grid">
          {list.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              onCancel={setCancelTarget}
              onRequestReschedule={setReschedTarget}
            />
          ))}
        </div>
      )}

      {showBooking && (
        <BookingModal
          onClose={() => setShowBooking(false)}
          onBooked={() => {
            setShowBooking(false);
            load();
          }}
        />
      )}

      {reschedTarget && (
        <RescheduleModal
          appointment={reschedTarget}
          onClose={() => setReschedTarget(null)}
          onDone={load}
        />
      )}

      {cancelTarget && (
        <ConfirmModal
          title="Cancelar cita"
          message={`¿Seguro que quieres cancelar tu cita de ${cancelTarget.serviceName}? Recuerda que solo puedes cancelar con al menos 3 horas de anticipación.`}
          confirmLabel="Sí, cancelar"
          danger
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}

export default MyAppointmentsPage;
