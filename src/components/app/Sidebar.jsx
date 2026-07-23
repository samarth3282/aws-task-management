import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutGrid, BarChart3, Users, ChevronDown, Plus, LogOut, FileText } from "lucide-react";
import { PRODUCT_NAME } from "../../config";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useWorkspace } from "../../hooks/useWorkspace.jsx";
import CreateWorkspaceModal from "./CreateWorkspaceModal.jsx";
import * as api from "../../lib/api"; // Added API import for invites

const NAV = [
  { to: "board", label: "Board", icon: LayoutGrid },
  { to: "dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "files", label: "Files", icon: FileText },
  { to: "members", label: "Members", icon: Users },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { workspaces, active, selectWorkspace, reload } = useWorkspace();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // Separate workspaces based on status
  const acceptedWorkspaces = workspaces.filter(w => w.status !== "PENDING");
  const pendingWorkspaces = workspaces.filter(w => w.status === "PENDING");

  const handleRespond = async (workspaceId, action) => {
    setIsResponding(true);
    try {
      await api.respondToInvite(workspaceId, action);
      await reload(); // refresh workspaces from backend
    } catch (err) {
      alert(err.message);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="nav__logo-mark" aria-hidden="true" />
        {PRODUCT_NAME}
      </div>

      <div className="switcher">
        <button type="button" className="switcher__trigger" onClick={() => setSwitcherOpen((o) => !o)}>
          <span className="switcher__name">{active?.name || "Select workspace"}</span>
          <ChevronDown size={15} />
        </button>

        {switcherOpen && (
          <div className="switcher__menu">
            {/* Accepted Workspaces */}
            {acceptedWorkspaces.map((w) => (
              <button
                key={w.workspaceId}
                type="button"
                className={`switcher__item ${w.workspaceId === active?.workspaceId ? "switcher__item--active" : ""}`}
                onClick={() => {
                  selectWorkspace(w.workspaceId);
                  setSwitcherOpen(false);
                }}
              >
                {w.name}
              </button>
            ))}

            {/* Pending Invites */}
            {pendingWorkspaces.length > 0 && (
              <div style={{ padding: "8px 12px", fontSize: "11px", fontWeight: "600", color: "#666", textTransform: "uppercase", marginTop: "8px", borderTop: "1px solid #eee" }}>
                Pending Invites
              </div>
            )}

            {pendingWorkspaces.map((w) => (
              <div key={w.workspaceId} style={{ padding: "8px 12px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <strong>{w.name}</strong>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    disabled={isResponding}
                    onClick={() => handleRespond(w.workspaceId, "ACCEPT")}
                    style={{ flex: 1, padding: "4px", background: "#0066cc", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                  >
                    Accept
                  </button>
                  <button
                    disabled={isResponding}
                    onClick={() => handleRespond(w.workspaceId, "REJECT")}
                    style={{ flex: 1, padding: "4px", background: "#eee", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}

            <div style={{ marginTop: "4px", borderTop: "1px solid #eee" }} />

            <button
              type="button"
              className="switcher__item switcher__item--new"
              onClick={() => {
                setCreateOpen(true);
                setSwitcherOpen(false);
              }}
            >
              <Plus size={14} /> New workspace
            </button>
          </div>
        )}
      </div>

      <nav className="sidebar__nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span className="task-card__avatar sidebar__avatar">
            {(user?.signInDetails?.loginId || user?.username || "U")[0]?.toUpperCase()}
          </span>
          <span className="sidebar__email">{user?.signInDetails?.loginId || user?.username}</span>
        </div>
        <button type="button" className="sidebar__signout" onClick={signOut} aria-label="Sign out">
          <LogOut size={15} />
        </button>
      </div>

      <CreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </aside>
  );
}
