import { useEffect, useState } from 'react';
import { UserPlus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function MembersPage() {
    const { activeWorkspaceId, activeWorkspace } = useWorkspace();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [search, setSearch] = useState('');

    const load = async () => {
        if (!activeWorkspaceId) return;
        setLoading(true);
        try {
            const { members } = await api.listMembers(activeWorkspaceId);
            setMembers(members);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [activeWorkspaceId]);

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setInviting(true);
        try {
            await api.inviteMember(activeWorkspaceId, email.trim());
            toast.success(`${email} added to ${activeWorkspace?.name}`);
            setEmail('');
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setInviting(false);
        }
    };

    if (!activeWorkspaceId) {
        return <div className="empty-state"><h3>No workspace selected</h3></div>;
    }

    const filtered = members.filter(m =>
        !search.trim() || m.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            {/* Page header */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    Workspace Members
                </h1>
                <p style={{ fontSize: 14, color: 'var(--color-on-surface-var)' }}>
                    Manage team access and roles within {activeWorkspace?.name}.
                </p>
            </div>

            {/* ---- Invite Card ---- */}
            <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-6)',
                marginBottom: 'var(--space-6)',
                boxShadow: 'var(--shadow-card)',
            }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--color-primary)' }}>
                    Invite New Member
                </h3>
                <p style={{ fontSize: 14, color: 'var(--color-on-surface-var)', marginBottom: 'var(--space-5)' }}>
                    Send an invitation to add a new collaborator.
                </p>
                <form
                    onSubmit={handleInvite}
                    style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}
                >
                    <div style={{ flex: 1, minWidth: 220 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                            textTransform: 'uppercase', color: 'var(--color-on-surface-var)',
                            marginBottom: 'var(--space-1)',
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="colleague@company.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{
                                width: '100%', padding: '8px 12px',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 14,
                                color: 'var(--color-on-surface)',
                                background: 'var(--color-surface)',
                                transition: 'border-color 0.15s, box-shadow 0.15s',
                            }}
                            onFocus={e => {
                                e.target.style.borderColor = 'var(--color-action)';
                                e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.15)';
                                e.target.style.outline = 'none';
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = 'var(--color-border)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={inviting} style={{ height: 38 }}>
                        <UserPlus size={15} strokeWidth={1.5} />
                        {inviting ? 'Inviting…' : 'Invite Member'}
                    </button>
                </form>
            </div>

            {/* ---- Members Table Card ---- */}
            <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)',
            }}>
                {/* Table header bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: '1px solid var(--color-border)',
                    background: 'var(--color-surface-subtle)',
                }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-primary)' }}>Active Members</h3>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search
                            size={15} strokeWidth={1.5}
                            style={{ position: 'absolute', left: 10, color: 'var(--color-on-surface-var)', pointerEvents: 'none' }}
                        />
                        <input
                            type="text"
                            placeholder="Search members…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                paddingLeft: 32, paddingRight: 12, paddingTop: 6, paddingBottom: 6,
                                border: '1px solid var(--color-border)',
                                borderRadius: 999,
                                fontSize: 13,
                                width: 200,
                                background: 'var(--color-surface)',
                                color: 'var(--color-on-surface)',
                            }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="board-loading">Loading members…</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                                    {['User', 'Role', 'Status'].map(h => (
                                        <th key={h} style={{
                                            padding: '12px 20px', textAlign: 'left',
                                            fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                                            textTransform: 'uppercase', color: 'var(--color-on-surface-var)',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-on-surface-var)', fontSize: 14 }}>
                                            No members found.
                                        </td>
                                    </tr>
                                )}
                                {filtered.map(m => {
                                    const initial = m.email ? m.email[0].toUpperCase() : '?';
                                    const isOwner = m.role?.toLowerCase() === 'owner';
                                    return (
                                        <tr
                                            key={m.userId}
                                            style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.12s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-subtle)'}
                                            onMouseLeave={e => e.currentTarget.style.background = ''}
                                        >
                                            {/* User cell */}
                                            <td style={{ padding: '14px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                    <div style={{
                                                        width: 40, height: 40, borderRadius: '50%',
                                                        background: isOwner ? 'var(--color-primary-container)' : 'var(--color-surface-high)',
                                                        color: isOwner ? '#fff' : 'var(--color-on-surface)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 700, fontSize: 15, flexShrink: 0,
                                                    }}>
                                                        {initial}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-on-surface)' }}>{m.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Role cell */}
                                            <td style={{ padding: '14px 20px' }}>
                                                {isOwner ? (
                                                    <span style={{
                                                        display: 'inline-flex', padding: '2px 10px',
                                                        borderRadius: 999, fontSize: 12, fontWeight: 600,
                                                        background: 'var(--color-action-light)', color: 'var(--color-action)',
                                                    }}>Owner</span>
                                                ) : (
                                                    <span style={{ fontSize: 14, color: 'var(--color-on-surface)', textTransform: 'capitalize' }}>
                                                        {m.role}
                                                    </span>
                                                )}
                                            </td>
                                            {/* Status cell */}
                                            <td style={{ padding: '14px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }} />
                                                    <span style={{ fontSize: 14, color: 'var(--color-on-surface-var)' }}>Active</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}