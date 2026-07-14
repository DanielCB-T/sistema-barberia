// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import DashboardPage from './Pages/DashboardPage';
import ServicesPage from './Pages/ServicesPage';
import ProductsPage from './Pages/ProductsPage';
import BranchesPage from './Pages/BranchesPage';
import NewsPage from './Pages/NewsPage';
import MyAppointmentsPage from './Pages/MyAppointmentsPage';
import AdminPage from './Pages/AdminPage';
import AdminAppointmentsPage from './Pages/AdminAppointmentsPage';
import SettingsPage from './Pages/SettingsPage';
import AppLayout from './components/AppLayout';
import ClientSidebar from './components/ClientSidebar';
import AdminSidebar from './components/AdminSidebar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="client">
            <AppLayout Sidebar={ClientSidebar} />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="mis-citas" element={<MyAppointmentsPage />} />
        <Route path="servicios" element={<ServicesPage />} />
        <Route path="productos" element={<ProductsPage />} />
        <Route path="sucursales" element={<BranchesPage />} />
        <Route path="noticias" element={<NewsPage />} />
        <Route path="ajustes" element={<SettingsPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AppLayout Sidebar={AdminSidebar} />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminPage />} />
        <Route path="gestion-citas" element={<AdminAppointmentsPage />} />
        <Route path="ajustes" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
