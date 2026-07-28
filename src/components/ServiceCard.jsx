// src/components/ServiceCard.jsx

function ServiceCard({ service, onBook }) {
  return (
    <div className="info-card">
      <img className="info-card__image" src={service.image} alt={service.name} />
      <div className="info-card__body">
        <span className="info-card__title">{service.name}</span>
        <p className="info-card__desc">{service.description}</p>
        <div className="info-card__footer">
          <span className="info-card__price">${service.price.toFixed(2)}</span>
          {onBook && (
            <button className="btn btn--primary btn--sm" onClick={() => onBook(service)}>
              Agendar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;
