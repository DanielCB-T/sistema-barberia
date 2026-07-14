// src/components/GoogleAuthButton.jsx
//
// Botón de "Ingresar/Registrarse con Google".
// Esta versión simula el flujo para que el resto de la app (rutas, sesión,
// roles) funcione de punta a punta sin backend.
//
// >>> Para integrar Google real <<<
// 1) npm install @react-oauth/google
// 2) Envuelve la app en <GoogleOAuthProvider clientId="TU_CLIENT_ID">
// 3) Sustituye el botón por <GoogleLogin onSuccess={...} onError={...} />
// 4) Envía el credential (id_token) a tu backend para verificarlo y crear
//    la sesión real (auth.loginWithGoogle en mockApi.js es el lugar a reemplazar).

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function GoogleAuthButton({ label = 'Ingrese con Google' }) {
  const { loginWithGoogle } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (!res.ok) {
      push('No se pudo iniciar sesión con Google.', 'error');
      return;
    }
    push(`Sesión iniciada como ${res.user.name}`, 'success');
    navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <button type="button" className="google-btn" onClick={handleClick} disabled={loading}>
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.4 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.4 5.1 29.5 3 24 3 16.1 3 9.3 7.6 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 45c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.4 35.9 26.8 37 24 37c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.2 40.3 16 45 24 45z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.3 5.3C40.9 36.6 44 30.9 44 24c0-1.2-.1-2.4-.4-3.5z"
        />
      </svg>
      {loading ? 'Conectando...' : label}
    </button>
  );
}

export default GoogleAuthButton;
