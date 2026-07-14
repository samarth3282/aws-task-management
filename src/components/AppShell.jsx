import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { LayoutGrid, BarChart3, Paperclip, Users, LogOut, Plus, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import './AppShell.css';

function WorkspaceSwitcher() {
    const { workspaces, activeWorkspaceId, setActiveWorkspaceId, createWorkspace, loading } = useWorkspace();
    const [open, setOpen] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);
    const [name, setName] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        try {
            await createWorkspace(name.trim(), '');
            setName('');
            setShowNewForm(false);
            setOpen(false);
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <div className="ws-switcher-loading">Loading workspaces…</div>;

    const active = workspaces.find(w => w.workspaceId === activeWorkspaceId);

    return (
        <div className="ws-switcher">
            <button className="ws-switcher-trigger" onClick={() => setOpen(o => !o)}>
                <span className="ws-switcher-name">{active ? active.name : 'No workspace yet'}</span>
                <ChevronDown size={14} />
            </button>
            {open && (
                <div className="ws-switcher-menu">
                    {workspaces.map(w => (
                        <button
                            key={w.workspaceId}
                            className={`ws-switcher-item ${w.workspaceId === activeWorkspaceId ? 'active' : ''}`}
                            onClick={() => { setActiveWorkspaceId(w.workspaceId); setOpen(false); }}
                        >
                            {w.name}
                        </button>
                    ))}
                    {workspaces.length === 0 && (
                        <div className="ws-switcher-empty">You're not in any workspace yet.</div>
                    )}
                    <div className="ws-switcher-divider" />
                    {showNewForm ? (
                        <form className="ws-switcher-new-form" onSubmit={handleCreate}>
                            <input autoFocus placeholder="Workspace name" value={name} onChange={e => setName(e.target.value)} />
                            <button type="submit" className="btn btn-primary">Create</button>
                        </form>
                    ) : (
                        <button className="ws-switcher-item ws-switcher-add" onClick={() => setShowNewForm(true)}>
                            <Plus size={13} /> New workspace
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

const NAV_ITEMS = [
    { to: 'board',     label: 'Board',     icon: LayoutGrid },
    { to: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: 'files',     label: 'Files',     icon: Paperclip },
    { to: 'members',   label: 'Members',   icon: Users },
];

function ShellInner({ signOut, user }) {
    return (
        <div className="shell">
            <aside className="shell-sidebar">
                {/* Logo */}
                <div className="shell-logo">
                    <div className="shell-logo-icon">TF</div>
                    <div className="shell-logo-text">
                        <span className="shell-logo-name">TaskFlow</span>
                        <span className="shell-logo-sub">Workspace</span>
                    </div>
                </div>

                {/* Workspace switcher */}
                <WorkspaceSwitcher />

                {/* Navigation */}
                <nav className="shell-nav">
                    {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `shell-nav-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={17} strokeWidth={1.5} /> {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User footer */}
                <div className="shell-user">
                    <span className="shell-user-email">{user.signInDetails?.loginId}</span>
                    <button className="btn btn-ghost" onClick={signOut} title="Sign out">
                        <LogOut size={15} strokeWidth={1.5} />
                    </button>
                </div>
            </aside>

            <main className="shell-main">
                <div className="shell-main-scroll">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default function AppShell({ signOut, user }) {
    return (
        <WorkspaceProvider>
            <ShellInner signOut={signOut} user={user} />
        </WorkspaceProvider>
    );
}