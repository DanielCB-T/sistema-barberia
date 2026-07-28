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
import CartPage from './Pages/CartPage';
import AdminPage from './Pages/AdminPage';
import AdminAppointmentsPage from './Pages/AdminAppointmentsPage';
import AdminServicesPage from './Pages/AdminServicesPage';
import AdminProductsPage from './Pages/AdminProductsPage';
import AdminBranchesPage from './Pages/AdminBranchesPage';
import AdminNewsPage from './Pages/AdminNewsPage';
import AdminBarbersPage from './Pages/AdminBarbersPage';
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
        <Route path="carrito" element={<CartPage />} />
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
        <Route path="servicios" element={<AdminServicesPage />} />
        <Route path="productos" element={<AdminProductsPage />} />
        <Route path="sucursales" element={<AdminBranchesPage />} />
        <Route path="noticias" element={<AdminNewsPage />} />
        <Route path="barberos" element={<AdminBarbersPage />} />
        <Route path="ajustes" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
