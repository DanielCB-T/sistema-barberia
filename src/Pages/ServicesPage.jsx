// src/Pages/ServicesPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { catalog } from '../api/mockApi';
import ServiceCard from '../components/ServiceCard';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import Pagination from '../components/Pagination';
import BookingModal from '../components/BookingModal';

const PAGE_SIZE = 6;

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [bookingService, setBookingService] = useState(null);

  useEffect(() => {
    catalog.listServices().then(setServices);
  }, []);

  const categories = useMemo(() => [...new Set(services.map((s) => s.category))], [services]);

  const filtered = useMemo(
    () =>
      services.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) &&
          (!category || s.category === category)
      ),
    [services, search, category]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Servicios</h1>
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
      </div>

      <FilterChips
        options={categories}
        active={category}
        onChange={(c) => { setCategory(c); setPage(1); }}
      />

      {pageItems.length === 0 ? (
        <div className="empty-state">
          <h3>Sin servicios</h3>
          <p>Ajusta la búsqueda o el filtro para ver más opciones.</p>
        </div>
      ) : (
        <div className="card-grid">
          {pageItems.map((s) => (
            <ServiceCard key={s.id} service={s} onBook={setBookingService} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {bookingService && (
        <BookingModal
          preselectedService={bookingService}
          onClose={() => setBookingService(null)}
          onBooked={() => setBookingService(null)}
        />
      )}
    </div>
  );
}

export default ServicesPage;
