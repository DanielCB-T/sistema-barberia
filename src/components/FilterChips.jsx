// src/components/FilterChips.jsx
import { SlidersHorizontal } from 'lucide-react';

function FilterChips({ options, active, onChange }) {
  return (
    <div className="chip-row">
      {options.map((opt) => (
        <button
          key={opt}
          className={`chip ${active === opt ? 'active' : ''}`}
          onClick={() => onChange(active === opt ? null : opt)}
        >
          {opt}
        </button>
      ))}
      <button
        className="chip"
        style={{ background: 'transparent', color: 'var(--navy-800)', border: '1.5px solid var(--border)' }}
        onClick={() => onChange(null)}
        aria-label="Limpiar filtros"
      >
        <SlidersHorizontal size={16} />
      </button>
    </div>
  );
}

export default FilterChips;
