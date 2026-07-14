// src/components/ClientSidebar.jsx
import { NavLink } from 'react-router-dom';
import { Home, Scissors, ShoppingBag, MapPin, Newspaper, CalendarClock, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Inicio', icon: Home, end: true },
  { to: '/dashboard/mis-citas', label: 'Mis citas', icon: CalendarClock },
  { to: '/dashboard/servicios', label: 'Servicios', icon: Scissors },
  { to: '/dashboard/productos', label: 'Productos', icon: ShoppingBag },
  { to: '/dashboard/sucursales', label: 'Sucursales', icon: MapPin },
  { to: '/dashboard/noticias', label: 'Noticias', icon: Newspaper },
];

function ClientSidebar({ collapsed }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
        <button
          className="sidebar__link"
          onClick={async () => {
            await logout();
            navigate('/');
          }}
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
        <NavLink to="/dashboard/ajustes" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          Ajustes
        </NavLink>
      </div>
    </aside>
  );
}

export default ClientSidebar;
