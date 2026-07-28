// src/Pages/SettingsPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validarLongitud } from '../utils/utileria';

function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { push } = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    birthdate: user?.birthdate || '',
  });
  const [saving, setSaving] = useState(false);

  const [pwdForm, setPwdForm] = useState({ currentPassword: '', password: '', confirmPassword: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [changingPwd, setChangingPwd] = useState(false);

  const [notifyWhatsapp, setNotifyWhatsapp] = useState(user?.notifyWhatsapp ?? true);
  const [savingNotify, setSavingNotify] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setPwd = (key) => (e) => setPwdForm((f) => ({ ...f, [key]: e.target.value }));

  const canChangePassword = user?.provider === 'local';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    push('Tus datos se actualizaron correctamente.', 'success');
  };

  const validarPassword = () => {
    const errs = {};
    if (!pwdForm.currentPassword) errs.currentPassword = 'Ingresa tu contraseña actual.';
    if (!validarLongitud(pwdForm.password, 40) || pwdForm.password.length < 6) {
      errs.password = 'La nueva contraseña debe tener al menos 6 caracteres.';
    }
    if (pwdForm.confirmPassword !== pwdForm.password) {
      errs.confirmPassword = 'Las contraseñas no coinciden.';
    }
    setPwdErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validarPassword()) return;
    setChangingPwd(true);
    const res = await updateProfile({
      currentPassword: pwdForm.currentPassword,
      password: pwdForm.password,
    });
    setChangingPwd(false);
    if (!res.ok) {
      setPwdErrors({ currentPassword: res.error });
      return;
    }
    setPwdForm({ currentPassword: '', password: '', confirmPassword: '' });
    push('Tu contraseña se actualizó correctamente.', 'success');
  };

  const handleToggleNotify = async (e) => {
    const value = e.target.checked;
    setNotifyWhatsapp(value);
    setSavingNotify(true);
    const res = await updateProfile({ notifyWhatsapp: value });
    setSavingNotify(false);
    if (!res.ok) {
      setNotifyWhatsapp(!value); // revertir si falló
      push('No se pudo actualizar tu preferencia de notificaciones.', 'error');
      return;
    }
    push('Preferencia de notificaciones actualizada.', 'success');
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

        {canChangePassword && (
          <form className="settings-card" onSubmit={handleChangePassword}>
            <h3>Cambiar contraseña</h3>
            <div className="plain-field">
              <label>Contraseña actual</label>
              <input type="password" value={pwdForm.currentPassword} onChange={setPwd('currentPassword')} />
              {pwdErrors.currentPassword && <div className="field-error">{pwdErrors.currentPassword}</div>}
            </div>
            <div className="plain-field">
              <label>Nueva contraseña</label>
              <input type="password" value={pwdForm.password} onChange={setPwd('password')} />
              {pwdErrors.password && <div className="field-error">{pwdErrors.password}</div>}
            </div>
            <div className="plain-field">
              <label>Confirmar nueva contraseña</label>
              <input type="password" value={pwdForm.confirmPassword} onChange={setPwd('confirmPassword')} />
              {pwdErrors.confirmPassword && <div className="field-error">{pwdErrors.confirmPassword}</div>}
            </div>
            <button className="btn btn--primary" type="submit" disabled={changingPwd}>
              {changingPwd ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </form>
        )}

        <div className="settings-card">
          <h3>Notificaciones</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 14 }}>
            {user?.role === 'admin'
              ? 'Cuando aceptas o pospones una cita, el sistema avisa automáticamente al cliente por WhatsApp/SMS.'
              : 'Te avisaremos por WhatsApp cuando tu cita sea confirmada, pospuesta o si necesitamos reprogramarla.'}
          </p>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.88rem' }}>
            <input
              type="checkbox"
              checked={notifyWhatsapp}
              onChange={handleToggleNotify}
              disabled={savingNotify}
            />
            Recibir avisos por WhatsApp
          </label>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
