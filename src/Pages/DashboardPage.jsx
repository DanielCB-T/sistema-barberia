// src/Pages/DashboardPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { catalog } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import ServiceCard from '../components/ServiceCard';
import Pagination from '../components/Pagination';
import BookingModal from '../components/BookingModal';

// Imagen de portada del hero. Para cambiarla, sustituye esta URL por la tuya
// (por ejemplo una imagen en /public/hero.jpg -> '/hero.jpg').
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&q=80';

const PAGE_SIZE = 4;

function DashboardPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [bookingService, setBookingService] = useState(null);

  useEffect(() => {
    catalog.listServices().then(setServices);
  }, []);

  const filtered = useMemo(
    () => services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [services, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div
        className="hero"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="hero__top">
          <span className="hero__welcome">Bienvenido, {user?.name?.split(' ')[0]}</span>
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        </div>
        <nav className="hero__nav">
          <Link className="hero__nav-btn" to="/dashboard/servicios">Servicios</Link>
          <Link className="hero__nav-btn" to="/dashboard/productos">Productos</Link>
          <Link className="hero__nav-btn" to="/dashboard/sucursales">Sucursales</Link>
          <Link className="hero__nav-btn" to="/dashboard/noticias">Noticias</Link>
          <Link className="hero__nav-btn" to="/dashboard/mis-citas">Mis citas</Link>
        </nav>
        <h2 className="hero__tagline">¡La mejor barbería de Oaxaca!</h2>
      </div>

      <h2 className="section-title">Nuestros servicios</h2>

      {pageItems.length === 0 ? (
        <div className="empty-state">
          <h3>Sin resultados</h3>
          <p>No encontramos servicios que coincidan con tu búsqueda.</p>
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

export default DashboardPage;
