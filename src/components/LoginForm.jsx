// src/components/LoginForm.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validarLongitud } from '../utils/utileria';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  // Validaciones de campo usando utileria.js antes de llamar a la API
  const validar = () => {
    const errores = {};

    if (!username.trim()) {
      errores.username = 'El usuario es obligatorio.';
    } else if (!validarLongitud(username, 50)) {
      errores.username = 'El usuario no puede tener más de 50 caracteres.';
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
    if (!validar()) return;

    setLoading(true);
    const res = await login(username.trim(), password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    push(`Bienvenido de vuelta, ${res.user.name.split(' ')[0]}`, 'success');
    navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="form-error">{error}</div>}
      <div className="field">
        <label htmlFor="username">Usuario</label>
        <input
          id="username"
          type="text"
          placeholder="emilys"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {fieldErrors.username && <div className="field-error">{fieldErrors.username}</div>}
      </div>
      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
      </div>
      <button className="btn btn--accent btn--block" type="submit" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>

      <p className="auth-footer">
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>
      <p className="auth-footer" style={{ fontSize: '0.76rem', opacity: 0.7 }}>
        Inicia sesión con un usuario de prueba de DummyJSON, por ejemplo{' '}
        <strong>emilys / emilyspass</strong>. Más usuarios en{' '}
        <a href="https://dummyjson.com/users" target="_blank" rel="noreferrer">
          dummyjson.com/users
        </a>
        .
      </p>
    </form>
  );
}

export default LoginForm;
