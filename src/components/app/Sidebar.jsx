import { useState } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { LayoutGrid, BarChart3, Users, ChevronDown, Plus, LogOut, FileText, Trash2 } from "lucide-react";
import { PRODUCT_NAME } from "../../config";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useWorkspace } from "../../hooks/useWorkspace.jsx";
import { useToast } from "../../hooks/useToast.jsx";
import CreateWorkspaceModal from "./CreateWorkspaceModal.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import UserProfileModal from "./UserProfileModal.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import TaskflowLogo from "../ui/TaskflowLogo.jsx";
import * as api from "../../lib/api";

const NAV = [
  { to: "board", label: "Board", icon: LayoutGrid },
  { to: "dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "files", label: "Files", icon: FileText },
  { to: "members", label: "Members", icon: Users },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, signOut } = useAuth();
  const { workspaces, active, selectWorkspace, reload } = useWorkspace();
  const { notify } = useToast();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Separate workspaces based on status
  const acceptedWorkspaces = workspaces.filter(w => w.status !== "PENDING");
  const pendingWorkspaces = workspaces.filter(w => w.status === "PENDING");

  const handleRespond = async (workspaceId, action) => {
    setRespondingTo({ id: workspaceId, action });
    try {
      await api.respondToInvite(workspaceId, action);
      await reload(); // refresh workspaces from backend
    } catch (err) {
      notify(err.message || "Something went wrong.", "error");
    } finally {
      setRespondingTo(null);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!active) return;
    setDeletingWorkspace(true);
    try {
      await api.deleteWorkspace(active.workspaceId);
      notify(`Workspace deleted.`, "success");
      await reload(); // refresh workspaces, active will change or become null
      setConfirmDeleteOpen(false);
    } catch (err) {
      notify(err.message || "Could not delete workspace.", "error");
    } finally {
      setDeletingWorkspace(false);
    }
  };

  const isOwner = active?.ownerId === (user?.userId || user?.username);

  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose} 
          aria-hidden="true" 
        />
      )}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__logo">
          <TaskflowLogo className="nav__logo-mark" aria-hidden="true" />
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
                    disabled={!!respondingTo}
                    onClick={() => handleRespond(w.workspaceId, "ACCEPT")}
                    style={{ flex: 1, padding: "4px", background: "#0066cc", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                  >
                    {respondingTo?.id === w.workspaceId && respondingTo?.action === "ACCEPT" ? "..." : "Accept"}
                  </button>
                  <button
                    disabled={!!respondingTo}
                    onClick={() => handleRespond(w.workspaceId, "REJECT")}
                    style={{ flex: 1, padding: "4px", background: "#eee", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                  >
                    {respondingTo?.id === w.workspaceId && respondingTo?.action === "REJECT" ? "..." : "Reject"}
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
            onClick={() => {
              if (window.innerWidth <= 860) onClose?.();
            }}
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        {isOwner && (
          <button 
            type="button" 
            className="sidebar__signout" 
            onClick={() => setConfirmDeleteOpen(true)} 
            title="Delete Workspace"
            style={{ color: 'var(--red-400, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', borderRadius: '4px' }}
          >
            <Trash2 size={15} /> <span style={{ fontSize: '13px' }}>Delete Workspace</span>
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button 
            type="button" 
            className="sidebar__user" 
            style={{ 
              background: 'transparent', border: 'none', textAlign: 'left', padding: '4px', 
              cursor: 'pointer', flex: 1, borderRadius: '6px', 
              transition: 'background 0.2s', 
              ':hover': { background: 'rgba(255,255,255,0.05)' } 
            }}
            onClick={() => setProfileOpen(true)}
            title="Edit Profile"
          >
            {user?.picture ? (
              <img src={user.picture} alt="Profile" className="task-card__avatar sidebar__avatar" style={{ border: 'none', objectFit: 'cover' }} />
            ) : (
              <span className="task-card__avatar sidebar__avatar">
                {(user?.name || user?.signInDetails?.loginId || user?.username || "U")[0]?.toUpperCase()}
              </span>
            )}
            <span className="sidebar__email" style={{ marginLeft: '8px' }}>
              {user?.name || user?.signInDetails?.loginId || user?.username}
            </span>
          </button>
          <button type="button" className="sidebar__signout" onClick={signOut} aria-label="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      <CreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />
      
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteWorkspace}
        title="Delete Workspace?"
        body={`This will completely delete the workspace "${active?.name}" and kick out all members. It cannot be recovered.`}
        confirmLabel="Delete Workspace"
        busy={deletingWorkspace}
        requireMatch="delete"
      />
      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </aside>
    </>
  );
}
