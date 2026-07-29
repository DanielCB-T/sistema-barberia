// src/api/mockApi.js
//
// >>> YA CONECTADO A LA API REAL (Laravel + Sanctum) <<<
// Este módulo mantiene el mismo nombre de archivo y las mismas firmas de
// funciones que la versión simulada (para no tener que tocar cada página/
// componente que lo usa), pero ahora cada función habla con la API real
// a través de src/api/httpClient.js.
//
// Las imágenes (servicios, productos, sucursales, noticias, barberos,
// avatar) se suben como archivo real (multipart/form-data), nunca como URL
// de texto; el backend las guarda en storage/app/public/... y regresa la
// URL completa lista para usarse en un <img>.
//
// Limitaciones conocidas (documentadas también en el README de la API):
//  - loginWithGoogle(): la API real todavía no tiene endpoint de OAuth de
//    Google, así que este botón muestra un aviso en vez de iniciar sesión.
//  - payments.createCheckout(): la pasarela de pago real (Stripe/Mercado
//    Pago) todavía no está conectada; se simula localmente.
//  - appointments.listAll(): los filtros status/branch/fecha se mandan al
//    servidor (paginación real); category/search/onlyUpcoming se resuelven
//    del lado del cliente porque la API aún no los soporta como parámetros.

import { http, firstError, getToken, setToken, toFormData } from './httpClient';

const SESSION_KEY = 'barberia_session_v1';

function cacheUser(user) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

// ---------------------------------------------------------------------------
// Mappers: convierten la forma "snake_case anidado" de la API a la misma
// forma "camelCase plana" que ya usaban los componentes.
// ---------------------------------------------------------------------------

function mapUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    birthdate: u.birthdate || '',
    role: u.role,
    branchId: u.branch_id ?? null,
    avatar: u.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(u.email || String(u.id))}`,
    provider: 'local',
  };
}

function mapBranch(b) {
  if (!b) return null;
  const openingTime = (b.opening_time || '').slice(0, 5);
  const closingTime = (b.closing_time || '').slice(0, 5);
  return {
    id: b.id,
    name: b.name,
    address: b.address,
    phone: b.phone,
    openingTime,
    closingTime,
    // La API no guarda un rango de días (ej. "Lun a Sáb"), solo horas; se
    // arma un texto genérico para no dejar la tarjeta de sucursal en blanco.
    hours: `Todos los días, ${openingTime} - ${closingTime}`,
    image: b.image,
  };
}

function mapService(s) {
  if (!s) return null;
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    price: Number(s.price),
    duration: s.duration,
    description: s.description,
    image: s.image,
  };
}

function mapProduct(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    stock: p.stock,
    description: p.description,
    image: p.image,
  };
}

function mapNews(n) {
  if (!n) return null;
  return { id: n.id, title: n.title, summary: n.summary, date: n.date, image: n.image };
}

function mapBarber(b) {
  if (!b) return null;
  return {
    id: b.id,
    name: b.name,
    email: b.email,
    phone: b.phone || '',
    avatar: b.avatar,
    branchId: b.branch_id ?? null,
    branchName: b.branch?.name || null,
  };
}

// "2026-08-15 11:00" (como lo regresa Laravel) -> string parseable por Date().
function toIsoLike(dateTime) {
  if (!dateTime) return dateTime;
  return dateTime.includes('T') ? dateTime : `${dateTime.replace(' ', 'T')}:00`;
}

function mapAppointment(a) {
  if (!a) return null;
  return {
    id: a.id,
    clientId: a.client?.id,
    clientName: a.client?.name,
    clientPhone: a.client?.phone,
    serviceId: a.service?.id,
    serviceName: a.service?.name,
    category: a.service?.category,
    branchId: a.branch?.id,
    barberId: a.barber?.id,
    barberName: a.barber?.name,
    dateTime: toIsoLike(a.date_time),
    duration: a.duration,
    status: a.status,
    history: (a.history || []).map((h) => ({
      action: h.status,
      at: h.changed_at,
      note: h.note,
    })),
  };
}

function mapOrderItem(it) {
  return {
    id: it.id,
    productId: it.product_id,
    productName: it.product?.name,
    productImage: it.product?.image,
    unitPrice: Number(it.unit_price),
    quantity: it.quantity,
  };
}

function mapNotification(n) {
  if (!n) return null;
  return {
    id: n.id,
    type: n.type || null,
    channel: n.channel,
    message: n.message,
    isRead: Boolean(n.is_read),
    createdAt: n.created_at,
  };
}

function mapOrder(o) {
  if (!o) return null;
  return {
    id: o.id,
    clientId: o.client?.id,
    status: o.status,
    total: Number(o.total),
    paymentMethod: o.payment_method,
    createdAt: o.created_at,
    items: (o.items || []).map(mapOrderItem),
  };
}

// ---------------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------------

export const auth = {
  async register({ name, email, phone, birthdate, password, confirmPassword, avatarFile }) {
    const formData = toFormData({
      name,
      email,
      phone,
      birthdate,
      password,
      password_confirmation: confirmPassword,
      avatar: avatarFile || undefined,
    });
    const res = await http.postForm('/register', formData);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo crear la cuenta.') };
    // El registro inicia sesión de una vez (la verificación de correo ya no
    // bloquea el acceso; el correo se envía como paso opcional).
    setToken(res.data.token);
    const user = mapUser(res.data.user?.data ?? res.data.user);
    cacheUser(user);
    return { ok: true, user, message: res.message };
  },

  async login({ email, password }) {
    const res = await http.post('/login', { email, password });
    if (!res.ok) return { ok: false, error: firstError(res, 'Correo o contraseña incorrectos.') };
    setToken(res.data.token);
    const user = mapUser(res.data.user?.data ?? res.data.user);
    cacheUser(user);
    return { ok: true, user };
  },

  // Reenvía el correo de verificación (respuesta genérica del backend).
  async resendVerification(email) {
    const res = await http.post('/email/verify/resend', { email });
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo reenviar el correo.') };
    return { ok: true, message: res.message };
  },

  // La API real todavía no expone un endpoint de OAuth de Google.
  async loginWithGoogle() {
    return {
      ok: false,
      error: 'El inicio de sesión con Google todavía no está conectado a la API real.',
    };
  },

  async logout() {
    await http.post('/logout');
    setToken(null);
    cacheUser(null);
    return { ok: true };
  },

  getCurrentUser() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  // Valida el token guardado contra el servidor (GET /api/user). Se usa al
  // arrancar la app para no confiar ciegamente en lo que quedó en caché:
  // si el token ya expiró o fue revocado, se cierra la sesión local.
  async fetchCurrentUser() {
    if (!getToken()) return { ok: false };
    const res = await http.get('/user');
    if (!res.ok) {
      setToken(null);
      cacheUser(null);
      return { ok: false };
    }
    const user = mapUser(res.data.data ?? res.data);
    cacheUser(user);
    return { ok: true, user };
  },

  async updateProfile(_userId, changes) {
    const formData = toFormData({
      name: changes.name,
      phone: changes.phone,
      birthdate: changes.birthdate || null,
      avatar: changes.avatarFile || undefined,
    });
    const res = await http.putForm('/profile', formData);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo actualizar tu perfil.') };
    const user = mapUser(res.data.data ?? res.data);
    cacheUser(user);
    return { ok: true, user };
  },

  // Cambiar contraseña estando ya autenticado (pantalla de Ajustes).
  async changePassword({ currentPassword, password, confirmPassword }) {
    const res = await http.post('/change-password', {
      current_password: currentPassword,
      password,
      password_confirmation: confirmPassword,
    });
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo cambiar la contraseña.') };
    return { ok: true };
  },
};

// ---------------------------------------------------------------------------
// Catálogo: servicios, productos, sucursales, noticias, barberos
// ---------------------------------------------------------------------------

export const catalog = {
  async listServices() {
    const res = await http.get('/services', { per_page: 100 });
    if (!res.ok) return [];
    return (res.data.data || []).map(mapService);
  },
  async createService(data) {
    const formData = toFormData({
      name: data.name,
      category: data.category,
      price: data.price,
      duration: data.duration,
      description: data.description,
      image: data.imageFile || undefined,
    });
    const res = await http.postForm('/services', formData);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo crear el servicio.') };
    return { ok: true, item: mapService(res.data.data) };
  },
  async updateService(id, data) {
    const formData = toFormData({
      name: data.name,
      category: data.category,
      price: data.price,
      duration: data.duration,
      description: data.description,
      image: data.imageFile || undefined,
    });
    const res = await http.putForm(`/services/${id}`, formData);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo actualizar el servicio.') };
    return { ok: true, item: mapService(res.data.data) };
  },
  async deleteService(id) {
    const res = await http.delete(`/services/${id}`);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo eliminar el servicio.') };
    return { ok: true };
  },

  async listProducts() {
    const res = await http.get('/products', { per_page: 100 });
    if (!res.ok) return [];
    return (res.data.data || []).map(mapProduct);
  },
  async createProduct(data) {
    const formData = toFormData({
      name: data.name,
      price: data.price,
      stock: data.stock,
      description: data.description,
      image: data.imageFile || undefined,
    });
    const res = await http.postForm('/products', formData);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo crear el producto.') };
    return { ok: true, item: mapProduct(res.data.data) };
  },
  async updateProduct(id, data) {
    const formData = toFormData({
      name: data.name,
      price: data.price,
      stock: data.stock,
      description: data.description,
      image: data.imageFile || undefined,
    });
    const res = await http.putForm(`/products/${id}`, formData);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo actualizar el producto.') };
    return { ok: true, item: mapProduct(res.data.data) };
  },
  async deleteProduct(id) {
    const res = await http.delete(`/products/${id}`);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo eliminar el producto.') };
    return { ok: true };
  },

  async listBranches() {
    const res = await http.get('/branches');
    if (!res.ok) return [];
    return (res.data.data || []).map(mapBranch);
  },
  async createBranch(data) {
    const formData = toFormData({
      name: data.name,
      address: data.address,
      phone: data.phone,
      opening_time: data.openingTime,
      closing_time: data.closingTime,
      image: data.imageFile || undefined,
    });
    const res = await http.postForm('/branches', formData);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo crear la sucursal.') };
    return { ok: true, item: mapBranch(res.data.data) };
  },
  async updateBranch(id, data) {
    const formData = toFormData({
      name: data.name,
      address: data.address,
      phone: data.phone,
      opening_time: data.openingTime,
      closing_time: data.closingTime,
      image: data.imageFile || undefined,
    });
    const res = await http.putForm(`/branches/${id}`, formData);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo actualizar la sucursal.') };
    return { ok: true, item: mapBranch(res.data.data) };
  },
  async deleteBranch(id) {
    const res = await http.delete(`/branches/${id}`);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo eliminar la sucursal.') };
    return { ok: true };
  },

  async listNews() {
    const res = await http.get('/news', { per_page: 100 });
    if (!res.ok) return [];
    return (res.data.data || []).map(mapNews);
  },
  async createNews(data) {
    const formData = toFormData({
      title: data.title,
      summary: data.summary,
      date: data.date,
      image: data.imageFile || undefined,
    });
    const res = await http.postForm('/news', formData);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo crear la noticia.') };
    return { ok: true, item: mapNews(res.data.data) };
  },
  async updateNews(id, data) {
    const formData = toFormData({
      title: data.title,
      summary: data.summary,
      date: data.date,
      image: data.imageFile || undefined,
    });
    const res = await http.putForm(`/news/${id}`, formData);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo actualizar la noticia.') };
    return { ok: true, item: mapNews(res.data.data) };
  },
  async deleteNews(id) {
    const res = await http.delete(`/news/${id}`);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo eliminar la noticia.') };
    return { ok: true };
  },

  async listBarbers(branchId) {
    const res = await http.get('/barbers', branchId ? { branch_id: branchId } : undefined);
    if (!res.ok) return [];
    return (res.data.data || []).map(mapBarber);
  },
  async createBarber(data) {
    const formData = toFormData({
      name: data.name,
      email: data.email,
      phone: data.phone,
      branch_id: data.branchId,
      password: data.password,
      password_confirmation: data.confirmPassword,
      avatar: data.imageFile || undefined,
    });
    const res = await http.postForm('/barbers', formData);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo crear el barbero.') };
    return { ok: true, item: mapBarber(res.data.data) };
  },
  async updateBarber(id, data) {
    const formData = toFormData({
      name: data.name,
      email: data.email,
      phone: data.phone,
      branch_id: data.branchId,
      // Solo se manda si el admin capturó una nueva contraseña.
      password: data.password || undefined,
      password_confirmation: data.password ? data.confirmPassword : undefined,
      avatar: data.imageFile || undefined,
    });
    const res = await http.putForm(`/barbers/${id}`, formData);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo actualizar el barbero.') };
    return { ok: true, item: mapBarber(res.data.data) };
  },
  async deleteBarber(id) {
    const res = await http.delete(`/barbers/${id}`);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo eliminar el barbero.') };
    return { ok: true };
  },

  // Clientes existentes (para que el admin elija a quién agendarle una cita).
  async listClients() {
    const res = await http.get('/users', { role: 'client', per_page: 100 });
    if (!res.ok) return [];
    return (res.data.data || []).map(mapUser);
  },
};

// ---------------------------------------------------------------------------
// Notificaciones (campanita del Navbar)
// ---------------------------------------------------------------------------

export const bot = {
  // Lista las notificaciones del usuario autenticado + conteo de no leídas.
  async list() {
    const res = await http.get('/notifications');
    if (!res.ok) return { items: [], unread: 0 };
    const items = (res.data.data || []).map(mapNotification);
    const unread = res.data.meta?.unread ?? items.filter((n) => !n.isRead).length;
    return { items, unread };
  },

  // Compatibilidad con la versión anterior (devolvía solo el arreglo).
  async log() {
    const { items } = await this.list();
    return items;
  },

  async markRead(id) {
    const res = await http.patch(`/notifications/${id}/read`);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo marcar como leída.') };
    return { ok: true };
  },

  async markAllRead() {
    const res = await http.post('/notifications/read-all');
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudieron marcar como leídas.') };
    return { ok: true };
  },

  async remove(id) {
    const res = await http.delete(`/notifications/${id}`);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo eliminar la notificación.') };
    return { ok: true };
  },
};

// ---------------------------------------------------------------------------
// Citas
// ---------------------------------------------------------------------------

export const appointments = {
  async listForClient() {
    const res = await http.get('/appointments', { per_page: 100 });
    if (!res.ok) return [];
    return (res.data.data || [])
      .map(mapAppointment)
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  },

  async listAll({ category, status, search, onlyUpcoming, page = 1, pageSize = 6 } = {}) {
    const needsClientFilter = Boolean(category || (search && search.trim()) || onlyUpcoming);

    const res = await http.get('/appointments', {
      status: status || undefined,
      per_page: needsClientFilter ? 200 : pageSize,
      page: needsClientFilter ? 1 : page,
    });
    if (!res.ok) return { items: [], total: 0, page, pageSize };

    let list = (res.data.data || []).map(mapAppointment);

    if (!needsClientFilter) {
      return { items: list, total: res.data.meta?.total ?? list.length, page, pageSize };
    }

    if (category) list = list.filter((a) => a.category === category);
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.clientName?.toLowerCase().includes(q) || a.serviceName?.toLowerCase().includes(q)
      );
    }
    if (onlyUpcoming) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start.getTime() + 2 * 24 * 3600000);
      list = list.filter((a) => {
        const d = new Date(a.dateTime);
        return d >= start && d < end;
      });
    }

    const total = list.length;
    const startIdx = (page - 1) * pageSize;
    return { items: list.slice(startIdx, startIdx + pageSize), total, page, pageSize };
  },

  async update(id, changes) {
    const body = {};
    if (changes.serviceId !== undefined) body.service_id = changes.serviceId;
    if (changes.branchId !== undefined) body.branch_id = changes.branchId;
    if (changes.barberId !== undefined) body.barber_id = changes.barberId;
    if (changes.dateTime !== undefined) body.date_time = changes.dateTime;

    const res = await http.put(`/appointments/${id}`, body);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo actualizar la cita.') };
    return { ok: true, appointment: mapAppointment(res.data.data) };
  },

  async remove(id) {
    const res = await http.delete(`/appointments/${id}`);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo eliminar la cita.') };
    return { ok: true };
  },

  // El admin agenda a nombre de un cliente YA registrado (seleccionado en
  // el formulario); la API real requiere una cuenta, no admite citas de
  // mostrador sin cliente.
  async createByAdmin({ clientId, service, branchId, barberId, dateTime }) {
    const res = await http.post('/appointments', {
      client_id: clientId,
      service_id: service.id,
      branch_id: branchId,
      barber_id: barberId,
      date_time: dateTime,
      pay_online: false,
      notify_whatsapp: true,
    });
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo agendar la cita.') };
    return { ok: true, appointment: mapAppointment(res.data.data) };
  },

  async create({ service, branchId, barberId, dateTime, payOnline, notifyWhatsapp }) {
    const res = await http.post('/appointments', {
      service_id: service.id,
      branch_id: branchId,
      barber_id: barberId,
      date_time: dateTime,
      pay_online: Boolean(payOnline),
      notify_whatsapp: notifyWhatsapp ?? true,
    });
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo agendar la cita.') };
    return { ok: true, appointment: mapAppointment(res.data.data) };
  },

  async accept(id) {
    const res = await http.patch(`/appointments/${id}/status`, { status: 'confirmada' });
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo confirmar la cita.') };
    return { ok: true, appointment: mapAppointment(res.data.data) };
  },

  async postpone(id, { newDateTime, reason }) {
    if (newDateTime) {
      const rescheduleRes = await http.put(`/appointments/${id}`, { date_time: newDateTime });
      if (!rescheduleRes.ok) {
        return { ok: false, error: firstError(rescheduleRes, 'No se pudo reprogramar la cita.') };
      }
    }
    const res = await http.patch(`/appointments/${id}/status`, {
      status: 'pospuesta',
      note: reason,
    });
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo posponer la cita.') };
    return { ok: true, appointment: mapAppointment(res.data.data) };
  },

  async cancel(id) {
    const res = await http.patch(`/appointments/${id}/status`, { status: 'cancelada' });
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo cancelar la cita.') };
    return { ok: true, appointment: mapAppointment(res.data.data) };
  },

  async requestReschedule(id, note) {
    // La API no tiene un estado propio para "reagendación solicitada"; se
    // registra como una reprogramación (queda en la bitácora de la cita).
    const res = await http.put(`/appointments/${id}`, {});
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo solicitar la reagendación.') };
    return { ok: true, appointment: mapAppointment(res.data.data) };
  },
};

// ---------------------------------------------------------------------------
// Pagos en línea
// ---------------------------------------------------------------------------

// >>> Pendiente: conectar Stripe/Mercado Pago real (no hay endpoint aún) <<<
export const payments = {
  async createCheckout({ amount, concept }) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return {
      ok: true,
      receipt: {
        id: `pay-${Date.now()}`,
        amount,
        concept,
        date: new Date().toISOString(),
        method: 'Tarjeta terminada en 4242 (simulado)',
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Carrito y órdenes
// ---------------------------------------------------------------------------

export const cart = {
  async get() {
    const res = await http.get('/cart');
    if (!res.ok) return { id: null, items: [], total: 0, status: 'carrito' };
    return mapOrder(res.data.data);
  },

  async addItem(_clientId, productId, quantity = 1) {
    const res = await http.post('/cart/items', { product_id: productId, quantity });
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo agregar el producto.') };
    return { ok: true, cart: mapOrder(res.data.data) };
  },

  async updateItem(_clientId, itemId, quantity) {
    const res = await http.put(`/cart/items/${itemId}`, { quantity });
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo actualizar el producto.') };
    return { ok: true, cart: mapOrder(res.data.data) };
  },

  async removeItem(_clientId, itemId) {
    const res = await http.delete(`/cart/items/${itemId}`);
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo quitar el producto.') };
    return { ok: true, cart: mapOrder(res.data.data) };
  },
};

export const orders = {
  async listForClient() {
    const res = await http.get('/orders', { per_page: 100 });
    if (!res.ok) return [];
    return (res.data.data || []).map(mapOrder);
  },

  async checkout(_clientId, paymentMethod) {
    const res = await http.post('/orders/checkout', { payment_method: paymentMethod });
    if (!res.ok) return { ok: false, error: firstError(res, 'No se pudo generar la orden.') };
    return { ok: true, order: mapOrder(res.data.data) };
  },
};
