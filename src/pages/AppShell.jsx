import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/app/Sidebar.jsx";
import MobileHeader from "../components/app/MobileHeader.jsx";
import CreateWorkspaceModal from "../components/app/CreateWorkspaceModal.jsx";
import { useWorkspace } from "../hooks/useWorkspace.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import AccentColorPicker from "../components/ui/AccentColorPicker.jsx";

export default function AppShell() {
  const { loading, workspaces, active, error } = useWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const acceptedWorkspaces = workspaces.filter(w => w.status !== "PENDING");

  return (
    <div className="app-shell">
      <MobileHeader onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="app-main">
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
          <AccentColorPicker />
          <ThemeToggle />
        </div>

        {loading && (
          <div className="page">
            <header className="page__head">
              <div>
                <Skeleton style={{ width: 240, height: 32, marginBottom: 8 }} />
                <Skeleton style={{ width: 360, height: 16 }} />
              </div>
            </header>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <Skeleton style={{ width: '100%', height: 120, borderRadius: 12 }} />
               <Skeleton style={{ width: '100%', height: 120, borderRadius: 12 }} />
               <Skeleton style={{ width: '100%', height: 120, borderRadius: 12 }} />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="app-main__center">
            <p className="panel__muted">{error}</p>
          </div>
        )}

        {!loading && !error && acceptedWorkspaces.length === 0 && (
          <div className="app-main__center app-main__empty">
            <span className="eyebrow">No workspace yet</span>
            <h2>Create your first workspace</h2>
            <p>Everything in TaskFlow - tasks, comments, teammates - lives inside a workspace.</p>
            <button type="button" className="btn btn--amber" onClick={() => setCreateOpen(true)}>
              Create workspace
            </button>
          </div>
        )}

        {!loading && !error && acceptedWorkspaces.length > 0 && active?.status === "LEAVE_PENDING" && (
          <div className="app-main__center app-main__empty">
            <span className="eyebrow">Leave Pending</span>
            <h2>Waiting for owner approval</h2>
            <p>You have requested to leave this workspace. You cannot perform operations until the owner accepts or rejects your request.</p>
          </div>
        )}

        {!loading && !error && acceptedWorkspaces.length > 0 && active?.status !== "LEAVE_PENDING" && <Outlet />}
      </main>

      <CreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
