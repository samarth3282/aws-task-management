import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function MembersPage() {
    const { activeWorkspaceId, activeWorkspace } = useWorkspace();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [inviting, setInviting] = useState(false);

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

    return (
        <div>
            <h1>Members</h1>
            <p className="board-subtitle">Everyone with access to {activeWorkspace?.name}.</p>

            <form className="members-invite-form" onSubmit={handleInvite}>
                <input
                    type="email"
                    placeholder="teammate@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={inviting}>
                    <UserPlus size={15} /> {inviting ? 'Inviting…' : 'Invite'}
                </button>
            </form>

            {loading ? (
                <div className="board-loading">Loading members…</div>
            ) : (
                <div className="members-list">
                    {members.map(m => (
                        <div className="member-row" key={m.userId}>
                            <div className="member-avatar">{m.email ? m.email[0].toUpperCase() : '?'}</div>
                            <div className="member-info">
                                <div className="member-email">{m.email}</div>
                                <div className="member-role">{m.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}