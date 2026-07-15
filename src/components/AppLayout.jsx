// src/components/AppLayout.jsx
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 860px)').matches;

function AppLayout({ Sidebar }) {
  // En móvil el sidebar arranca cerrado (es un overlay); en escritorio arranca visible.
  const [collapsed, setCollapsed] = useState(isMobileViewport());
  const location = useLocation();

  // Cierra el menú automáticamente al cambiar de página en móvil.
  useEffect(() => {
    if (isMobileViewport()) setCollapsed(true);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Navbar onToggleSidebar={() => setCollapsed((c) => !c)} />
      <div className="body-row">
        <Sidebar collapsed={collapsed} />
        {!collapsed && <div className="sidebar-backdrop" onClick={() => setCollapsed(true)} />}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
