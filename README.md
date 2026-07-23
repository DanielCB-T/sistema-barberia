# BarberShop — Sistema de Gestión y Citas

Un sistema web completo para la reserva de citas y gestión administrativa de una barbería. Incluye autenticación de usuarios, panel de control para clientes, módulo administrativo para el barbero/administrador y un flujo de pagos y notificaciones simulado.

> **Nota sobre el estado actual:** La aplicación frontend está 100% operativa e integrada a una capa de API simulada (mockApi.js) con persistencia en localStorage. Está lista para conectarse a un backend real (Node.js, Python, Firebase, Supabase, etc.) sin modificar la interfaz ni las rutas.

---

## Cuentas de Prueba

Puedes probar el sistema usando las siguientes credenciales preconfiguradas:

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | admin@barberia.com | admin123 |
| **Cliente** | user@barberia.com | user123 |

> También puedes crear un usuario nuevo desde la pantalla de Registro o utilizar la simulación de Ingreso con Google.

---

## Características Principales

### Módulo del Cliente (/dashboard)
* **Autenticación:** Login, registro completo (con fecha de nacimiento y sucursal preferida) e inicio de sesión con Google (simulado).
* **Gestión de Citas:** Agendamiento de servicios, opción de pago anticipado y consulta de estado.
* **Flexibilidad de Agenda:** Cancelación de citas y solicitud de reagendación (sujeto a políticas de tiempo).
* **Catálogos Interactivos:** Exploración de servicios, productos, sucursales y noticias de la barbería.
* **Perfil:** Configuración de datos personales y preferencias de la cuenta.

### Módulo de Administración (/admin)
* **Control Central de Citas:** Panel principal con vista global de todas las citas y filtros por estado/fecha.
* **Gestión Operativa:** Aceptación de citas (pasan a "Confirmadas") o posposición con reasignación de fecha y motivo.
* **Alertas Automáticas:** Simulación de envío de notificaciones automáticas al cliente cuando el estado de su cita cambia.
* **Ajustes de Administrador:** Gestión del perfil administrativo.

---

## Reglas de Negocio Implementadas

- **Política de Cancelación/Reagendación:** El cliente solo puede cancelar o solicitar reagendar si faltan 3 horas o más para la cita (src/api/mockApi.js).
- **Confirmación y Posposición:** Al aceptar una cita o moverla de fecha con un motivo, el sistema dispara un aviso directo (simulación de bot) al teléfono del cliente.
- **Flujo de Pago en Línea:** Al agendar, el usuario puede marcar la opción de pago digital, ejecutando una pasarela simulada antes de confirmar la reserva.

---

## Instalación y Uso Local

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

```bash
# 1. Clonar el repositorio
git clone [https://github.com/tu-usuario/barberia-react-vite.git](https://github.com/tu-usuario/barberia-react-vite.git)

# 2. Entrar al directorio del proyecto
cd barberia-react-vite

# 3. Instalar dependencias
npm install

# 4. Iniciar el servidor de desarrollo
npm run dev
