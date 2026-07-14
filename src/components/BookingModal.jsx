// src/components/BookingModal.jsx
import { useEffect, useState } from 'react';
import Modal from './Modal';
import { catalog, appointments, payments } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function nextValidDatetimeLocal() {
  const d = new Date(Date.now() + 3 * 3600000);
  d.setMinutes(0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
}

function BookingModal({ onClose, onBooked, preselectedService }) {
  const { user } = useAuth();
  const { push } = useToast();
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [serviceId, setServiceId] = useState(preselectedService?.id || '');
  const [branchId, setBranchId] = useState('');
  const [dateTime, setDateTime] = useState(nextValidDatetimeLocal());
  const [payOnline, setPayOnline] = useState(false);
  const [step, setStep] = useState('form'); // form | paying | done
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    catalog.listServices().then((list) => {
      setServices(list);
      if (!serviceId && list[0]) setServiceId(list[0].id);
    });
    catalog.listBranches().then((list) => {
      setBranches(list);
      if (list[0]) setBranchId(list[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedService = services.find((s) => s.id === serviceId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedService) return;

    setSubmitting(true);

    if (payOnline) {
      setStep('paying');
      const payRes = await payments.createCheckout({
        amount: selectedService.price,
        concept: selectedService.name,
      });
      if (!payRes.ok) {
        setError(payRes.error);
        setStep('form');
        setSubmitting(false);
        return;
      }
      setReceipt(payRes.receipt);
    }

    const res = await appointments.create({
      clientId: user.id,
      clientName: user.name,
      clientPhone: user.phone,
      service: selectedService,
      branchId,
      dateTime: new Date(dateTime).toISOString(),
    });

    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      setStep('form');
      return;
    }
    setStep('done');
    push('Tu cita fue registrada y está pendiente de confirmación.', 'success');
    onBooked?.(res.appointment);
  };

  if (step === 'done') {
    return (
      <Modal title="¡Cita agendada!" onClose={onClose}>
        <p style={{ color: 'var(--muted)', marginBottom: 12 }}>
          Registramos tu cita de <strong>{selectedService?.name}</strong> para el{' '}
          {new Date(dateTime).toLocaleString('es-MX')}. Te avisaremos por WhatsApp en cuanto la barbería la
          confirme.
        </p>
        {receipt && (
          <div className="receipt-box">
            Pago recibido: ${receipt.amount.toFixed(2)} · {receipt.method}
          </div>
        )}
        <div className="modal__footer">
          <button className="btn btn--primary" onClick={onClose}>
            Listo
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Agendar cita" onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}>{error}</div>}

        <div className="form-field">
          <label>Servicio</label>
          <div className="service-pick-grid">
            {services.map((s) => (
              <button
                type="button"
                key={s.id}
                className={`service-pick ${serviceId === s.id ? 'active' : ''}`}
                onClick={() => setServiceId(s.id)}
              >
                <strong>{s.name}</strong>
                <span>
                  ${s.price.toFixed(2)} · {s.duration} min
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="branch">Sucursal</label>
          <select id="branch" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="datetime">Fecha y hora</label>
          <input
            id="datetime"
            type="datetime-local"
            value={dateTime}
            min={nextValidDatetimeLocal()}
            onChange={(e) => setDateTime(e.target.value)}
            required
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
          <input type="checkbox" checked={payOnline} onChange={(e) => setPayOnline(e.target.checked)} />
          Pagar en línea (${selectedService?.price.toFixed(2) || '0.00'})
        </label>

        <div className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--accent" disabled={submitting}>
            {step === 'paying' ? 'Procesando pago...' : submitting ? 'Guardando...' : 'Confirmar cita'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default BookingModal;
