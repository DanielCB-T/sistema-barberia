// src/Pages/BranchesPage.jsx
import { useEffect, useState } from 'react';
import { catalog } from '../api/mockApi';
import BranchCard from '../components/BranchCard';

function BranchesPage() {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    catalog.listBranches().then(setBranches);
  }, []);

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Sucursales</h1>
      </div>
      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {branches.map((b) => (
          <BranchCard key={b.id} branch={b} />
        ))}
      </div>
    </div>
  );
}

export default BranchesPage;
