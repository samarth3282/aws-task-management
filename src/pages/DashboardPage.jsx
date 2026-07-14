import { useEffect, useMemo, useState } from 'react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { isPast, isToday } from 'date-fns';
import { CheckSquare, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useWorkspace } from '../context/WorkspaceContext';
import './DashboardPage.css';

const STATUS_COLORS   = { TODO: '#E2E8F0', IN_PROGRESS: '#F59E0B', DONE: '#10B981' };
const PRIORITY_COLORS = { LOW: '#4B41E1', MEDIUM: '#645efb', HIGH: '#E11D48' };

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
        const byStatus   = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
        const byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0 };
        let overdue = 0;

        tasks.forEach(t => {
            if (byStatus[t.status]   !== undefined) byStatus[t.status]++;
            if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
            if (t.dueDate && t.status !== 'DONE' && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)))
                overdue++;
        });

        return {
            total: tasks.length,
            byStatus,
            byPriority,
            overdue,
            statusData:   Object.entries(byStatus).map(([status, value]) => ({ status, value })),
            priorityData: Object.entries(byPriority).map(([priority, value]) => ({ priority, value })),
        };
    }, [tasks]);

    if (!activeWorkspaceId) return <div className="empty-state"><h3>No workspace selected</h3></div>;
    if (loading)            return <div className="board-loading">Crunching numbers…</div>;

    return (
        <div>
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p className="dashboard-subtitle">
                        Real-time metrics for <strong>{activeWorkspace?.name}</strong>.
                    </p>
                </div>
            </div>

            {/* ---- KPI Cards ---- */}
            <div className="stat-cards">
                <div className="stat-card stat-card-total">
                    <div className="stat-card-row">
                        <span className="stat-label">Total Tasks</span>
                        <CheckSquare size={20} className="stat-icon" strokeWidth={1.5} />
                    </div>
                    <span className="stat-number">{stats.total}</span>
                </div>

                <div className="stat-card stat-card-progress">
                    <div className="stat-card-row">
                        <span className="stat-label">In Progress</span>
                        <RefreshCw size={20} className="stat-icon" strokeWidth={1.5} />
                    </div>
                    <span className="stat-number">{stats.byStatus.IN_PROGRESS}</span>
                </div>

                <div className="stat-card stat-card-done">
                    <div className="stat-card-row">
                        <span className="stat-label">Completed</span>
                        <CheckCircle size={20} className="stat-icon" strokeWidth={1.5} />
                    </div>
                    <span className="stat-number">{stats.byStatus.DONE}</span>
                </div>

                <div className="stat-card stat-card-danger">
                    <div className="stat-card-row">
                        <span className="stat-label">Overdue</span>
                        <AlertTriangle size={20} className="stat-icon" strokeWidth={1.5} />
                    </div>
                    <span className="stat-number">{stats.overdue}</span>
                </div>
            </div>

            {/* ---- Charts ---- */}
            <div className="chart-grid">
                {/* Donut — Tasks by Status */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3>Tasks by Status</h3>
                    </div>
                    {stats.total === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem 0' }}>No tasks yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={stats.statusData}
                                    dataKey="value"
                                    nameKey="status"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {stats.statusData.map(d => (
                                        <Cell key={d.status} fill={STATUS_COLORS[d.status]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#fff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 4,
                                        fontSize: 13,
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Bar — Tasks by Priority */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3>Tasks by Priority</h3>
                    </div>
                    {stats.total === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem 0' }}>No tasks yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={stats.priorityData} barSize={40}>
                                <XAxis
                                    dataKey="priority"
                                    fontSize={12}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#45474C' }}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    fontSize={12}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#45474C' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#fff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 4,
                                        fontSize: 13,
                                    }}
                                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {stats.priorityData.map(d => (
                                        <Cell key={d.priority} fill={PRIORITY_COLORS[d.priority]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}