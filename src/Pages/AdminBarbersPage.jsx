// src/Pages/AdminBarbersPage.jsx
//
// La API real solo expone GET /api/barbers (lectura); no hay endpoints para
// crear, editar o eliminar un barbero todavía (eso requeriría un endpoint
// nuevo en el backend, ej. POST /api/users con role=barber). Por indicación
// expresa no se modifica la API, así que esta pantalla es de solo consulta,
// con un aviso claro en vez de botones que fallarían en silencio.
import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { catalog } from '../api/mockApi';

function AdminBarbersPage() {
  const [barbers, setBarbers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalog.listBranches().then(setBranches);
  }, []);

  useEffect(() => {
    setLoading(true);
    catalog.listBarbers(branchFilter || undefined).then((list) => {
      setBarbers(list);
      setLoading(false);
    });
  }, [branchFilter]);

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Barberos</h1>
      </div>

      <div
        className="table-wrap"
        style={{
          padding: 16,
          marginBottom: 16,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          background: 'var(--warning-bg, #fff7e6)',
        }}
      >
        <Info size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
          Esta vista es solo de consulta. La API todavía no tiene endpoints para crear, editar o
          eliminar barberos (solo existe <code>GET /api/barbers</code>); habrá que agregarlos al
          backend cuando se necesite dar de alta barberos desde aquí.
        </p>
      </div>

      <div className="table-wrap" style={{ padding: 16, marginBottom: 16 }}>
        <div className="form-field" style={{ marginBottom: 0, maxWidth: 260 }}>
          <label htmlFor="filtro-sucursal">Filtrar por sucursal</label>
          <select id="filtro-sucursal" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
            <option value="">Todas las sucursales</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Sucursal</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  Cargando barberos...
                </td>
              </tr>
            ) : barbers.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  No hay barberos que coincidan con el filtro.
                </td>
              </tr>
            ) : (
              barbers.map((b) => (
                <tr key={b.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={b.avatar}
                      alt={b.name}
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    {b.name}
                  </td>
                  <td>{b.branchName || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminBarbersPage;
