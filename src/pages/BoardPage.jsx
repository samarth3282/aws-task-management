import { useEffect, useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    useDraggable
} from '@dnd-kit/core';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useWorkspace } from '../context/WorkspaceContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import './BoardPage.css';

const COLUMNS = [
    { key: 'TODO',        label: 'To Do',       cls: 'board-col-todo' },
    { key: 'IN_PROGRESS', label: 'In Progress',  cls: 'board-col-progress' },
    { key: 'DONE',        label: 'Done',         cls: 'board-col-done' },
];

// Each column is a drop target; `isOver` highlights it while a card hovers above
function DroppableColumn({ id, children }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={`board-column-body ${isOver ? 'dragging-over' : ''}`}
        >
            {children}
        </div>
    );
}

// Each task card is a draggable; it fades while being dragged (the DragOverlay shows the ghost)
function DraggableCard({ task, assigneeEmail, onClick }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: task.taskId,
        data: { task }
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{ opacity: isDragging ? 0.35 : 1, cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            <TaskCard task={task} assigneeEmail={assigneeEmail} onClick={onClick} />
        </div>
    );
}

export default function BoardPage() {
    const { activeWorkspaceId, activeWorkspace, loading: workspaceLoading } = useWorkspace();
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [modalState, setModalState] = useState(null); // { mode: 'create' | 'edit', task?, initialStatus? }
    const [activeTask, setActiveTask] = useState(null); // task currently being dragged (for DragOverlay)

    // 8px movement required before a drag starts — prevents accidental drags when clicking a card
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const memberMap = useMemo(
        () => Object.fromEntries(members.map(m => [m.userId, m.email])),
        [members]
    );

    const loadBoard = async () => {
        if (!activeWorkspaceId) { setTasks([]); setLoading(false); return; }
        setLoading(true);
        try {
            const [{ tasks }, { members }] = await Promise.all([
                api.listTasks(activeWorkspaceId),
                api.listMembers(activeWorkspaceId)
            ]);
            setTasks(tasks);
            setMembers(members);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBoard(); }, [activeWorkspaceId]);

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
        const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
        return matchesSearch && matchesPriority;
    });

    const tasksByStatus = (status) => filteredTasks.filter(t => t.status === status);

    const handleDragStart = ({ active }) => {
        setActiveTask(tasks.find(t => t.taskId === active.id) || null);
    };

    const handleDragEnd = async ({ active, over }) => {
        setActiveTask(null);
        if (!over) return;

        const task = tasks.find(t => t.taskId === active.id);
        if (!task) return;

        const newStatus = over.id; // droppable IDs are the column keys: TODO / IN_PROGRESS / DONE
        if (task.status === newStatus) return;

        const previousTasks = tasks;

        // Optimistic update — card moves instantly; rolls back only if the API call fails
        setTasks(prev => prev.map(t => t.taskId === active.id ? { ...t, status: newStatus } : t));

        try {
            await api.updateTask(activeWorkspaceId, task.taskId, {
                title: task.title,
                description: task.description,
                priority: task.priority,
                dueDate: task.dueDate,
                assigneeId: task.assigneeId,
                status: newStatus
            });
        } catch (err) {
            setTasks(previousTasks);
            toast.error(err.message);
        }
    };

    const handleTaskSaved = () => {
        setModalState(null);
        loadBoard();
    };

    if (workspaceLoading) return <div className="board-loading">Loading…</div>;

    if (!activeWorkspaceId) {
        return (
            <div className="empty-state">
                <h3>No workspace selected yet</h3>
                <p>Create your first workspace from the sidebar to start adding tasks.</p>
            </div>
        );
    }

    return (
        <div className="board-page">
            {/* Header */}
            <div className="board-header">
                <div>
                    <div className="board-breadcrumb">
                        <span className="board-breadcrumb-label">Workspace</span>
                        <span className="board-breadcrumb-sep">›</span>
                        <h1 className="board-workspace-name">{activeWorkspace?.name}</h1>
                    </div>
                    {activeWorkspace?.description && (
                        <p className="board-subtitle">{activeWorkspace.description}</p>
                    )}
                </div>

                <div className="board-toolbar">
                    <div className="board-search">
                        <Search size={15} strokeWidth={1.5} />
                        <input
                            placeholder="Search tasks…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="board-filter-select"
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value)}
                    >
                        <option value="ALL">All priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                    <button
                        className="btn btn-primary"
                        onClick={() => setModalState({ mode: 'create', initialStatus: 'TODO' })}
                    >
                        <Plus size={15} strokeWidth={1.5} /> New Task
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="board-loading">Loading tasks…</div>
            ) : (
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="board-columns">
                        {COLUMNS.map(col => (
                            <div className={`board-column ${col.cls}`} key={col.key}>
                                <div className="board-column-header">
                                    <span>{col.label}</span>
                                    <span className="board-column-count">{tasksByStatus(col.key).length}</span>
                                    <button
                                        className="btn btn-ghost board-column-add"
                                        onClick={() => setModalState({ mode: 'create', initialStatus: col.key })}
                                        title={`Add task to ${col.label}`}
                                    >
                                        <Plus size={16} strokeWidth={1.5} />
                                    </button>
                                </div>
                                <DroppableColumn id={col.key}>
                                    {tasksByStatus(col.key).map(task => (
                                        <DraggableCard
                                            key={task.taskId}
                                            task={task}
                                            assigneeEmail={memberMap[task.assigneeId]}
                                            onClick={() => setModalState({ mode: 'edit', task })}
                                        />
                                    ))}
                                    {tasksByStatus(col.key).length === 0 && (
                                        <div className="board-column-empty">No tasks</div>
                                    )}
                                </DroppableColumn>
                            </div>
                        ))}
                    </div>

                    {/* DragOverlay renders in a body-level portal — immune to any overflow clipping */}
                    <DragOverlay>
                        {activeTask && (
                            <div style={{ transform: 'rotate(2deg)', cursor: 'grabbing' }}>
                                <TaskCard
                                    task={activeTask}
                                    assigneeEmail={memberMap[activeTask.assigneeId]}
                                    onClick={() => {}}
                                />
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            )}

            {modalState && (
                <TaskModal
                    mode={modalState.mode}
                    task={modalState.task}
                    initialStatus={modalState.initialStatus}
                    workspaceId={activeWorkspaceId}
                    members={members}
                    onClose={() => setModalState(null)}
                    onSaved={handleTaskSaved}
                />
            )}
        </div>
    );
}