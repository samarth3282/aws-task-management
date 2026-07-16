import { useEffect, useState } from "react";
import { X, Trash2, Send } from "lucide-react";
import * as api from "../../lib/api";
import { useToast } from "../../hooks/useToast.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useLiquidGlass } from "../../hooks/useLiquidGlass.jsx";
import { Skeleton } from "../ui/Skeleton.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import { initials, formatDate, shortId } from "./TaskCard.jsx";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const STATUSES = [
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

export default function TaskDetailPanel({ task, workspaceId, members, onClose, onUpdated, onDeleted }) {
  const { notify } = useToast();
  const { user } = useAuth();
  const panelRef = useRef(null);
  useLiquidGlass(panelRef, !!task, { scale: -90, border: 0.05, blur: 12 });
  const [draft, setDraft] = useState(task);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setDraft(task);
    setDirty(false);
  }, [task]);

  useEffect(() => {
    let cancelled = false;
    setLoadingComments(true);
    api
      .getComments(workspaceId, task.taskId)
      .then((list) => !cancelled && setComments(list))
      .catch(() => !cancelled && notify("Couldn't load comments.", "error"))
      .finally(() => !cancelled && setLoadingComments(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.taskId]);

  function update(key, value) {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateTask(workspaceId, task.taskId, draft);
      onUpdated(draft);
      setDirty(false);
      notify("Saved.", "success");
    } catch (err) {
      notify(err.message || "Couldn't save changes.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.deleteTask(workspaceId, task.taskId);
      onDeleted(task.taskId);
      notify("Task deleted.", "success");
    } catch (err) {
      notify(err.message || "Couldn't delete the task.", "error");
      setDeleting(false);
    }
  }

  async function handlePostComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPostingComment(true);
    try {
      const { commentId, createdAt } = await api.createComment(workspaceId, task.taskId, commentText.trim());
      setComments((c) => [
        ...c,
        {
          commentId,
          createdAt,
          text: commentText.trim(),
          authorEmail: user?.signInDetails?.loginId || user?.username || "",
        },
      ]);
      setCommentText("");
    } catch (err) {
      notify(err.message || "Couldn't post that comment.", "error");
    } finally {
      setPostingComment(false);
    }
  }

  return (
    <>
      <div className="panel-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <aside ref={panelRef} className="panel liquid-glass-surface" role="dialog" aria-modal="true" aria-label="Task detail">
          <div className="panel__head">
            <span className="panel__ref">{shortId(task.taskId)}</span>
            <div className="panel__head-actions">
              <button type="button" className="modal__close" onClick={() => setConfirmDelete(true)} aria-label="Delete task">
                <Trash2 size={17} />
              </button>
              <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="panel__body">
            <textarea
              className="panel__title-input"
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              rows={2}
            />

            <textarea
              className="field__textarea panel__desc"
              value={draft.description || ""}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Add a description..."
              rows={4}
            />

            <div className="panel__meta-grid">
              <label className="field">
                <span>Status</span>
                <select value={draft.status} onChange={(e) => update("status", e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Priority</span>
                <select value={draft.priority} onChange={(e) => update("priority", e.target.value)}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Due date</span>
                <input type="date" value={draft.dueDate ? draft.dueDate.slice(0, 10) : ""} onChange={(e) => update("dueDate", e.target.value)} />
              </label>

              <label className="field">
                <span>Assignee</span>
                <select value={draft.assigneeId || ""} onChange={(e) => update("assigneeId", e.target.value || null)}>
                  <option value="">Unassigned</option>
                  {members?.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name || m.email}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {dirty && (
              <button type="button" className="btn btn--amber btn--block" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            )}

            <div className="panel__divider" />

            <h4 className="panel__comments-title">Comments</h4>

            {loadingComments && (
              <div className="panel__comments">
                {[1, 2].map((i) => (
                  <div key={i} className="panel__comment">
                    <Skeleton style={{ width: 21, height: 21, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <Skeleton style={{ width: 120, height: 12, marginBottom: 6 }} />
                      <Skeleton style={{ width: '100%', height: 14 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loadingComments && comments.length === 0 && <p className="panel__muted">No comments yet.</p>}

            <div className="panel__comments">
              {comments.map((c) => (
                <div key={c.commentId} className="panel__comment">
                  <span className="task-card__avatar">{initials(c.authorEmail || c.authorId)}</span>
                  <div>
                    <p className="panel__comment-head">
                      {c.authorEmail || "Teammate"} <time>{formatDate(c.createdAt)}</time>
                    </p>
                    <p className="panel__comment-body">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form className="panel__comment-form" onSubmit={handlePostComment}>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
              />
              <button type="submit" className="panel__comment-send" disabled={postingComment} aria-label="Post comment">
                <Send size={15} />
              </button>
            </form>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete this task?"
        body={`"${task.title}" and its comments will be gone for good.`}
        busy={deleting}
      />
    </>
  );
}
