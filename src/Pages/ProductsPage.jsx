// src/Pages/ProductsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { catalog } from '../api/mockApi';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 8;

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    catalog.listProducts().then(setProducts);
  }, []);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Productos</h1>
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
      </div>

      {pageItems.length === 0 ? (
        <div className="empty-state">
          <h3>Sin productos</h3>
          <p>No encontramos productos que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <div className="card-grid">
          {pageItems.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

export default ProductsPage;
