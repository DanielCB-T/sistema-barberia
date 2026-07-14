// src/api/dummyPractice.js
//
// DummyJSON no tiene un endpoint de "citas", así que para practicar la
// petición HTTP REAL (POST/PUT/DELETE) que pide la consigna en cada acción
// del CRUD, usamos el endpoint público https://dummyjson.com/todos como
// "backend de prueba". La API responde como si hubiera guardado el cambio
// (así lo advierte la propia documentación de DummyJSON), pero no persiste
// realmente; por eso, después de esta llamada, el cambio se refleja "de
// verdad" en el estado local (useState) de la aplicación.

const BASE_URL = 'https://dummyjson.com';

export async function crearRegistroReal(payload) {
  const res = await fetch(`${BASE_URL}/todos/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ todo: payload, completed: false, userId: 1 }),
  });
  return res.json();
}

export async function editarRegistroReal(id, payload) {
  const res = await fetch(`${BASE_URL}/todos/1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ todo: payload }),
  });
  return res.json();
}

export async function eliminarRegistroReal() {
  const res = await fetch(`${BASE_URL}/todos/1`, {
    method: 'DELETE',
  });
  return res.json();
}
