// src/components/Logo.jsx
//
// Logo de la barbería. Por ahora es un ícono genérico (navaja + tijera).
// Para usar tu propio logo, reemplaza el <svg> por:
//   <img src="/mi-logo.png" alt="Logo de la barbería" style={{ width: size, height: size }} />
// colocando el archivo en /public.

import logoImg from '/barbonSinFondoBlanco.png';

function Logo({ size = 40 }) {
  return (
    <img 
      src={logoImg} 
      alt="Logo barberia" 
      style={{ width: size, height: size + (size / 5) }} 
    />
  );
}

export default Logo;