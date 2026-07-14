// src/components/Logo.jsx
//
// Logo de la barbería. Por ahora es un ícono genérico (navaja + tijera).
// Para usar tu propio logo, reemplaza el <svg> por:
//   <img src="/mi-logo.png" alt="Logo de la barbería" style={{ width: size, height: size }} />
// colocando el archivo en /public.

function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo de la barbería"
    >
      <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <path
        d="M14 15c4-3 8-3 10 0s6 3 10 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 22c3 8 6 12 12 12s9-4 12-12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="19" cy="21" r="1.8" fill="currentColor" />
      <circle cx="29" cy="21" r="1.8" fill="currentColor" />
      <path
        d="M17 30c2 2.5 4.5 4 7 4s5-1.5 7-4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default Logo;
