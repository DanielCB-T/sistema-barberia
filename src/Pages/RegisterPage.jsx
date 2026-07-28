// src/Pages/RegisterPage.jsx
import Logo from '../components/Logo';
import RegisterForm from '../components/RegisterForm';

function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-page__pattern" />
      <div className="auth-card auth-card--wide">
        <div className="auth-card__logo">
          <Logo size={64} />
        </div>
        <h1>Crear cuenta</h1>
        <RegisterForm />
      </div>
    </div>
  );
}

export default RegisterPage;
