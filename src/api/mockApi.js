// src/api/mockApi.js
//
// Capa de datos simulada. Imita el comportamiento de una API REST real
// (con latencia de red y persistencia) usando localStorage.
//
// >>> PARA CONECTAR UN BACKEND REAL <<<
// Sustituye el cuerpo de cada función por un `fetch('/api/...')` hacia tu
// servidor. Las firmas (parámetros y forma de la respuesta) ya están
// pensadas para eso, así que los componentes no necesitan cambiar.
//
// Integraciones marcadas para reemplazo:
//  - loginWithGoogle()      -> Google Identity Services / OAuth2 (@react-oauth/google)
//  - createPaymentIntent()  -> Pasarela de pago real (Stripe / Mercado Pago)
//  - sendBotNotification()  -> API de WhatsApp/SMS (Twilio, Meta Cloud API, etc.)

import {
  seedServices,
  seedProducts,
  seedBranches,
  seedNews,
  seedUsers,
  seedAppointments,
} from './seedData';

const DB_KEY = 'barberia_db_v1';
const SESSION_KEY = 'barberia_session_v1';

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return JSON.parse(raw);
  const initial = {
    users: seedUsers,
    services: seedServices,
    products: seedProducts,
    branches: seedBranches,
    news: seedNews,
    appointments: seedAppointments,
    botLog: [],
  };
  localStorage.setItem(DB_KEY, JSON.stringify(initial));
  return initial;
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Simula latencia de red
function delay(data, ms = 450) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// ---------------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------------

export const auth = {
  async register({ name, email, phone, birthdate, password }) {
    const db = loadDB();
    const exists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return delay({ ok: false, error: 'Ya existe una cuenta con ese correo.' });
    }
    const user = {
      id: uid('client'),
      name,
      email,
      phone,
      birthdate,
      password,
      role: 'client',
      provider: 'local',
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
    };
    db.users.push(user);
    saveDB(db);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return delay({ ok: true, user });
  },

  async login({ email, password }) {
    const db = loadDB();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return delay({ ok: false, error: 'Correo o contraseña incorrectos.' });
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return delay({ ok: true, user });
  },

  // >>> Reemplazar por Google Identity Services (One Tap / OAuth code flow) <<<
  // En producción: obtén el id_token de Google, envíalo a tu backend, éste
  // verifica la firma y crea/recupera al usuario, devolviendo tu propio JWT.
  async loginWithGoogle() {
    const db = loadDB();
    const googleProfile = {
      name: 'Cuenta de Google',
      email: 'cuenta.google@gmail.com',
    };
    let user = db.users.find((u) => u.email === googleProfile.email);
    if (!user) {
      user = {
        id: uid('client'),
        name: googleProfile.name,
        email: googleProfile.email,
        phone: '',
        birthdate: '',
        role: 'client',
        provider: 'google',
        avatar: 'https://i.pravatar.cc/150?img=47',
      };
      db.users.push(user);
      saveDB(db);
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return delay({ ok: true, user }, 700);
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
    return delay({ ok: true });
  },

  getCurrentUser() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async updateProfile(userId, changes) {
    const db = loadDB();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx === -1) return delay({ ok: false, error: 'Usuario no encontrado.' });
    db.users[idx] = { ...db.users[idx], ...changes };
    saveDB(db);
    localStorage.setItem(SESSION_KEY, JSON.stringify(db.users[idx]));
    return delay({ ok: true, user: db.users[idx] });
  },
};

// ---------------------------------------------------------------------------
// Catálogo: servicios, productos, sucursales, noticias
// ---------------------------------------------------------------------------

export const catalog = {
  async listServices() {
    const db = loadDB();
    return delay(db.services);
  },
  async listProducts() {
    const db = loadDB();
    return delay(db.products);
  },
  async listBranches() {
    const db = loadDB();
    return delay(db.branches);
  },
  async listNews() {
    const db = loadDB();
    return delay(db.news);
  },
};

// ---------------------------------------------------------------------------
// Bot de notificaciones (WhatsApp / SMS)
// ---------------------------------------------------------------------------

