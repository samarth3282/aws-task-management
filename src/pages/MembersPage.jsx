import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { useWorkspace } from "../hooks/useWorkspace.jsx";
import { useToast } from "../hooks/useToast.jsx";
import * as api from "../lib/api";
import InviteMemberModal from "../components/app/InviteMemberModal.jsx";
import { initials } from "../components/app/TaskCard.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { withViewTransition } from "../lib/transition.js";

export default function MembersPage() {
  const { active } = useWorkspace();
  const { notify } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  function load() {
    if (!active) return;
    setLoading(true);
    api
      .getWorkspaceMembers(active.workspaceId)
      .then(setMembers)
      .catch((err) => notify(err.message || "Couldn't load members.", "error"))
      .finally(() => withViewTransition(() => setLoading(false)));
  }

  useEffect(load, [active?.workspaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>Members</h1>
          <p>Everyone with access to {active.name}.</p>
        </div>
        <button type="button" className="btn btn--amber" onClick={() => setInviteOpen(true)}>
          <UserPlus size={15} /> Invite
        </button>
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
              <span className="task-card__avatar members-list__avatar">{initials(m.name || m.email)}</span>
              <div className="members-list__info">
                <p>{m.name || m.email}</p>
                <span>{m.email}</span>
              </div>
              <span className="members-list__role">{m.role || "Member"}</span>
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
    </div>
  );
}
