import { useMemo, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import KanbanColumn from "./KanbanColumn.jsx";
import TaskCard from "./TaskCard.jsx";
import * as api from "../../lib/api";
import { useToast } from "../../hooks/useToast.jsx";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

export default function KanbanBoard({ workspaceId, tasks, setTasks, onOpenTask, onAddTask, membersById }) {
  const { notify } = useToast();
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const byStatus = useMemo(() => {
    const grouped = { TODO: [], IN_PROGRESS: [], DONE: [] };
    for (const t of tasks) (grouped[t.status] || grouped.TODO).push(t);
    return grouped;
  }, [tasks]);

  function handleDragStart(event) {
    setActiveTask(event.active.data.current?.task || null);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const task = active.data.current?.task;
    const newStatus = over.id;
    if (!task || task.status === newStatus) return;

    const previous = tasks;
    const updated = { ...task, status: newStatus };
    setTasks((ts) => ts.map((t) => (t.taskId === task.taskId ? updated : t)));

    try {
      await api.updateTask(workspaceId, task.taskId, updated);
    } catch (err) {
      setTasks(previous);
      notify(err.message || "Couldn't move that task - reverted.", "error");
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="kanban">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={byStatus[status]}
            onOpenTask={onOpenTask}
            onAddTask={onAddTask}
            membersById={membersById}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} onOpen={() => { }} membersById={membersById} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
