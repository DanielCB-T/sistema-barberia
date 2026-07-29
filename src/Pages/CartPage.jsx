// src/Pages/CartPage.jsx
import { useEffect, useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { cart as cartApi, orders as ordersApi } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function CartPage() {
  const { user } = useAuth();
  const { push } = useToast();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [checkingOut, setCheckingOut] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const load = () => {
    setLoading(true);
    cartApi.get(user.id).then((c) => {
      setCartData(c);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQtyChange = async (itemId, quantity) => {
    if (quantity < 1) return;
    const res = await cartApi.updateItem(user.id, itemId, quantity);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    setCartData(res.cart);
  };

  const handleRemove = async (itemId) => {
    const res = await cartApi.removeItem(user.id, itemId);
    if (res.ok) setCartData(res.cart);
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    const res = await ordersApi.checkout(user.id, paymentMethod);
    setCheckingOut(false);
    if (!res.ok) {
      push(res.error, 'error');
      return;
    }
    push('¡Tu orden fue generada correctamente!', 'success');
    setLastOrder(res.order);
    load();
  };

  if (loading) {
    return <div className="content__header"><h1 className="content__title">Carrito</h1></div>;
  }

  const items = cartData?.items || [];

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Carrito</h1>
      </div>

      {lastOrder && (
        <div className="receipt-box" style={{ marginBottom: 18 }}>
          Orden #{lastOrder.id} generada por ${lastOrder.total.toFixed(2)} ·{' '}
          {lastOrder.paymentMethod === 'online' ? 'Pago en línea' : 'Pago en sucursal'}
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={32} style={{ marginBottom: 10, opacity: 0.6 }} />
          <h3>Tu carrito está vacío</h3>
          <p>Agrega productos desde la sección de Productos.</p>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <div className="cart-row" key={item.id}>
              <img className="cart-row__image" src={item.productImage} alt={item.productName} />
              <div className="cart-row__body">
                <div className="cart-row__name">{item.productName}</div>
                <div className="cart-row__price">${item.unitPrice.toFixed(2)} c/u</div>
                <div className="qty-control">
                  <button
                    type="button"
                    className="qty-control__btn"
                    onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label="Disminuir cantidad"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="qty-control__value">{item.quantity}</span>
                  <button
                    type="button"
                    className="qty-control__btn"
                    onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <span className="cart-row__subtotal">${(item.unitPrice * item.quantity).toFixed(2)}</span>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => handleRemove(item.id)}
                aria-label="Quitar del carrito"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <div className="cart-summary">
            <div className="cart-summary__total">
              <span>Total</span>
              <span>${cartData.total.toFixed(2)}</span>
            </div>

            <div className="form-field">
              <label>Método de pago</label>
              <div className="payment-method-pick">
                <button
                  type="button"
                  className={`service-pick ${paymentMethod === 'online' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('online')}
                >
                  <strong>Pago en línea</strong>
                  <span>Tarjeta de crédito o débito</span>
                </button>
                <button
                  type="button"
                  className={`service-pick ${paymentMethod === 'en_sucursal' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('en_sucursal')}
                >
                  <strong>En sucursal</strong>
                  <span>Pagas al recoger</span>
                </button>
              </div>
            </div>

            <button className="btn btn--accent btn--block" onClick={handleCheckout} disabled={checkingOut}>
              {checkingOut ? 'Generando orden...' : 'Generar orden'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
