// src/components/AdminSidebar.jsx
import { NavLink } from 'react-router-dom';
import { Home, CalendarCheck, Settings } from 'lucide-react';

const links = [
  { to: '/admin', label: 'Inicio', icon: Home, end: true },
  { to: '/admin/gestion-citas', label: 'Gestión de citas', icon: CalendarCheck },
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
