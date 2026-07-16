import Modal from "./Modal.jsx";

export default function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = "Delete", busy = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={380}>
      <p className="confirm__body">{body}</p>
      <div className="confirm__actions">
        <button type="button" className="btn btn--outline" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