// >>> Reemplazar por una llamada real a tu proveedor de mensajería <<<
// Ejemplo con Twilio (desde tu backend, nunca desde el cliente):
//   await twilioClient.messages.create({
//     from: 'whatsapp:+14155238886',
//     to: `whatsapp:${phone}`,
//     body: message,
//   });
async function sendBotNotification(phone, message) {
  const db = loadDB();
  db.botLog.push({
    id: uid('bot'),
    phone,
    message,
    sentAt: new Date().toISOString(),
  });
  saveDB(db);
  return delay({ ok: true }, 300);
}

export const bot = {
  async log() {
    const db = loadDB();
    return delay([...db.botLog].reverse());
  },
};

// ---------------------------------------------------------------------------
// Citas
// ---------------------------------------------------------------------------

export const appointments = {
  async listForClient(clientId) {
    const db = loadDB();
    const list = db.appointments
      .filter((a) => a.clientId === clientId)
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    return delay(list);
  },

  async listAll({ category, status, search, onlyUpcoming, page = 1, pageSize = 6 } = {}) {
    const db = loadDB();
    let list = [...db.appointments].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    if (category) list = list.filter((a) => a.category === category);
    if (status) list = list.filter((a) => a.status === status);
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.clientName.toLowerCase().includes(q) || a.serviceName.toLowerCase().includes(q)
      );
    }
    if (onlyUpcoming) {
      // Solo citas de hoy y de mañana
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start.getTime() + 2 * 24 * 3600000);
      list = list.filter((a) => {
        const d = new Date(a.dateTime);
        return d >= start && d < end;
      });
    }
    const total = list.length;
    const start = (page - 1) * pageSize;
    const pageItems = list.slice(start, start + pageSize);
    return delay({ items: pageItems, total, page, pageSize });
  },

  // Edición manual de una cita por el barbero/administrador (CRUD)
  async update(id, changes) {
    const db = loadDB();
    const idx = db.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return delay({ ok: false, error: 'Cita no encontrada.' });
    db.appointments[idx] = {
      ...db.appointments[idx],
      ...changes,
      history: [
        ...db.appointments[idx].history,
        { action: 'editada', at: new Date().toISOString() },
      ],
    };
    saveDB(db);
    return delay({ ok: true, appointment: db.appointments[idx] });
  },

  // Eliminación definitiva de una cita (CRUD)
  async remove(id) {
    const db = loadDB();
    const idx = db.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return delay({ ok: false, error: 'Cita no encontrada.' });
    db.appointments.splice(idx, 1);
    saveDB(db);
    return delay({ ok: true });
  },

  // Alta manual de una cita hecha directamente por el barbero/administrador
  async createByAdmin({ clientName, clientPhone, service, branchId, dateTime }) {
    const db = loadDB();
    const start = new Date(dateTime).getTime();
    const end = start + service.duration * 60000;
    const overlap = db.appointments.some((a) => {
      if (a.status === 'cancelada') return false;
      const aStart = new Date(a.dateTime).getTime();
      const aEnd = aStart + a.duration * 60000;
      return start < aEnd && end > aStart;
    });
    if (overlap) {
      return delay({ ok: false, error: 'Ese horario ya está ocupado, elige otro.' });
    }
    const newApt = {
      id: uid('apt'),
      clientId: uid('walkin'),
      clientName,
      clientPhone,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      branchId,
      dateTime,
      duration: service.duration,
      status: 'pendiente',
      history: [{ action: 'creada por el administrador', at: new Date().toISOString() }],
    };
    db.appointments.push(newApt);
    saveDB(db);
    return delay({ ok: true, appointment: newApt });
  },

  async create({ clientId, clientName, clientPhone, service, branchId, dateTime }) {
    const db = loadDB();
    // Validación simple de traslape de horario
    const start = new Date(dateTime).getTime();
    const end = start + service.duration * 60000;
    const overlap = db.appointments.some((a) => {
      if (a.status === 'cancelada') return false;
      const aStart = new Date(a.dateTime).getTime();
      const aEnd = aStart + a.duration * 60000;
      return start < aEnd && end > aStart;
    });
    if (overlap) {
      return delay({ ok: false, error: 'Ese horario ya está ocupado, elige otro.' });
    }
    const newApt = {
      id: uid('apt'),
      clientId,
      clientName,
      clientPhone,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      branchId,
      dateTime,
      duration: service.duration,
      status: 'pendiente',
      history: [{ action: 'creada', at: new Date().toISOString() }],
    };
    db.appointments.push(newApt);
    saveDB(db);
    return delay({ ok: true, appointment: newApt });
  },

  async accept(id) {
    const db = loadDB();
    const apt = db.appointments.find((a) => a.id === id);
    if (!apt) return delay({ ok: false, error: 'Cita no encontrada.' });
    apt.status = 'confirmada';
    apt.history.push({ action: 'aceptada', at: new Date().toISOString() });
    saveDB(db);
    await sendBotNotification(
      apt.clientPhone,
      `Hola ${apt.clientName}, tu cita de ${apt.serviceName} fue confirmada para el ${new Date(
        apt.dateTime
      ).toLocaleString('es-MX')}.`
    );
    return delay({ ok: true, appointment: apt });
  },

  // El administrador pospone la cita y notifica al cliente por bot
  async postpone(id, { newDateTime, reason }) {
    const db = loadDB();
    const apt = db.appointments.find((a) => a.id === id);
    if (!apt) return delay({ ok: false, error: 'Cita no encontrada.' });
    const oldDate = apt.dateTime;
    apt.dateTime = newDateTime;
    apt.status = 'pospuesta';
    apt.history.push({
      action: 'pospuesta',
      at: new Date().toISOString(),
      reason,
      from: oldDate,
      to: newDateTime,
    });
    saveDB(db);
    await sendBotNotification(
      apt.clientPhone,
      `Hola ${apt.clientName}, tu cita de ${apt.serviceName} fue reprogramada para el ${new Date(
        newDateTime
      ).toLocaleString('es-MX')}. Motivo: ${reason || 'ajuste de agenda'}.`
    );
    return delay({ ok: true, appointment: apt });
  },

  // El cliente puede cancelar únicamente con 3+ horas de anticipación
  async cancel(id) {
    const db = loadDB();
    const apt = db.appointments.find((a) => a.id === id);
    if (!apt) return delay({ ok: false, error: 'Cita no encontrada.' });
    const hoursLeft = (new Date(apt.dateTime).getTime() - Date.now()) / 3600000;
    if (hoursLeft < 3) {
      return delay({
        ok: false,
        error: 'Solo puedes cancelar con al menos 3 horas de anticipación.',
      });
    }
    apt.status = 'cancelada';
    apt.history.push({ action: 'cancelada', at: new Date().toISOString() });
    saveDB(db);
    return delay({ ok: true, appointment: apt });
  },

  // El cliente solicita reagendación; el admin la revisa y la reprograma
  async requestReschedule(id, note) {
    const db = loadDB();
    const apt = db.appointments.find((a) => a.id === id);
    if (!apt) return delay({ ok: false, error: 'Cita no encontrada.' });
    const hoursLeft = (new Date(apt.dateTime).getTime() - Date.now()) / 3600000;
    if (hoursLeft < 3) {
      return delay({
        ok: false,
        error: 'Solo puedes solicitar reagendación con al menos 3 horas de anticipación.',
      });
    }
    apt.status = 'reagendacion_solicitada';
    apt.history.push({ action: 'reagendación solicitada', at: new Date().toISOString(), note });
    saveDB(db);
    return delay({ ok: true, appointment: apt });
  },
};

// ---------------------------------------------------------------------------
// Pagos en línea
// ---------------------------------------------------------------------------

// >>> Reemplazar por la pasarela real (Stripe / Mercado Pago) <<<
// Ejemplo Stripe: crear un PaymentIntent en tu backend y confirmar con
// stripe.confirmCardPayment(clientSecret) en el cliente.
export const payments = {
  async createCheckout({ amount, concept }) {
    // Simulamos una llamada a la pasarela de pago
    await delay(null, 900);
    const success = true; // aquí vendría la respuesta real de la pasarela
    if (!success) return { ok: false, error: 'El pago fue rechazado.' };
    return {
      ok: true,
      receipt: {
        id: uid('pay'),
        amount,
        concept,
        date: new Date().toISOString(),
        method: 'Tarjeta terminada en 4242',
      },
    };
  },
};
