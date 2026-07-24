import { useState, useEffect } from "react";
import { UploadCloud } from "lucide-react";
import Modal from "./Modal.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useToast } from "../../hooks/useToast.jsx";
import * as api from "../../lib/api.js";
import { updateProfileAttributes } from "../../lib/auth.js";

export default function UserProfileModal({ open, onClose }) {
  const { user, refresh } = useAuth();
  const { notify } = useToast();

  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && user) {
      setName(user.name || "");
      setFile(null);
      setPreview(user.picture || null);
    }
  }, [open, user]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      notify("File must be smaller than 5MB", "error");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      let pictureUrl = undefined;
      
      if (file) {
        const result = await api.uploadProfilePhoto(file);
        pictureUrl = result.publicUrl;
      }

      await updateProfileAttributes(name.trim() || undefined, pictureUrl);
      await refresh();
      notify("Profile updated successfully", "success");
      onClose();
    } catch (err) {
      notify(err.message || "Failed to update profile", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile" width={400}>
      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div 
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              background: 'var(--ink-900)',
              backgroundImage: preview ? `url(${preview})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              border: '2px solid var(--color-border)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {!preview && <span style={{ fontSize: '32px', color: 'var(--text-300)' }}>{(name || user?.name || user?.username || "U")[0]?.toUpperCase()}</span>}
            <label style={{ 
              position: 'absolute', inset: 0, cursor: 'pointer', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)',
              opacity: 0, transition: 'opacity 0.2s' 
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
            >
              <UploadCloud size={24} color="#fff" />
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </label>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-500)' }}>Click photo to upload (Max 5MB)</span>
        </div>

        <label className="field" style={{ marginBottom: '24px' }}>
          <span>Display Name</span>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Your name"
            maxLength={50}
          />
        </label>

        <div className="confirm__actions">
          <button type="button" className="btn btn--outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn--accent" disabled={busy}>
            {busy ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
