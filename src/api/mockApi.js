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
  seedBarbers,
} from './seedData';
import { isWithinBusinessHours, businessHoursMessage } from '../utils/businessHours';

const DB_KEY = 'barberia_db_v1';
const SESSION_KEY = 'barberia_session_v1';

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    const db = JSON.parse(raw);
    // Compatibilidad con una base guardada antes de agregar barberos/órdenes.
    if (!db.barbers) db.barbers = seedBarbers;
    if (!db.orders) db.orders = [];
    return db;
  }
  const initial = {
    users: seedUsers,
    services: seedServices,
    products: seedProducts,
    branches: seedBranches,
    news: seedNews,
    appointments: seedAppointments,
    barbers: seedBarbers,
    orders: [],
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

// Traslape de horario, acotado al mismo barbero: dos citas de barberos
// distintos pueden coincidir en horario sin problema.
function barberHasConflict(db, { barberId, dateTime, duration, excludeId }) {
  const start = new Date(dateTime).getTime();
  const end = start + duration * 60000;
  return db.appointments.some((a) => {
    if (excludeId && a.id === excludeId) return false;
    if (a.status === 'cancelada') return false;
    if (a.barberId !== barberId) return false;
    const aStart = new Date(a.dateTime).getTime();
    const aEnd = aStart + a.duration * 60000;
    return start < aEnd && end > aStart;
  });
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

  // changes puede incluir { currentPassword, password } para cambiar la
  // contraseña; en ese caso se valida que currentPassword coincida antes
  // de reemplazarla. (En el backend real la contraseña siempre va
  // hasheada; aquí es un mock local, nunca se muestra en ninguna vista.)
  async updateProfile(userId, changes) {
    const db = loadDB();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx === -1) return delay({ ok: false, error: 'Usuario no encontrado.' });

    const { currentPassword, password, ...rest } = changes;
    if (password) {
      if (db.users[idx].password !== currentPassword) {
        return delay({ ok: false, error: 'La contraseña actual no es correcta.' });
      }
      rest.password = password;
    }

    db.users[idx] = { ...db.users[idx], ...rest };
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
  // Barberos disponibles, opcionalmente filtrados por sucursal.
  async listBarbers(branchId) {
    const db = loadDB();
    const list = branchId ? db.barbers.filter((b) => b.branchId === branchId) : db.barbers;
    return delay(list);
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
    const current = db.appointments[idx];
    const barberId = changes.barberId ?? current.barberId;
    const dateTime = changes.dateTime ?? current.dateTime;
    const duration = changes.duration ?? current.duration;
    const branchId = changes.branchId ?? current.branchId;
    const branch = db.branches.find((b) => b.id === branchId);
    if (branch && !isWithinBusinessHours(branch, dateTime, duration)) {
      return delay({ ok: false, error: businessHoursMessage(branch) });
    }
    if (
      barberHasConflict(db, { barberId, dateTime, duration, excludeId: id })
    ) {
      return delay({ ok: false, error: 'Ese barbero ya tiene una cita en ese horario, elige otro.' });
    }
    db.appointments[idx] = {
      ...current,
      ...changes,
      history: [
        ...current.history,
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
  async createByAdmin({ clientName, clientPhone, service, branchId, barberId, barberName, dateTime }) {
    const db = loadDB();
    const branch = db.branches.find((b) => b.id === branchId);
    if (branch && !isWithinBusinessHours(branch, dateTime, service.duration)) {
      return delay({ ok: false, error: businessHoursMessage(branch) });
    }
    if (barberHasConflict(db, { barberId, dateTime, duration: service.duration })) {
      return delay({ ok: false, error: 'Ese barbero ya tiene una cita en ese horario, elige otro.' });
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
      barberId,
      barberName,
      dateTime,
      duration: service.duration,
      status: 'pendiente',
      history: [{ action: 'creada por el administrador', at: new Date().toISOString() }],
    };
    db.appointments.push(newApt);
    saveDB(db);
    return delay({ ok: true, appointment: newApt });
  },

  async create({ clientId, clientName, clientPhone, service, branchId, barberId, barberName, dateTime }) {
    const db = loadDB();
    const branch = db.branches.find((b) => b.id === branchId);
    if (branch && !isWithinBusinessHours(branch, dateTime, service.duration)) {
      return delay({ ok: false, error: businessHoursMessage(branch) });
    }
    if (barberHasConflict(db, { barberId, dateTime, duration: service.duration })) {
      return delay({ ok: false, error: 'Ese barbero ya tiene una cita en ese horario, elige otro.' });
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
      barberId,
      barberName,
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

// ---------------------------------------------------------------------------
// Carrito y órdenes
// ---------------------------------------------------------------------------
//
// El carrito no es una tabla aparte: es la orden (status 'carrito') del
// cliente todavía sin confirmar. Al hacer checkout esa misma orden cambia
// de estado y deja de ser el carrito activo (igual que en la API real).

function recalcOrderTotal(order) {
  order.total = order.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
}

function getOrCreateCart(db, clientId) {
  let cart = db.orders.find((o) => o.clientId === clientId && o.status === 'carrito');
  if (!cart) {
    cart = { id: uid('order'), clientId, items: [], total: 0, status: 'carrito', paymentMethod: null, createdAt: new Date().toISOString() };
    db.orders.push(cart);
  }
  return cart;
}

export const cart = {
  async get(clientId) {
    const db = loadDB();
    const c = getOrCreateCart(db, clientId);
    saveDB(db);
    return delay(c);
  },

  // Si el producto ya está en el carrito, suma la cantidad al item existente.
  async addItem(clientId, productId, quantity = 1) {
    const db = loadDB();
    const product = db.products.find((p) => p.id === productId);
    if (!product) return delay({ ok: false, error: 'Producto no encontrado.' });

    const c = getOrCreateCart(db, clientId);
    const existing = c.items.find((it) => it.productId === productId);
    const requestedTotal = quantity + (existing?.quantity || 0);

    if (requestedTotal > product.stock) {
      return delay({ ok: false, error: `Solo hay ${product.stock} unidades disponibles de "${product.name}".` });
    }

    if (existing) {
      existing.quantity = requestedTotal;
    } else {
      c.items.push({
        id: uid('item'),
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        unitPrice: product.price,
        quantity,
      });
    }
    recalcOrderTotal(c);
    saveDB(db);
    return delay({ ok: true, cart: c });
  },

  async updateItem(clientId, itemId, quantity) {
    const db = loadDB();
    const c = getOrCreateCart(db, clientId);
    const item = c.items.find((it) => it.id === itemId);
    if (!item) return delay({ ok: false, error: 'El producto ya no está en el carrito.' });

    const product = db.products.find((p) => p.id === item.productId);
    if (product && quantity > product.stock) {
      return delay({ ok: false, error: `Solo hay ${product.stock} unidades disponibles de "${item.productName}".` });
    }

    item.quantity = quantity;
    recalcOrderTotal(c);
    saveDB(db);
    return delay({ ok: true, cart: c });
  },

  async removeItem(clientId, itemId) {
    const db = loadDB();
    const c = getOrCreateCart(db, clientId);
    c.items = c.items.filter((it) => it.id !== itemId);
    recalcOrderTotal(c);
    saveDB(db);
    return delay({ ok: true, cart: c });
  },
};

export const orders = {
  async listForClient(clientId) {
    const db = loadDB();
    return delay(
      db.orders
        .filter((o) => o.clientId === clientId && o.status !== 'carrito')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  },

  // Convierte el carrito activo del cliente en una orden generada: valida
  // existencias, descuenta stock y cambia el estado de "carrito" a "pagado".
  async checkout(clientId, paymentMethod) {
    const db = loadDB();
    const c = getOrCreateCart(db, clientId);

    if (c.items.length === 0) {
      return delay({ ok: false, error: 'Tu carrito está vacío, agrega productos antes de generar la orden.' });
    }

    for (const item of c.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product || item.quantity > product.stock) {
        return delay({ ok: false, error: `Ya no hay suficientes existencias de "${item.productName}".` });
      }
    }

    c.items.forEach((item) => {
      const product = db.products.find((p) => p.id === item.productId);
      product.stock -= item.quantity;
    });

    c.status = 'pagado';
    c.paymentMethod = paymentMethod;
    c.paidAt = new Date().toISOString();
    saveDB(db);
    return delay({ ok: true, order: c });
  },
};

// ---------------------------------------------------------------------------
// Ficha de cliente (panel de administración)
// ---------------------------------------------------------------------------
export const clients = {
  // Devuelve los datos del cliente (si está registrado) y todo su historial
  // de citas. Un walk-in creado por el administrador no tiene cuenta de
  // usuario, así que se arma una ficha mínima a partir de sus citas.
  async getHistory(clientId) {
    const db = loadDB();
    const clientAppointments = db.appointments
      .filter((a) => a.clientId === clientId)
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    const registered = db.users.find((u) => u.id === clientId && u.role === 'client');

    if (!registered && clientAppointments.length === 0) {
      return delay(null);
    }

    const client = registered
      ? {
          id: registered.id,
          name: registered.name,
          email: registered.email,
          phone: registered.phone,
          avatar: registered.avatar,
          registered: true,
        }
      : {
          id: clientId,
          name: clientAppointments[0].clientName,
          email: null,
          phone: clientAppointments[0].clientPhone,
          avatar: null,
          registered: false,
        };

    return delay({ client, appointments: clientAppointments });
  },
};
