import { useEffect, useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useWorkspace } from '../context/WorkspaceContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import './BoardPage.css';

const COLUMNS = [
    { key: 'TODO', label: 'To Do' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'DONE', label: 'Done' }
];

export default function BoardPage() {
    const { activeWorkspaceId, activeWorkspace, loading: workspaceLoading } = useWorkspace();
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [modalState, setModalState] = useState(null); // { mode: 'create' | 'edit', task?, initialStatus? }

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

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination || destination.droppableId === source.droppableId) return;

        const task = tasks.find(t => t.taskId === draggableId);
        if (!task) return;

        const newStatus = destination.droppableId;
        const previousTasks = tasks;

        // Optimistic update — the card moves instantly, before the network call resolves
        setTasks(prev => prev.map(t => t.taskId === draggableId ? { ...t, status: newStatus } : t));

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
            setTasks(previousTasks); // roll back on failure
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
            <div className="board-header">
                <div>
                    <h1>{activeWorkspace?.name}</h1>
                    {activeWorkspace?.description && <p className="board-subtitle">{activeWorkspace.description}</p>}
                </div>
                <div className="board-toolbar">
                    <div className="board-search">
                        <Search size={15} />
                        <input placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                        <option value="ALL">All priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="board-loading">Loading tasks…</div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="board-columns">
                        {COLUMNS.map(col => (
                            <div className="board-column" key={col.key}>
                                <div className="board-column-header">
                                    <span>{col.label}</span>
                                    <span className="board-column-count">{tasksByStatus(col.key).length}</span>
                                    <button
                                        className="btn btn-ghost board-column-add"
                                        onClick={() => setModalState({ mode: 'create', initialStatus: col.key })}
                                        title={`Add task to ${col.label}`}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <Droppable droppableId={col.key}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`board-column-body ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                                        >
                                            {tasksByStatus(col.key).map((task, index) => (
                                                <Draggable draggableId={task.taskId} index={index} key={task.taskId}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={snapshot.isDragging ? 'dragging' : ''}
                                                        >
                                                            <TaskCard
                                                                task={task}
                                                                assigneeEmail={memberMap[task.assigneeId]}
                                                                onClick={() => setModalState({ mode: 'edit', task })}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {tasksByStatus(col.key).length === 0 && (
                                                <div className="board-column-empty">No tasks</div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
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