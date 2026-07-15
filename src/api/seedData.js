// src/api/seedData.js
// Datos iniciales de ejemplo. En un backend real esto vendría de la base de datos.

export const seedServices = [
  {
    id: 'srv-1',
    name: 'Corte de cabello',
    price: 120,
    duration: 40,
    category: 'Corte',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80',
    description: 'Corte a tijera y/o máquina, incluye lavado y peinado final.',
  },
  {
    id: 'srv-2',
    name: 'Arreglo de barba',
    price: 90,
    duration: 30,
    category: 'Barba',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80',
    description: 'Perfilado, rasurado con navaja y toalla caliente.',
  },
  {
    id: 'srv-3',
    name: 'Limpieza facial',
    price: 80,
    duration: 30,
    category: 'Limpieza',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIri1YNR7s7Jg8E2yvziuT3iKRVFIxDXTKKAo_bRRKJRZajW9TPDR56Wpj&s=10',
    description: 'Limpieza profunda, exfoliación y mascarilla relajante.',
  },
  {
    id: 'srv-4',
    name: 'Corte de cabello, barba y bigote',
    price: 220,
    duration: 70,
    category: 'Degradado',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80',
    description: 'Paquete completo: degradado, barba perfilada y bigote.',
  },
  {
    id: 'srv-5',
    name: 'Degradado clásico',
    price: 140,
    duration: 45,
    category: 'Degradado',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&q=80',
    description: 'Fade clásico con acabado a navaja en contornos.',
  },
];

export const seedProducts = [
  {
    id: 'prod-1',
    name: 'Cera moldeadora',
    price: 180,
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&q=80',
    description: 'Fijación media, acabado mate.',
  },
  {
    id: 'prod-2',
    name: 'Aceite para barba',
    price: 150,
    image: 'https://images.unsplash.com/photo-1621607512022-6aa69f8d3a72?w=600&q=80',
    description: 'Hidrata y suaviza, aroma amaderado.',
  },
  {
    id: 'prod-3',
    name: 'Shampoo anticaída',
    price: 210,
    image: 'https://images.unsplash.com/photo-1585232351009-aa87416fca90?w=600&q=80',
    description: 'Fórmula fortalecedora de uso diario.',
  },
  {
    id: 'prod-4',
    name: 'Navaja de afeitar clásica',
    price: 350,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80',
    description: 'Acero inoxidable, mango de madera.',
  },
];

export const seedBranches = [
  {
    id: 'br-1',
    name: 'Barbería Centro',
    address: 'Av. Independencia 501, Centro, Oaxaca de Juárez',
    phone: '+52 951 123 4567',
    hours: 'Lun a Sáb, 10:00 - 20:00',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=700&q=80',
  },
  {
    id: 'br-2',
    name: 'Barbería Reforma',
    address: 'Calz. Madero 220, Reforma, Oaxaca de Juárez',
    phone: '+52 951 765 4321',
    hours: 'Lun a Dom, 09:00 - 21:00',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=700&q=80',
  },
];

export const seedNews = [
  {
    id: 'news-1',
    title: '¡Nueva sucursal en Reforma!',
    date: '2026-06-15',
    image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=700&q=80',
    summary: 'Abrimos una nueva sucursal con más horarios disponibles para ti.',
  },
  {
    id: 'news-2',
    title: 'Promoción de temporada',
    date: '2026-07-01',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=700&q=80',
    summary: '20% de descuento en el paquete de corte + barba durante julio.',
  },
  {
    id: 'news-3',
    title: 'Nuevos productos de cuidado',
    date: '2026-07-05',
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=700&q=80',
    summary: 'Llegaron nuevas ceras y aceites para el cuidado de barba.',
  },
];

export const seedUsers = [
  {
    id: 'admin-1',
    name: 'Jose Daniel',
    email: 'admin@barberia.com',
    phone: '+52 951 000 0001',
    birthdate: '1990-01-01',
    password: 'admin123',
    role: 'admin',
    provider: 'local',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'client-1',
    name: 'David Hernández',
    email: 'user@barberia.com',
    phone: '+52 951 222 3344',
    birthdate: '1998-05-20',
    password: 'user123',
    role: 'client',
    provider: 'local',
    avatar: 'https://i.pravatar.cc/150?img=33',
  },
];

function todayPlusHours(hours) {
  const d = new Date();
  d.setHours(d.getHours() + hours, 0, 0, 0);
  return d.toISOString();
}

export const seedAppointments = [
  {
    id: 'apt-1',
    clientId: 'client-1',
    clientName: 'David Hernández',
    clientPhone: '+52 951 222 3344',
    serviceId: 'srv-1',
    serviceName: 'Corte de cabello',
    category: 'Corte',
    branchId: 'br-1',
    dateTime: todayPlusHours(30),
    duration: 40,
    status: 'pendiente',
    history: [],
  },
  {
    id: 'apt-2',
    clientId: 'client-1',
    clientName: 'David Hernández',
    clientPhone: '+52 951 222 3344',
    serviceId: 'srv-2',
    serviceName: 'Arreglo de barba',
    category: 'Barba',
    branchId: 'br-1',
    dateTime: todayPlusHours(2),
    duration: 30,
    status: 'confirmada',
    history: [],
  },
];
