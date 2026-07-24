import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";
import { WorkspaceProvider } from "./hooks/useWorkspace.jsx";
import { Skeleton } from "./components/ui/Skeleton.jsx";

import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import AppShell from "./pages/AppShell.jsx";
import BoardPage from "./pages/BoardPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import MembersPage from "./pages/MembersPage.jsx";
import FilesPage from "./pages/FilesPage.jsx";

function RequireAuth({ children }) {
  const { user, checking } = useAuth();

  if (checking) {
    return (
      <div className="app-shell">
        <aside className="sidebar">
           <div className="sidebar__logo">
             <Skeleton style={{ width: 24, height: 24, borderRadius: 6 }} />
             <Skeleton style={{ width: 100, height: 20 }} />
           </div>
           <div className="switcher" style={{ marginTop: 20 }}>
             <Skeleton style={{ width: '100%', height: 42, borderRadius: 10 }} />
           </div>
           <div className="sidebar__nav" style={{ marginTop: 24, gap: 12, display: 'flex', flexDirection: 'column' }}>
             {[1, 2, 3, 4].map(i => <Skeleton key={i} style={{ width: '100%', height: 36, borderRadius: 9 }} />)}
           </div>
           <div className="sidebar__footer" style={{ marginTop: 'auto' }}>
             <Skeleton style={{ width: 26, height: 26, borderRadius: '50%' }} />
             <Skeleton style={{ width: 120, height: 14 }} />
           </div>
        </aside>
        <main className="app-main">
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
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/app"
          element={
            <RequireAuth>
              <WorkspaceProvider>
                <AppShell />
              </WorkspaceProvider>
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="board" replace />} />
          <Route path="board" element={<BoardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="members" element={<MembersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
