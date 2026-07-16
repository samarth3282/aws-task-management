import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY_ACCENT = { LOW: "var(--slate-400)", MEDIUM: "var(--amber-400)", HIGH: "var(--red-400)" };

export default function TaskCard({ task, onOpen, membersById }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.taskId,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    borderLeftColor: PRIORITY_ACCENT[task.priority] || PRIORITY_ACCENT.MEDIUM,
  };

  const assignee = task.assigneeId ? membersById?.[task.assigneeId] : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="task-card"
      {...listeners}
      {...attributes}
      onClick={() => onOpen(task)}
    >
      <div className="task-card__top">
        <span className="task-card__ref">{shortId(task.taskId)}</span>
        {task.priority && <span className={`task-card__priority task-card__priority--${task.priority.toLowerCase()}`}>{task.priority}</span>}
      </div>
      <p className="task-card__title">{task.title}</p>
      <div className="task-card__foot">
        {task.dueDate ? <span className="task-card__due">{formatDate(task.dueDate)}</span> : <span />}
        {assignee && <span className="task-card__avatar" title={assignee.name || assignee.email}>{initials(assignee.name || assignee.email)}</span>}
      </div>
    </div>
  );
}

export function shortId(taskId = "") {
  return `TSK-${taskId.slice(-4).toUpperCase()}`;
}

export function initials(text = "") {
  return text
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
