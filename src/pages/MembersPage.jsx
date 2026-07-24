import { useEffect, useState } from "react";
import { UserPlus, LogOut, UserMinus } from "lucide-react";
import { useWorkspace } from "../hooks/useWorkspace.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../hooks/useToast.jsx";
import * as api from "../lib/api";
import InviteMemberModal from "../components/app/InviteMemberModal.jsx";
import ConfirmDialog from "../components/app/ConfirmDialog.jsx";
import { initials } from "../components/app/TaskCard.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { withViewTransition } from "../lib/transition.js";

export default function MembersPage() {
  const { active, reload } = useWorkspace();
  const { user } = useAuth();
  const { notify } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);

  const isOwner = active?.ownerId === (user?.userId || user?.username);

  const [profilesLoading, setProfilesLoading] = useState(true);

  function load() {
    if (!active) return;
    setLoading(true);
    setProfilesLoading(true);
    
    api
      .getWorkspaceMembers(active.workspaceId)
      .then((m) => {
        setMembers(m);
        withViewTransition(() => setLoading(false));
        
        // Fetch profiles asynchronously
        api.getWorkspaceProfiles(active.workspaceId)
          .then((profiles) => {
            setMembers((prev) => prev.map((member) => ({
              ...member,
              profileName: profiles[member.userId]?.name,
              profilePicture: profiles[member.userId]?.picture
            })));
          })
          .catch((err) => console.warn("Failed to load member profiles", err))
          .finally(() => setProfilesLoading(false));
      })
      .catch((err) => {
        notify(err.message || "Couldn't load members.", "error");
        withViewTransition(() => setLoading(false));
      });
  }

  const confirmLeave = async () => {
    setIsLeaving(true);
    try {
      await api.requestLeaveWorkspace(active.workspaceId);
      notify("Leave request sent to owner.", "success");
      await reload();
      setLeaveConfirmOpen(false);
    } catch (err) {
      notify(err.message || "Could not request to leave.", "error");
    } finally {
      setIsLeaving(false);
    }
  };

  const handleRespondLeave = async (userId, action) => {
    try {
      await api.respondToLeaveRequest(active.workspaceId, userId, action);
      notify(action === "ACCEPT" ? "Leave request accepted." : "Leave request rejected.", "success");
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemovingMember(true);
    try {
      await api.removeWorkspaceMember(active.workspaceId, memberToRemove.userId);
      notify("Member removed.", "success");
      load();
      setMemberToRemove(null);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setRemovingMember(false);
    }
  };

  useEffect(load, [active?.workspaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>Members</h1>
          <p>Everyone with access to {active.name}.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isOwner && active.status !== "LEAVE_PENDING" && (
            <button type="button" className="btn btn--danger" onClick={() => setLeaveConfirmOpen(true)} disabled={isLeaving}>
              <LogOut size={15} /> {isLeaving ? "Requesting..." : "Leave"}
            </button>
          )}
          <button type="button" className="btn btn--amber" onClick={() => setInviteOpen(true)}>
            <UserPlus size={15} /> Invite
          </button>
        </div>
      </header>

      {loading ? (
        <div className="members-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="members-list__row">
              <Skeleton style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <div className="members-list__info" style={{ flex: 1 }}>
                <Skeleton style={{ width: 120, height: 16, marginBottom: 6 }} />
                <Skeleton style={{ width: 160, height: 12 }} />
              </div>
              <Skeleton style={{ width: 60, height: 20, borderRadius: 999 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="members-list">
          {members.map((m) => (
            <div key={m.userId} className="members-list__row">
              {profilesLoading ? (
                <Skeleton style={{ width: 32, height: 32, borderRadius: '50%' }} className="members-list__avatar" />
              ) : m.profilePicture ? (
                <img src={m.profilePicture} alt="Profile" className="task-card__avatar members-list__avatar" style={{ border: 'none', objectFit: 'cover' }} />
              ) : (
                <span className="task-card__avatar members-list__avatar">{initials(m.profileName || m.name || m.email)}</span>
              )}
              
              <div className="members-list__info">
                <div style={{ textTransform: 'capitalize', margin: '0 0 2px 0', fontSize: '14px', fontWeight: 500 }}>
                  {profilesLoading ? (
                    <Skeleton style={{ width: 120, height: 16, display: 'inline-block' }} />
                  ) : (
                    m.profileName || m.name || m.email.split('@')[0]
                  )}
                </div>
                <span style={{ textTransform: 'none' }}>{m.email}</span>
              </div>
              <span className="members-list__role">
                {m.status === "PENDING" ? (
                  <span style={{ color: "#f59e0b", fontWeight: 500 }}>Pending</span>
                ) : m.status === "LEAVE_PENDING" ? (
                  isOwner ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleRespondLeave(m.userId, "ACCEPT")} className="btn" style={{ padding: '4px 8px', fontSize: '12px', background: '#dc2626', color: 'white', minHeight: 'auto' }}>Accept Leave</button>
                      <button onClick={() => handleRespondLeave(m.userId, "REJECT")} className="btn" style={{ padding: '4px 8px', fontSize: '12px', background: '#e5e7eb', color: 'black', minHeight: 'auto' }}>Reject</button>
                    </div>
                  ) : (
                    <span style={{ color: "#dc2626", fontWeight: 500 }}>Leave Pending</span>
                  )
                ) : (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>{m.role || "Member"}</span>
                    {isOwner && m.userId !== (user?.userId || user?.username) && (
                      <button onClick={() => setMemberToRemove(m)} className="btn btn--outline" style={{ padding: '6px 10px', fontSize: '12px', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)', minHeight: '32px' }} title="Remove member">
                        <UserMinus size={14} /> Remove
                      </button>
                    )}
                  </div>
                )}
              </span>
            </div>
          ))}
          {members.length === 0 && <p className="panel__muted">No members yet - invite your first teammate.</p>}
        </div>
      )}

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        workspaceId={active.workspaceId}
        onInvited={load}
      />

      <ConfirmDialog
        open={leaveConfirmOpen}
        onClose={() => setLeaveConfirmOpen(false)}
        onConfirm={confirmLeave}
        title="Leave Workspace?"
        body="Are you sure you want to request to leave this workspace? An owner must approve your request."
        confirmLabel="Leave Workspace"
        busy={isLeaving}
      />

      <ConfirmDialog
        open={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={confirmRemoveMember}
        title="Remove Member?"
        body={`Are you sure you want to permanently remove "${memberToRemove?.name || memberToRemove?.email}" from the workspace? They will lose access to all tasks and files.`}
        confirmLabel="Remove Member"
        busy={removingMember}
        requireMatch="delete"
      />
    </div>
  );
}
