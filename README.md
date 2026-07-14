# Sistema de Barbería — React + Vite

Sistema de citas para barbería con login, dashboard de cliente, panel de
administrador y gestión completa de citas.

## Cómo correrlo

```bash
npm install
npm run dev
```

Cuentas de prueba:
- **Administrador:** admin@barberia.com / admin123
- **Cliente:** user@barberia.com / user123

También puedes registrarte como cliente nuevo desde "Regístrate", o usar el
botón "Ingresar/Registrarse con Google" (simulado, ver notas abajo).

## Estructura

```
src/
  api/            -> "Backend" simulado (localStorage) + datos de ejemplo
  context/        -> Sesión (AuthContext) y notificaciones (ToastContext)
  components/     -> Piezas reutilizables (Navbar, sidebars, tarjetas, modales, formularios)
  Pages/          -> Una página por ruta, arma los componentes de arriba
```

Cada página (`Pages/`) se compone de componentes de `components/`, para que
puedas reutilizarlos o modificarlos sin duplicar código.

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Login |
| `/registro` | Registro de cliente (nombre, correo, teléfono, fecha de nacimiento, sucursal preferida) |
| `/dashboard` | Inicio del cliente (hero + servicios) |
| `/dashboard/mis-citas` | Agendar, cancelar (hasta 3h antes) y solicitar reagendación |
| `/dashboard/servicios` `/productos` `/sucursales` `/noticias` | Catálogos |
| `/dashboard/ajustes` | Datos de la cuenta |
| `/admin` | Panel principal del administrador (todas las citas, filtros) |
| `/admin/gestion-citas` | Aceptar o posponer citas (notifica al cliente) |
| `/admin/ajustes` | Datos de la cuenta del administrador |

## Reglas de negocio implementadas

- El cliente puede **cancelar** o **solicitar reagendación** solo con **3+
  horas** de anticipación (`src/api/mockApi.js`, funciones `cancel` y
  `requestReschedule`).
- El administrador puede **aceptar** una cita (pasa a "confirmada") o
  **posponerla** indicando nueva fecha y motivo; en ambos casos se dispara
  un aviso automático simulado ("bot") al teléfono del cliente.
- Al agendar, se puede marcar **"Pagar en línea"**, lo que simula un cobro
  antes de crear la cita.

## Dónde conectar servicios reales

Todo vive en `src/api/mockApi.js`, con comentarios `>>> Reemplazar por... <<<`
en cada punto de integración:

1. **Login con Google** (`auth.loginWithGoogle`): reemplazar por
   `@react-oauth/google` (Google Identity Services) y verificar el
   `id_token` en tu backend.
2. **Pagos en línea** (`payments.createCheckout`): reemplazar por Stripe o
   Mercado Pago (crear un PaymentIntent/preferencia en tu backend y
   confirmar desde el cliente).
3. **Bot de notificaciones** (`sendBotNotification`): reemplazar por una
   llamada a Twilio, la API de WhatsApp Business, o el proveedor de SMS que
   uses, siempre desde tu backend (nunca con credenciales en el frontend).

El resto de la app (componentes, páginas, rutas) no necesita cambios: solo
llaman a las funciones exportadas de `mockApi.js`.

## Personalizar el logo

Edita `src/components/Logo.jsx`. Ahí mismo hay instrucciones para cambiar el
`<svg>` por tu propia imagen (`<img src="/mi-logo.png" />`), colocando el
archivo en `public/`.

## Imágenes de ejemplo

Las fotos de servicios, productos, sucursales, noticias y el hero vienen de
Unsplash como placeholder — reemplázalas por las tuyas en
`src/api/seedData.js` (servicios/productos/sucursales/noticias) y en
`src/Pages/DashboardPage.jsx` (`HERO_IMAGE`).
