// src/components/SearchBar.jsx
import { Search, X } from 'lucide-react';

function SearchBar({ value, onChange, placeholder = 'Buscar' }) {
  return (
    <div className="search-bar">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
        >
          <X size={16} />
        </button>
      )}
      <button type="button" aria-label="Buscar">
        <Search size={16} />
      </button>
    </div>
  );
}

export default SearchBar;
