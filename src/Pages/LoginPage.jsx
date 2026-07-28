// src/Pages/LoginPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-page__pattern" />
      <div className="auth-card">
        <div className="auth-card__logo">
          <Logo size={64} />
        </div>
        <h1>Iniciar sesión</h1>
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
