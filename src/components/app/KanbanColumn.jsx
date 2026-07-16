import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard.jsx";

const META = {
  TODO: { label: "To do", accent: "var(--slate-400)" },
  IN_PROGRESS: { label: "In progress", accent: "var(--amber-400)" },
  DONE: { label: "Done", accent: "var(--teal-400)" },
};

export default function KanbanColumn({ status, tasks, onOpenTask, onAddTask, membersById }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = META[status];

  return (
    <div className={`kanban-col ${isOver ? "kanban-col--over" : ""}`} ref={setNodeRef}>
      <div className="kanban-col__head">
        <span className="kanban-col__dot" style={{ background: meta.accent }} />
        <h3>{meta.label}</h3>
        <span className="kanban-col__count">{tasks.length}</span>
      </div>

      <div className="kanban-col__list">
        {tasks.map((task) => (
          <TaskCard key={task.taskId} task={task} onOpen={onOpenTask} membersById={membersById} />
        ))}
        {tasks.length === 0 && <p className="kanban-col__empty">Nothing here yet</p>}
      </div>

      <button type="button" className="kanban-col__add" onClick={() => onAddTask(status)}>
        <Plus size={14} /> Add task
      </button>
    </div>
  );
}
