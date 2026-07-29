// src/Pages/SettingsPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validarPassword } from '../utils/utileria';
import ImageUploader from '../components/ImageUploader';

function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { push } = useToast();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    birthdate: user?.birthdate || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [changingPwd, setChangingPwd] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setPwdField = (key) => (e) => {
    setPwd((p) => ({ ...p, [key]: e.target.value }));
    setPwdErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile({ ...form, avatarFile });
    setSaving(false);
    if (res && res.ok === false) {
      push(res.error || 'No se pudieron actualizar tus datos.', 'error');
      return;
    }
    push('Tus datos se actualizaron correctamente.', 'success');
  };

  const validarPwdForm = () => {
    const errs = {};
    if (!pwd.current) errs.current = 'Ingresa tu contraseña actual.';
    if (!validarPassword(pwd.next)) {
      errs.next =
        'La nueva contraseña debe tener 8+ caracteres, mayúscula, minúscula, número y carácter especial.';
    }
    if (pwd.next !== pwd.confirm) errs.confirm = 'Las contraseñas no coinciden.';
    setPwdErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validarPwdForm()) return;

    setChangingPwd(true);
    const res = await changePassword({
      currentPassword: pwd.current,
      password: pwd.next,
      confirmPassword: pwd.confirm,
    });
    setChangingPwd(false);

    if (!res.ok) {
      push(res.error || 'No se pudo cambiar la contraseña.', 'error');
      return;
    }
    setPwd({ current: '', next: '', confirm: '' });
    push('Tu contraseña se actualizó correctamente.', 'success');
  };

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Ajustes</h1>
      </div>

      <div className="settings-grid">
        <form className="settings-card" onSubmit={handleSave}>
          <h3>Datos de la cuenta</h3>
          <ImageUploader label="Foto de perfil" currentUrl={user?.avatar} onChange={setAvatarFile} />
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

        <form className="settings-card" onSubmit={handleChangePassword}>
          <h3>Cambiar contraseña</h3>
          <div className="plain-field">
            <label>Contraseña actual</label>
            <input type="password" value={pwd.current} onChange={setPwdField('current')} />
            {pwdErrors.current && <div className="field-error">{pwdErrors.current}</div>}
          </div>
          <div className="plain-field">
            <label>Nueva contraseña</label>
            <input type="password" value={pwd.next} onChange={setPwdField('next')} />
            {pwdErrors.next && <div className="field-error">{pwdErrors.next}</div>}
          </div>
          <div className="plain-field">
            <label>Confirmar nueva contraseña</label>
            <input type="password" value={pwd.confirm} onChange={setPwdField('confirm')} />
            {pwdErrors.confirm && <div className="field-error">{pwdErrors.confirm}</div>}
          </div>
          <button className="btn btn--primary" type="submit" disabled={changingPwd}>
            {changingPwd ? 'Actualizando...' : 'Cambiar contraseña'}
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
