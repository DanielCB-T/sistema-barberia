// src/components/AdminSidebar.jsx
import { NavLink } from 'react-router-dom';
import { Home, CalendarCheck, Scissors, ShoppingBag, MapPin, Newspaper, Users, Settings } from 'lucide-react';

const links = [
  { to: '/admin', label: 'Inicio', icon: Home, end: true },
  { to: '/admin/gestion-citas', label: 'Gestión de citas', icon: CalendarCheck },
  { to: '/admin/servicios', label: 'Servicios', icon: Scissors },
  { to: '/admin/productos', label: 'Productos', icon: ShoppingBag },
  { to: '/admin/sucursales', label: 'Sucursales', icon: MapPin },
  { to: '/admin/noticias', label: 'Noticias', icon: Newspaper },
  { to: '/admin/barberos', label: 'Barberos', icon: Users },
];

function AdminSidebar({ collapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar__nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__bottom">
        <NavLink to="/admin/ajustes" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          Ajustes
        </NavLink>
      </div>
    </aside>
  );
}

export default AdminSidebar;
