// src/components/Pagination.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="pagination">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Anterior">
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} style={{ color: 'var(--muted)' }}>
            ...
          </span>
        ) : (
          <button key={p} className={p === page ? 'active' : ''} onClick={() => onChange(p)}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Siguiente">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default Pagination;
