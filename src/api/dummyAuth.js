// src/api/dummyAuth.js
//
// Autenticación REAL contra DummyJSON (https://dummyjson.com/auth/login).
// A diferencia de mockApi.js (que simula todo con localStorage), aquí sí se
// hace una petición HTTP real. Usuarios y contraseñas válidos para probar
// se pueden consultar en https://dummyjson.com/users
//
// Ejemplo: { "username": "emilys", "password": "emilyspass" }

const BASE_URL = 'https://dummyjson.com';

export async function loginConDummyJSON(username, password) {
  let response;
  try {
    response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, expiresInMins: 60 }),
    });
  } catch (err) {
    return { ok: false, error: 'No se pudo conectar con el servidor. Verifica tu conexión.' };
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      error:
        response.status === 400 || response.status === 401
          ? 'Usuario o contraseña incorrectos.'
          : data?.message || 'Ocurrió un error al iniciar sesión.',
    };
  }

  const user = {
    id: data.id,
    name: `${data.firstName} ${data.lastName}`.trim(),
    username: data.username,
    email: data.email,
    phone: data.phone || '',
    avatar: data.image,
    role: 'admin', // En este sistema, quien inicia sesión es el barbero/administrador
    provider: 'dummyjson',
    accessToken: data.accessToken || data.token,
  };

  return { ok: true, user };
}
