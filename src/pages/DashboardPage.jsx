import { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { isPast, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useWorkspace } from '../context/WorkspaceContext';
import './DashboardPage.css';

const STATUS_COLORS = { TODO: '#94a3b8', IN_PROGRESS: '#d97706', DONE: '#16a34a' };
const PRIORITY_COLORS = { LOW: '#16a34a', MEDIUM: '#d97706', HIGH: '#dc2626' };

export default function DashboardPage() {
    const { activeWorkspaceId, activeWorkspace } = useWorkspace();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!activeWorkspaceId) return;
        setLoading(true);
        api.listTasks(activeWorkspaceId)
            .then(({ tasks }) => setTasks(tasks))
            .catch(err => toast.error(err.message))
            .finally(() => setLoading(false));
    }, [activeWorkspaceId]);

    const stats = useMemo(() => {
        const byStatus = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
        const byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0 };
        let overdue = 0;

        tasks.forEach(t => {
            if (byStatus[t.status] !== undefined) byStatus[t.status]++;
            if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
            if (t.dueDate && t.status !== 'DONE' && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))) overdue++;
        });

        return {
            total: tasks.length,
            byStatus,
            byPriority,
            overdue,
            statusData: Object.entries(byStatus).map(([status, value]) => ({ status, value })),
            priorityData: Object.entries(byPriority).map(([priority, value]) => ({ priority, value }))
        };
    }, [tasks]);

    if (!activeWorkspaceId) return <div className="empty-state"><h3>No workspace selected</h3></div>;
    if (loading) return <div className="board-loading">Crunching numbers…</div>;

    return (
        <div>
            <h1>Dashboard</h1>
            <p className="board-subtitle">Overview of {activeWorkspace?.name}.</p>

            <div className="stat-cards">
                <div className="stat-card"><span className="stat-number">{stats.total}</span><span className="stat-label">Total tasks</span></div>
                <div className="stat-card"><span className="stat-number">{stats.byStatus.IN_PROGRESS}</span><span className="stat-label">In progress</span></div>
                <div className="stat-card"><span className="stat-number">{stats.byStatus.DONE}</span><span className="stat-label">Completed</span></div>
                <div className="stat-card stat-card-danger"><span className="stat-number">{stats.overdue}</span><span className="stat-label">Overdue</span></div>
            </div>

            <div className="chart-grid">
                <div className="chart-card">
                    <h3>Tasks by status</h3>
                    {stats.total === 0 ? (
                        <div className="empty-state">No tasks yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={stats.statusData} dataKey="value" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={3}>
                                    {stats.statusData.map(d => <Cell key={d.status} fill={STATUS_COLORS[d.status]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="chart-card">
                    <h3>Tasks by priority</h3>
                    {stats.total === 0 ? (
                        <div className="empty-state">No tasks yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={stats.priorityData}>
                                <XAxis dataKey="priority" fontSize={12} />
                                <YAxis allowDecimals={false} fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {stats.priorityData.map(d => <Cell key={d.priority} fill={PRIORITY_COLORS[d.priority]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}