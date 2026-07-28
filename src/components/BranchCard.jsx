// src/components/BranchCard.jsx
import { MapPin, Phone, Clock } from 'lucide-react';

function BranchCard({ branch }) {
  return (
    <div className="branch-card">
      <img className="branch-card__image" src={branch.image} alt={branch.name} />
      <div className="branch-card__body">
        <span className="info-card__title" style={{ fontSize: '1.05rem' }}>
          {branch.name}
        </span>
        <div className="branch-card__row">
          <MapPin size={15} /> {branch.address}
        </div>
        <div className="branch-card__row">
          <Phone size={15} /> {branch.phone}
        </div>
        <div className="branch-card__row">
          <Clock size={15} /> {branch.hours}
        </div>
      </div>
    </div>
  );
}

export default BranchCard;
