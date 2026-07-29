// src/components/Navbar.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, Bell, LogOut, CheckCheck, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { bot } from '../api/mockApi';
import { formatearFechaRelativa } from '../utils/utileria';

// Cada cuánto se refresca la campanita automáticamente (ms).
const POLL_MS = 30000;

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { items, unread: u } = await bot.list();
    setNotifs(items);
    setUnread(u);
  }, [user]);

  // Carga inicial + auto-actualización periódica mientras haya sesión.
  useEffect(() => {
    if (!user) {
      setNotifs([]);
      setUnread(0);
      return undefined;
    }
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [user, load]);

  // Al abrir el panel, refresca de inmediato para no mostrar datos viejos.
  useEffect(() => {
    if (showNotifs) load();
  }, [showNotifs, load]);

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

  const handleMarkRead = async (id) => {
    setNotifs((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    await bot.markRead(id);
  };

  const handleMarkAll = async () => {
    setNotifs((list) => list.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    await bot.markAllRead();
  };

  const handleRemove = async (id) => {
    const target = notifs.find((n) => n.id === id);
    setNotifs((list) => list.filter((n) => n.id !== id));
    if (target && !target.isRead) setUnread((u) => Math.max(0, u - 1));
    await bot.remove(id);
  };

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
          {unread > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                borderRadius: 999,
                background: 'var(--rust-500)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        {showNotifs && (
          <div className="notif-panel">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <strong style={{ fontSize: '0.9rem' }}>Notificaciones</strong>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--rust-500)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <CheckCheck size={14} /> Marcar todas
                </button>
              )}
            </div>

            {notifs.length === 0 ? (
              <div className="notif-panel__empty">Sin notificaciones por ahora.</div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  className="notif-panel__item"
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'flex-start',
                    background: n.isRead ? 'transparent' : 'rgba(193,120,74,0.08)',
                  }}
                >
                  {!n.isRead && (
                    <span
                      style={{
                        marginTop: 6,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--rust-500)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: n.isRead ? 400 : 600, whiteSpace: 'pre-line' }}>
                      {n.message}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.72rem', marginTop: 4 }}>
                      {formatearFechaRelativa(n.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        aria-label="Marcar como leída"
                        title="Marcar como leída"
                        style={iconBtnStyle}
                      >
                        <Check size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(n.id)}
                      aria-label="Eliminar notificación"
                      title="Eliminar"
                      style={{ ...iconBtnStyle, color: 'var(--danger, #c0392b)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
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
        <button className="topbar__logout" onClick={handleLogout} aria-label="Cerrar sesión">
          <span className="topbar__logout-text">Salir</span> <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}

const iconBtnStyle = {
  background: 'transparent',
  border: 'none',
  padding: 2,
  cursor: 'pointer',
  color: 'var(--muted)',
  display: 'flex',
  lineHeight: 0,
};

export default Navbar;
