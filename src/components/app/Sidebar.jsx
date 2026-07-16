import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutGrid, BarChart3, Users, ChevronDown, Plus, LogOut, FileText } from "lucide-react";
import { PRODUCT_NAME } from "../../config";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useWorkspace } from "../../hooks/useWorkspace.jsx";
import CreateWorkspaceModal from "./CreateWorkspaceModal.jsx";

const NAV = [
  { to: "board", label: "Board", icon: LayoutGrid },
  { to: "dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "files", label: "Files", icon: FileText },
  { to: "members", label: "Members", icon: Users },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { workspaces, active, selectWorkspace } = useWorkspace();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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
            {workspaces.map((w) => (
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
