import { useEffect, useState } from 'react';
import { X, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { api } from '../api';

export default function TaskModal({ mode, task, initialStatus, workspaceId, members, onClose, onSaved }) {
    const isEdit = mode === 'edit';

    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [priority, setPriority] = useState(task?.priority || 'MEDIUM');
    const [dueDate, setDueDate] = useState(task?.dueDate || '');
    const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '');
    const [saving, setSaving] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(isEdit);
    const [newComment, setNewComment] = useState('');
    const [postingComment, setPostingComment] = useState(false);

    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                const { comments } = await api.listComments(workspaceId, task.taskId);
                setComments(comments);
            } catch (err) {
                toast.error(err.message);
            } finally {
                setCommentsLoading(false);
            }
        })();
    }, [isEdit, task, workspaceId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return toast.error('Title is required');
        setSaving(true);
        try {
            if (isEdit) {
                await api.updateTask(workspaceId, task.taskId, {
                    title, description, priority, dueDate, assigneeId, status: task.status
                });
                toast.success('Task updated');
            } else {
                await api.createTask(workspaceId, {
                    title, description, priority, dueDate, assigneeId, status: initialStatus || 'TODO'
                });
                toast.success('Task created');
            }
            onSaved();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmingDelete) {
            setConfirmingDelete(true);
            setTimeout(() => setConfirmingDelete(false), 3000);
            return;
        }
        try {
            await api.deleteTask(workspaceId, task.taskId);
            toast.success('Task deleted');
            onSaved();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setPostingComment(true);
        try {
            await api.addComment(workspaceId, task.taskId, newComment.trim());
            setNewComment('');
            const { comments } = await api.listComments(workspaceId, task.taskId);
            setComments(comments);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setPostingComment(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEdit ? 'Task details' : 'New task'}</h2>
                    <button className="btn btn-ghost" onClick={onClose}><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="field">
                        <label>Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" autoFocus />
                    </div>

                    <div className="field">
                        <label>Description</label>
                        <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="What needs to happen?" />
                    </div>

                    <div className="modal-field-row">
                        <div className="field">
                            <label>Priority</label>
                            <select value={priority} onChange={e => setPriority(e.target.value)}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                        <div className="field">
                            <label>Due date</label>
                            <input type="date" value={dueDate ? dueDate.slice(0, 10) : ''} onChange={e => setDueDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="field">
                        <label>Assignee</label>
                        <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                            <option value="">Unassigned</option>
                            {members.map(m => (
                                <option key={m.userId} value={m.userId}>{m.email}</option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        {isEdit && (
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>
                                <Trash2 size={15} /> {confirmingDelete ? 'Click again to confirm' : 'Delete task'}
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
                        </button>
                    </div>
                </form>

                {isEdit && (
                    <div className="modal-comments">
                        <h3>Comments</h3>
                        {commentsLoading ? (
                            <div className="modal-comments-loading">Loading comments…</div>
                        ) : (
                            <div className="modal-comments-list">
                                {comments.length === 0 && <div className="modal-comments-empty">No comments yet — start the conversation.</div>}
                                {comments.map(c => (
                                    <div className="comment" key={c.commentId}>
                                        <div className="comment-meta">
                                            <strong>{c.authorEmail || 'Unknown'}</strong>
                                            <span>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                                        </div>
                                        <p>{c.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <form className="modal-comment-form" onSubmit={handleAddComment}>
                            <input
                                placeholder="Write a comment…"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" disabled={postingComment}>
                                <Send size={15} />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}