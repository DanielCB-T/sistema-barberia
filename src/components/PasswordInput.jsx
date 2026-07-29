// src/components/PasswordInput.jsx
//
// Campo de contraseña reutilizable con botón "ojo" para mostrar/ocultar.
// Reemplaza a <input type="password"> en Login, Registro, Ajustes (cambiar
// contraseña) y el alta de barberos, sin repetir la lógica del toggle.
//
// Conserva el diseño existente: acepta las mismas props que un <input>
// normal (id, value, onChange, onBlur, placeholder, required, className...)
// y solo añade el botón sobrepuesto a la derecha.
import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function PasswordInput({ className, style, ...rest }) {
  const [visible, setVisible] = useState(false);
  const autoId = useId();
  const inputId = rest.id || autoId;

  return (
    <div style={{ position: 'relative', display: 'block', width: '100%' }}>
      <input
        {...rest}
        id={inputId}
        type={visible ? 'text' : 'password'}
        className={className}
        // Deja espacio a la derecha para que el texto no quede bajo el ícono.
        style={{ ...style, paddingRight: 42, width: '100%' }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        tabIndex={-1}
        style={{
          position: 'absolute',
          top: '50%',
          right: 8,
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          padding: 4,
          cursor: 'pointer',
          color: 'inherit',
          opacity: 0.65,
          lineHeight: 0,
        }}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default PasswordInput;
