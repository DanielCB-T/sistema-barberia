// src/utils/businessHours.js
//
// Valida que una cita (fecha/hora + duración del servicio) caiga dentro del
// horario comercial de la sucursal elegida. Se usa tanto en el "backend"
// simulado (mockApi.js) como en los formularios, para dar retroalimentación
// inmediata sin esperar la respuesta del guardado.

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// branch: { openingTime: 'HH:MM', closingTime: 'HH:MM' }
// dateTime: string/Date parseable, hora local de la cita
// durationMinutes: duración del servicio
export function isWithinBusinessHours(branch, dateTime, durationMinutes) {
  if (!branch?.openingTime || !branch?.closingTime || !dateTime) return true;

  const start = new Date(dateTime);
  if (Number.isNaN(start.getTime())) return true;

  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = startMinutes + Number(durationMinutes || 0);
  const openMinutes = toMinutes(branch.openingTime);
  const closeMinutes = toMinutes(branch.closingTime);

  return startMinutes >= openMinutes && endMinutes <= closeMinutes;
}

export function businessHoursMessage(branch) {
  return `Esta sucursal atiende de ${branch.openingTime} a ${branch.closingTime}. Elige un horario dentro de ese rango.`;
}
