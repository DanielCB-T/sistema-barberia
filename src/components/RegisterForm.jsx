// src/components/RegisterForm.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GoogleAuthButton from './GoogleAuthButton';
import {
  validarCorreo,
  soloLetras,
  validarLongitud,
  validarTelefono,
  validarPassword,
  esMayorDeEdad,
} from '../utils/utileria';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  birthdate: '',
  password: '',
  confirmPassword: '',
  // Campos adicionales útiles para una barbería:
  preferredBranch: '',
  notifyByWhatsapp: true,
};

function RegisterForm() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !soloLetras(form.name.trim())) {
      setError('El nombre solo debe contener letras y espacios.');
      return;
    }
    if (!validarLongitud(form.name, 80)) {
      setError('El nombre no puede tener más de 80 caracteres.');
      return;
    }
    if (!validarCorreo(form.email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!validarTelefono(form.phone)) {
      setError('El teléfono debe tener 10 dígitos, por ejemplo 9511234567.');
      return;
    }
    if (!form.birthdate) {
      setError('Ingresa tu fecha de nacimiento.');
      return;
    }
    if (!esMayorDeEdad(form.birthdate)) {
      setError('Debes ser mayor de edad para registrarte.');
      return;
    }
    if (!validarPassword(form.password)) {
      setError(
        'La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial.'
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    push(`¡Bienvenido, ${res.user.name.split(' ')[0]}! Tu cuenta fue creada.`, 'success');
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="field">
        <label htmlFor="name">Nombre completo</label>
        <input id="name" value={form.name} onChange={set('name')} placeholder="Tu nombre" required />
      </div>

      <div className="field">
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="tucorreo@ejemplo.com"
          required
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="phone">Número telefónico</label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="9511234567"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="birthdate">Fecha de nacimiento</label>
          <input id="birthdate" type="date" value={form.birthdate} onChange={set('birthdate')} required />
        </div>
      </div>

      <div className="field">
        <label htmlFor="preferredBranch">Sucursal de preferencia</label>
        <select id="preferredBranch" value={form.preferredBranch} onChange={set('preferredBranch')}>
          <option value="">Sin preferencia</option>
          <option value="br-1">Barbería Centro</option>
          <option value="br-2">Barbería Reforma</option>
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" value={form.password} onChange={set('password')} required />
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            required
          />
        </div>
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.85rem',
          marginBottom: 22,
          color: 'rgba(250,248,244,0.8)',
        }}
      >
        <input type="checkbox" checked={form.notifyByWhatsapp} onChange={set('notifyByWhatsapp')} />
        Avísame por WhatsApp sobre confirmaciones y cambios en mis citas
      </label>

      <button className="btn btn--accent btn--block" type="submit" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <div className="auth-divider">o</div>
      <GoogleAuthButton label="Regístrate con Google" />

      <p className="auth-footer">
        ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
      </p>
    </form>
  );
}

export default RegisterForm;
