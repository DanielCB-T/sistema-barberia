// src/utils/utileria.js
//
// Funciones de utilería para validación de formularios (login, registro y
// formularios de citas). Archivo proporcionado por el usuario, sin cambios
// en la lógica; solo se agregan los `export` para poder importarlas como
// módulo ES6 en los componentes de React.

export function validarCorreo(correo) {
    const expresionRegular = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return expresionRegular.test(correo);
}

export function soloLetras(texto) {
    const expresionRegular = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
    return expresionRegular.test(texto);
}

export function validarLongitud(numero, maxLongitud) {
    if (numero === null || numero === undefined) {
        return false;
    }
    const cadena = String(numero).trim();
    return cadena.length <= maxLongitud;
}

export function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) {
        return 0;
    }
    const hoy = new Date();
    const fechaCumple = new Date(fechaNacimiento);
    // Evitar desfase de zona horaria al crear el objeto Date
    const cumpleUTC = new Date(fechaCumple.getUTCFullYear(), fechaCumple.getUTCMonth(), fechaCumple.getUTCDate());
    let edadCalculada = hoy.getFullYear() - cumpleUTC.getFullYear();
    const diferenciaMeses = hoy.getMonth() - cumpleUTC.getMonth();
    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < cumpleUTC.getDate())) {
        edadCalculada--;
    }
    return edadCalculada;
}

export function esMayorDeEdad(fechaNacimiento) {
    const edad = calcularEdad(fechaNacimiento);
    return edad >= 18;
}

export function validarPassword(contrasena) {
    const expresionRegular = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#+=\[\]{}()^|~`:;,<>\/\\\"\'\`])[A-Za-z\d@$!%*?&._\-#+=\[\]{}()^|~`:;,<>\/\\\"\'\`]{8,}$/;
    return expresionRegular.test(contrasena);
}

export function validarCURP(curp) {
    if (!curp) {
        return false;
    }
    const expresionRegular = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/;
    return expresionRegular.test(curp.toUpperCase().trim());
}

export function validarTelefono(telefono) {
    if (!telefono) {
        return false;
    }
    const limpio = String(telefono).replace(/[\s\-()]/g, '');
    const expresionRegular = /^\d{10}$/;
    return expresionRegular.test(limpio);
}

// Convierte una fecha (ISO o parseable) en un texto relativo corto en
// español: "hace un momento", "hace 5 min", "hace 2 h", "ayer" o la fecha
// completa. Se usa en el panel de notificaciones del Navbar.
export function formatearFechaRelativa(fecha) {
    if (!fecha) {
        return '';
    }
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) {
        return '';
    }

    const ahora = new Date();
    const segundos = Math.floor((ahora - d) / 1000);

    if (segundos < 60) {
        return 'hace un momento';
    }
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) {
        return `hace ${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    if (horas < 24) {
        return `hace ${horas} h`;
    }
    const dias = Math.floor(horas / 24);
    if (dias === 1) {
        return 'ayer';
    }
    if (dias < 7) {
        return `hace ${dias} días`;
    }

    return d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
