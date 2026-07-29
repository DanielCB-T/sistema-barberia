// src/api/httpClient.js
//
// Cliente HTTP mínimo (fetch) para hablar con la API real de Laravel.
// Se encarga de: armar la URL, mandar el token guardado, parsear JSON y
// devolver siempre la misma forma { ok, status, data, message, errors }
// para que el resto del código (mockApi.js) no tenga que repetir try/catch.

const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'http://177.7.32.156/api-sistema-barberia/api';
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export const TOKEN_KEY = 'barberia_token_v1';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Se llena desde AuthContext para poder reaccionar (cerrar sesión local)
// cuando el token ya no es válido, sin crear una dependencia circular.
let onUnauthorized = null;
export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}

function buildQuery(params) {
  if (!params) return '';
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    usp.set(key, value);
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

async function request(method, path, { body, params } = {}) {
  const token = getToken();

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      errors: null,
    };
  }

  return parseResponse(response);
}

// Petición multipart/form-data (para subir archivos: imágenes, avatares).
// method solo puede ser 'POST' o 'PUT'; para 'PUT' se manda como POST real
// con el campo _method=PUT (method spoofing de Laravel), porque PHP no
// llena $_FILES en peticiones PUT reales con multipart.
async function requestForm(method, path, formData) {
  const token = getToken();

  if (method === 'PUT') {
    formData.append('_method', 'PUT');
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        // OJO: no se pone 'Content-Type' a propósito; el navegador arma el
        // boundary del multipart automáticamente si lo dejamos vacío.
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      errors: null,
    };
  }

  return parseResponse(response);
}

async function parseResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch (err) {
    payload = null;
  }

  if (response.status === 401 && typeof onUnauthorized === 'function') {
    onUnauthorized();
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data: null,
      message: payload?.message || 'Ocurrió un error al comunicarse con el servidor.',
      errors: payload?.errors || null,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: payload,
    message: payload?.message || null,
    errors: null,
  };
}

export const http = {
  get: (path, params) => request('GET', path, { params }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path),
  // Multipart (subida de archivos): postForm para crear, putForm para editar.
  postForm: (path, formData) => requestForm('POST', path, formData),
  putForm: (path, formData) => requestForm('PUT', path, formData),
};

// Arma un FormData a partir de un objeto plano, agregando solo los campos
// definidos (undefined se omite). Los valores booleanos se mandan como
// '1'/'0' porque FormData solo entiende strings/Blob.
export function toFormData(fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) return;
    if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0');
      return;
    }
    formData.append(key, value);
  });
  return formData;
}

// Toma el primer mensaje de error de validación de Laravel (422), si lo hay.
export function firstError(res, fallback) {
  if (res.errors) {
    const firstKey = Object.keys(res.errors)[0];
    if (firstKey) return res.errors[firstKey][0];
  }
  return res.message || fallback || 'Ocurrió un error inesperado.';
}
