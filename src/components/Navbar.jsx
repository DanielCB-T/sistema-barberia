// src/components/Navbar.jsx
import { useEffect, useRef, useState } from 'react';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { bot } from '../api/mockApi';

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const panelRef = useRef(null);

  useEffect(() => {
    bot.log().then(setNotifs);
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const myNotifs = notifs.filter((n) => n.phone === user?.phone);

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu-btn" onClick={onToggleSidebar} aria-label="Abrir menú">
          <Menu size={22} />
        </button>
      </div>
      <Logo size={34} />
      <div className="topbar__right" ref={panelRef} style={{ position: 'relative' }}>
        <button
          className="topbar__icon-btn"
          onClick={() => setShowNotifs((s) => !s)}
          aria-label="Notificaciones"
        >
          <Bell size={20} />
          {myNotifs.length > 0 && <span className="notif-dot" />}
        </button>
        {showNotifs && (
          <div className="notif-panel">
            {myNotifs.length === 0 ? (
              <div className="notif-panel__empty">Sin notificaciones por ahora.</div>
            ) : (
              myNotifs
                .slice(0, 8)
                .map((n) => (
                  <div key={n.id} className="notif-panel__item">
                    {n.message}
                  </div>
                ))
            )}
          </div>
        )}
        <img
          className="topbar__avatar"
          src={user?.avatar || 'https://i.pravatar.cc/150'}
          alt={user?.name || 'Usuario'}
        />
        <span className="topbar__username">{user?.name || user?.username}</span>
        <button className="topbar__logout" onClick={handleLogout}>
          Salir <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
