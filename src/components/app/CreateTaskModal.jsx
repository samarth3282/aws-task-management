import { useState } from "react";
import Modal from "./Modal.jsx";
import * as api from "../../lib/api";
import { useToast } from "../../hooks/useToast.jsx";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export default function CreateTaskModal({ open, onClose, workspaceId, defaultStatus, members, onCreated }) {
  const { notify } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [busy, setBusy] = useState(false);

  function reset() {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
    setAssigneeId("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const fields = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status: defaultStatus,
        dueDate: dueDate || null,
        assigneeId: assigneeId || null,
      };
      // CreateTask's Lambda only returns { taskId } — build the full task
      // object locally from what we just submitted so the card renders
      // immediately instead of waiting on a refetch.
      const { taskId } = await api.createTask(workspaceId, fields);
      onCreated?.({ taskId, workspaceId, ...fields, createdAt: new Date().toISOString() });
      notify("Task created.", "success");
      reset();
      onClose();
    } catch (err) {
      notify(err.message || "Couldn't create the task.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`New task · ${statusLabel(defaultStatus)}`} width={480}>
      <form className="auth__form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Write the migration doc" autoFocus required />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            className="field__textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details"
            rows={3}
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Due date *</span>
            <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
        </div>

        <label className="field">
          <span>Assignee *</span>
          <select required value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="" disabled>Select assignee</option>
            {members?.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name || m.email}
              </option>
            ))}
          </select>
        </label>

        <button className="btn btn--amber btn--block" type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create task"}
        </button>
      </form>
    </Modal>
  );
}

function statusLabel(status) {
  return { TODO: "To do", IN_PROGRESS: "In progress", DONE: "Done" }[status] || status;
}
