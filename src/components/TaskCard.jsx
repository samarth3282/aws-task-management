import { isPast, isToday, format } from 'date-fns';
import './TaskModal.css'; // shares the badge + avatar styles below

function initials(email) {
    if (!email) return '?';
    return email[0].toUpperCase();
}

export default function TaskCard({ task, assigneeEmail, onClick }) {
    const overdue = task.dueDate && task.status !== 'DONE' && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

    return (
        <button className="task-card" onClick={onClick}>
            <div className="task-card-top">
                <span className={`badge badge-${task.priority?.toLowerCase() || 'medium'}`}>{task.priority}</span>
                {assigneeEmail && <span className="task-card-avatar" title={assigneeEmail}>{initials(assigneeEmail)}</span>}
            </div>
            <div className="task-card-title">{task.title}</div>
            {task.dueDate && (
                <div className={`task-card-due ${overdue ? 'overdue' : ''}`}>
                    {overdue ? 'Overdue · ' : 'Due '}{format(new Date(task.dueDate), 'MMM d')}
                </div>
            )}
        </button>
    );
}