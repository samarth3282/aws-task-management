import { isPast, isToday, format } from 'date-fns';
import { Calendar, AlertTriangle } from 'lucide-react';

export default function TaskCard({ task, assigneeEmail, onClick }) {
    const overdue =
        task.dueDate &&
        task.status !== 'DONE' &&
        isPast(new Date(task.dueDate)) &&
        !isToday(new Date(task.dueDate));

    const priorityKey = (task.priority || 'MEDIUM').toLowerCase();

    return (
        <button className="task-card" onClick={onClick}>
            {/* 4px left priority bar */}
            <span className={`task-card-priority-bar ${priorityKey}`} />

            {/* Badge row */}
            <div className="task-card-top">
                <span className={`badge badge-${priorityKey}`}>{task.priority}</span>
            </div>

            {/* Title */}
            <div className="task-card-title">{task.title}</div>

            {/* Footer: due date + assignee */}
            {(task.dueDate || assigneeEmail) && (
                <div className="task-card-footer">
                    {task.dueDate ? (
                        <div className={`task-card-due ${overdue ? 'overdue' : ''}`}>
                            {overdue
                                ? <><AlertTriangle size={12} strokeWidth={1.5} /> Overdue · {format(new Date(task.dueDate), 'MMM d')}</>
                                : <><Calendar size={12} strokeWidth={1.5} /> {format(new Date(task.dueDate), 'MMM d')}</>
                            }
                        </div>
                    ) : <span />}

                    {assigneeEmail && (
                        <div className="task-card-avatar" title={assigneeEmail}>
                            {assigneeEmail[0].toUpperCase()}
                        </div>
                    )}
                </div>
            )}
        </button>
    );
}