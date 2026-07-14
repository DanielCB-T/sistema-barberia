// src/components/ProductCard.jsx

function ProductCard({ product }) {
  return (
    <div className="info-card">
      <img className="info-card__image" src={product.image} alt={product.name} />
      <div className="info-card__body">
        <span className="info-card__title">{product.name}</span>
        <p className="info-card__desc">{product.description}</p>
        <div className="info-card__footer">
          <span className="info-card__price">${product.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
