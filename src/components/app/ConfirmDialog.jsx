import { useState, useEffect } from "react";
import Modal from "./Modal.jsx";

export default function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = "Delete", busy = false, requireMatch = null }) {
  const [matchText, setMatchText] = useState("");

  useEffect(() => {
    if (open) {
      setMatchText("");
    }
  }, [open]);

  const isMatched = requireMatch ? matchText === requireMatch : true;

  return (
    <Modal open={open} onClose={onClose} title={title} width={400}>
      <p className="confirm__body">{body}</p>
      
      {requireMatch && (
        <label className="field" style={{ marginTop: '16px', display: 'block' }}>
          <span style={{ fontSize: '13px', color: 'var(--red-400, #ef4444)', marginBottom: '8px', display: 'block', fontWeight: 500, lineHeight: 1.4 }}>
            This action is permanent and cannot be undone. Please type <strong style={{ color: 'var(--text-100)' }}>{requireMatch}</strong> to confirm.
          </span>
          <input
            type="text"
            value={matchText}
            onChange={(e) => setMatchText(e.target.value)}
            placeholder={requireMatch}
            style={{ width: '100%' }}
          />
        </label>
      )}

      <div className="confirm__actions" style={{ marginTop: '24px' }}>
        <button type="button" className="btn btn--outline" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button type="button" className="btn btn--amber" onClick={onConfirm} disabled={busy || !isMatched}>
          {busy ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
