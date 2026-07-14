// src/Pages/SettingsPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { push } = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    birthdate: user?.birthdate || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    push('Tus datos se actualizaron correctamente.', 'success');
  };

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Ajustes</h1>
      </div>

      <div className="settings-grid">
        <form className="settings-card" onSubmit={handleSave}>
          <h3>Datos de la cuenta</h3>
          <div className="plain-field">
            <label>Nombre</label>
            <input value={form.name} onChange={set('name')} />
          </div>
          <div className="plain-field">
            <label>Correo electrónico</label>
            <input value={user?.email || ''} disabled />
          </div>
          <div className="plain-field">
            <label>Número telefónico</label>
            <input value={form.phone} onChange={set('phone')} />
          </div>
          <div className="plain-field">
            <label>Fecha de nacimiento</label>
            <input type="date" value={form.birthdate} onChange={set('birthdate')} />
          </div>
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <div className="settings-card">
          <h3>Notificaciones</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 14 }}>
            {user?.role === 'admin'
              ? 'Cuando aceptas o pospones una cita, el sistema avisa automáticamente al cliente por WhatsApp/SMS.'
              : 'Te avisaremos por WhatsApp cuando tu cita sea confirmada, pospuesta o si necesitamos reprogramarla.'}
          </p>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.88rem' }}>
            <input type="checkbox" defaultChecked /> Recibir avisos por WhatsApp
          </label>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
