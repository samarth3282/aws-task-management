import { useState } from "react";
import Modal from "./Modal.jsx";
import * as api from "../../lib/api";
import { useToast } from "../../hooks/useToast.jsx";

export default function InviteMemberModal({ open, onClose, workspaceId, onInvited }) {
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await api.inviteMember(workspaceId, email.trim());
      notify(`Invited ${email.trim()}.`, "success");
      onInvited?.();
      setEmail("");
      onClose();
    } catch (err) {
      notify(err.message || "Couldn't send that invite.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite a teammate" width={420}>
      <form className="auth__form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@company.com"
            autoFocus
            required
          />
          <small>They need an existing TaskFlow account</small>
        </label>
        <button className="btn btn--amber btn--block" type="submit" disabled={busy}>
          {busy ? "Sending..." : "Send invite"}
        </button>
      </form>
    </Modal>
  );
}
