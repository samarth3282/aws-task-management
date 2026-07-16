import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useWorkspace } from "../hooks/useWorkspace.jsx";
import { useToast } from "../hooks/useToast.jsx";
import * as api from "../lib/api";
import { initials } from "../components/app/TaskCard.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { withViewTransition } from "../lib/transition.js";

const STATUS_COLORS = { TODO: "#8891a3", IN_PROGRESS: "#f0a63a", DONE: "#49d3bd" };
const STATUS_LABEL = { TODO: "To do", IN_PROGRESS: "In progress", DONE: "Done" };

export default function DashboardPage() {
  const { active } = useWorkspace();
  const { notify } = useToast();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([api.getTasks(active.workspaceId), api.getWorkspaceMembers(active.workspaceId)])
      .then(([t, m]) => {
        if (cancelled) return;
        setTasks(t);
        setMembers(m);
      })
      .catch((err) => !cancelled && notify(err.message || "Couldn't load analytics.", "error"))
      .finally(() => !cancelled && withViewTransition(() => setLoading(false)));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.workspaceId]);

  const statusData = useMemo(() => {
    const counts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    tasks.forEach((t) => (counts[t.status] = (counts[t.status] || 0) + 1));
    return Object.entries(counts).map(([status, value]) => ({ status, value, label: STATUS_LABEL[status] }));
  }, [tasks]);

  const workloadData = useMemo(() => {
    const byMember = {};
    tasks.forEach((t) => {
      if (!t.assigneeId) return;
      byMember[t.assigneeId] = (byMember[t.assigneeId] || 0) + 1;
    });
    return members
      .map((m) => ({ name: m.name || m.email, count: byMember[m.userId] || 0 }))
      .sort((a, b) => b.count - a.count);
  }, [tasks, members]);

  if (loading) {
    return (
      <div className="page">
        <header className="page__head">
          <div>
            <h1>Dashboard</h1>
            <p>What's open, what's moving, and who's carrying what in {active.name}.</p>
          </div>
        </header>

        <div className="dash-stats">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="dash-stat">
              <Skeleton style={{ width: 7, height: 7, borderRadius: '50%', position: 'absolute', top: 18, right: 18 }} />
              <Skeleton style={{ width: 40, height: 32, marginBottom: 4 }} />
              <Skeleton style={{ width: 70, height: 14 }} />
            </div>
          ))}
        </div>

        <div className="dash-grid">
          <div className="dash-card">
            <h3 style={{ color: 'var(--text-300)' }}>Status breakdown</h3>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220 }}>
              <Skeleton style={{ width: 170, height: 170, borderRadius: '50%' }} />
            </div>
          </div>

          <div className="dash-card">
            <h3 style={{ color: 'var(--text-300)' }}>Workload by member</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: 220, paddingTop: 10 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Skeleton style={{ width: 60, height: 12 }} />
                  <Skeleton style={{ height: 16, width: `${Math.max(20, 100 - i * 20)}%`, borderRadius: '0 6px 6px 0' }} />
                </div>
              ))}
            </div>-
          </div>
        </div>
      </div>
    );
  }

  const total = tasks.length;

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>Dashboard</h1>
          <p>What's open, what's moving, and who's carrying what in {active.name}.</p>
        </div>
      </header>

      <div className="dash-stats">
        {statusData.map((s) => (
          <div key={s.status} className="dash-stat">
            <span className="dash-stat__dot" style={{ background: STATUS_COLORS[s.status] }} />
            <span className="dash-stat__value">{s.value}</span>
            <span className="dash-stat__label">{s.label}</span>
          </div>
        ))}
        <div className="dash-stat">
          <span className="dash-stat__dot" style={{ background: "var(--text-500)" }} />
          <span className="dash-stat__value">{total}</span>
          <span className="dash-stat__label">Total tasks</span>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <h3>Status breakdown</h3>
          {total === 0 ? (
            <p className="panel__muted">No tasks yet — add some to the board.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="label" innerRadius={56} outerRadius={84} paddingAngle={3}>
                  {statusData.map((s) => (
                    <Cell key={s.status} fill={STATUS_COLORS[s.status]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#171c27", border: "1px solid #2a3140", borderRadius: 10, fontSize: 12.5 }}
                  itemStyle={{ color: "#f4f5f7" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dash-card">
          <h3>Workload by member</h3>
          {workloadData.length === 0 ? (
            <p className="panel__muted">Invite teammates to see workload here.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={workloadData} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fill: "#8b909e", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v.length > 12 ? `${v.slice(0, 12)}...` : v)}
                />
                <Tooltip
                  contentStyle={{ background: "#171c27", border: "1px solid #2a3140", borderRadius: 10, fontSize: 12.5 }}
                  itemStyle={{ color: "#f4f5f7" }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="count" fill="#f0a63a" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {members.length > 0 && (
        <div className="dash-card">
          <h3>Team</h3>
          <div className="dash-team">
            {members.map((m) => (
              <div key={m.userId} className="dash-team__row">
                <span className="task-card__avatar">{initials(m.name || m.email)}</span>
                <span>{m.name || m.email}</span>
                <span className="dash-team__count">{tasks.filter((t) => t.assigneeId === m.userId).length} assigned</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
