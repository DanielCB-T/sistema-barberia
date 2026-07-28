// src/components/ProductCard.jsx
import { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { cart } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function ProductCard({ product, onAdded }) {
  const { user } = useAuth();
  const { push } = useToast();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const outOfStock = product.stock <= 0;

  const handleAdd = async () => {
    if (!user) return;
    setAdding(true);
    const res = await cart.addItem(user.id, product.id, qty);
    setAdding(false);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push(`${product.name} agregado al carrito.`, 'success');
    setQty(1);
    onAdded?.(res.cart);
  };

  return (
    <div className="info-card">
      <img className="info-card__image" src={product.image} alt={product.name} />
      <div className="info-card__body">
        <span className="info-card__title">{product.name}</span>
        <p className="info-card__desc">{product.description}</p>
        <div className="info-card__footer">
          <span className="info-card__price">${product.price.toFixed(2)}</span>
          <span style={{ fontSize: '0.78rem', color: outOfStock ? 'var(--danger)' : 'var(--muted)' }}>
            {outOfStock ? 'Sin existencias' : `${product.stock} disponibles`}
          </span>
        </div>
        <div className="qty-control">
          <button
            type="button"
            className="qty-control__btn"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock || qty <= 1}
            aria-label="Disminuir cantidad"
          >
            <Minus size={14} />
          </button>
          <span className="qty-control__value">{qty}</span>
          <button
            type="button"
            className="qty-control__btn"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            disabled={outOfStock || qty >= product.stock}
            aria-label="Aumentar cantidad"
          >
            <Plus size={14} />
          </button>
        </div>
        <button
          type="button"
          className="btn btn--accent btn--block btn--sm"
          onClick={handleAdd}
          disabled={outOfStock || adding}
        >
          <ShoppingCart size={16} /> {adding ? 'Agregando...' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
