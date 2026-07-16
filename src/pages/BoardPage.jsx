import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "../hooks/useWorkspace.jsx";
import { useToast } from "../hooks/useToast.jsx";
import * as api from "../lib/api";
import { withViewTransition } from "../lib/transition.js";
import KanbanBoard from "../components/app/KanbanBoard.jsx";
import CreateTaskModal from "../components/app/CreateTaskModal.jsx";
import TaskDetailPanel from "../components/app/TaskDetailPanel.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";

export default function BoardPage() {
  const { active } = useWorkspace();
  const { notify } = useToast();

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createStatus, setCreateStatus] = useState(null);
  const [openTask, setOpenTask] = useState(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);

    Promise.all([api.getTasks(active.workspaceId), api.getWorkspaceMembers(active.workspaceId)])
      .then(([taskList, memberList]) => {
        if (cancelled) return;
        setTasks(taskList);
        setMembers(memberList);
      })
      .catch((err) => !cancelled && notify(err.message || "Couldn't load the board.", "error"))
      .finally(() => !cancelled && withViewTransition(() => setLoading(false)));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.workspaceId]);

  const membersById = useMemo(() => Object.fromEntries(members.map((m) => [m.userId, m])), [members]);

  if (loading) {
    return (
      <div className="page">
        <header className="page__head">
          <div>
            <h1>{active.name}</h1>
            {active.description && <p>{active.description}</p>}
          </div>
        </header>

        <div className="kanban">
          {["To do", "In progress", "Done"].map((col) => (
            <div key={col} className="kanban-col">
              <div className="kanban-col__head">
                <Skeleton style={{ width: 7, height: 7, borderRadius: '50%' }} />
                <h3 style={{ color: 'var(--text-500)' }}>{col}</h3>
                <Skeleton style={{ height: 18, width: 24, marginLeft: 'auto', borderRadius: 999 }} />
              </div>
              <div className="kanban-col__list">
                <Skeleton style={{ height: 100, borderRadius: 10 }} />
                <Skeleton style={{ height: 100, borderRadius: 10, opacity: 0.6 }} />
                <Skeleton style={{ height: 100, borderRadius: 10, opacity: 0.3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>{active.name}</h1>
          {active.description && <p>{active.description}</p>}
        </div>
      </header>

      <KanbanBoard
        workspaceId={active.workspaceId}
        tasks={tasks}
        setTasks={setTasks}
        onOpenTask={setOpenTask}
        onAddTask={setCreateStatus}
        membersById={membersById}
      />

      <CreateTaskModal
        open={!!createStatus}
        onClose={() => setCreateStatus(null)}
        workspaceId={active.workspaceId}
        defaultStatus={createStatus}
        members={members}
        onCreated={(task) => setTasks((t) => [...t, task])}
      />

      {openTask && (
        <TaskDetailPanel
          task={openTask}
          workspaceId={active.workspaceId}
          members={members}
          onClose={() => setOpenTask(null)}
          onUpdated={(updated) => {
            setTasks((t) => t.map((x) => (x.taskId === updated.taskId ? updated : x)));
            setOpenTask(updated);
          }}
          onDeleted={(taskId) => {
            setTasks((t) => t.filter((x) => x.taskId !== taskId));
            setOpenTask(null);
          }}
        />
      )}
    </div>
  );
}
