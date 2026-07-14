// src/components/ConfirmModal.jsx
import Modal from './Modal';

function ConfirmModal({ title, message, confirmLabel = 'Confirmar', danger, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ color: 'var(--muted)', marginBottom: 8 }}>{message}</p>
      <div className="modal__footer">
        <button className="btn btn--ghost" onClick={onClose}>
          Volver
        </button>
        <button className={`btn ${danger ? 'btn--danger' : 'btn--accent'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
