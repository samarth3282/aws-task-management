import { useState } from "react";
import Modal from "./Modal.jsx";
import { useWorkspace } from "../../hooks/useWorkspace.jsx";
import { useToast } from "../../hooks/useToast.jsx";

export default function CreateWorkspaceModal({ open, onClose }) {
  const { createWorkspace } = useWorkspace();
  const { notify } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await createWorkspace(name.trim(), description.trim());
      notify(`${name.trim()} is ready.`, "success");
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      notify(err.message || "Couldn't create the workspace.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New workspace">
      <form className="auth__form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Labs" autoFocus required />
        </label>
        <label className="field">
          <span>Description (optional)</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this workspace for?"
          />
        </label>
        <button className="btn btn--amber btn--block" type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create workspace"}
        </button>
      </form>
    </Modal>
  );
}
