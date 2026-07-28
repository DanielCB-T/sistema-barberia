// src/Pages/AdminPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointments as appointmentsApi } from '../api/mockApi';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import Pagination from '../components/Pagination';
import AdminAppointmentCard from '../components/AdminAppointmentCard';

const CATEGORIES = ['Barba', 'Corte', 'Limpieza', 'Degradado'];
const PAGE_SIZE = 6;

function AdminPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    appointmentsApi.listAll({ category, page, pageSize: PAGE_SIZE }).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [category, page]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredItems = data.items.filter((a) =>
    a.clientName.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Bienvenido, {user?.name?.split(' ')[0]}</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar cliente" />
      </div>

      <FilterChips
        options={CATEGORIES}
        active={category}
        onChange={(c) => { setCategory(c); setPage(1); }}
      />

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Cargando citas...</p>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <h3>No hay citas para mostrar</h3>
          <p>Prueba con otro filtro o espera nuevas reservaciones.</p>
        </div>
      ) : (
        <div className="appt-grid">
          {filteredItems.map((a) => (
            <AdminAppointmentCard key={a.id} appointment={a} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

export default AdminPage;
