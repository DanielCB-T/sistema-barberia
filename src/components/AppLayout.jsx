// src/components/AppLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function AppLayout({ Sidebar }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Navbar onToggleSidebar={() => setCollapsed((c) => !c)} />
      <div className="body-row">
        <Sidebar collapsed={collapsed} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
