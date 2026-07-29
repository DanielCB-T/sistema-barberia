// src/components/LoginForm.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validarCorreo, validarLongitud } from '../utils/utileria';
import PasswordInput from './PasswordInput';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Cuando el backend responde 403 (correo sin verificar) mostramos la
  // opción de reenviar el correo de verificación.
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const { login, resendVerification } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  // Validaciones de campo usando utileria.js antes de llamar a la API
  const validar = () => {
    const errores = {};

    if (!email.trim()) {
      errores.email = 'El correo es obligatorio.';
    } else if (!validarCorreo(email.trim())) {
      errores.email = 'Ingresa un correo electrónico válido.';
    }

    if (!password) {
      errores.password = 'La contraseña es obligatoria.';
    } else if (!validarLongitud(password, 50)) {
      errores.password = 'La contraseña no puede tener más de 50 caracteres.';
    }

    setFieldErrors(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    if (!validar()) return;

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      setNeedsVerification(Boolean(res.needsVerification));
      return;
    }
    push(`Bienvenido de vuelta, ${res.user.name.split(' ')[0]}`, 'success');
    navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
  };

  const handleResend = async () => {
    setResending(true);
    const res = await resendVerification(email.trim());
    setResending(false);
    if (res.ok) {
      push(res.message || 'Te reenviamos el correo de verificación.', 'success');
    } else {
      push(res.error || 'No se pudo reenviar el correo.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="form-error">{error}</div>}
      {needsVerification && (
        <div className="form-error" style={{ background: 'rgba(255,255,255,0.06)' }}>
          ¿No recibiste el correo?{' '}
          <button
            type="button"
            className="link-btn"
            onClick={handleResend}
            disabled={resending}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--rust-500)',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {resending ? 'Reenviando...' : 'Reenviar verificación'}
          </button>
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
          }}
          onBlur={validar}
        />
        {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
      </div>
      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <PasswordInput
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
          }}
          onBlur={validar}
        />
        {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
      </div>
      <button className="btn btn--accent btn--block" type="submit" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>

      <p className="auth-footer">
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>
    </form>
  );
}

export default LoginForm;
