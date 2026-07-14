import { useEffect, useRef, useState } from 'react';
import { Upload, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useWorkspace } from '../context/WorkspaceContext';

function formatSize(bytes) {
    if (bytes < 1024)            return `${bytes} B`;
    if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPage() {
    const { activeWorkspaceId } = useWorkspace();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const load = async () => {
        if (!activeWorkspaceId) return;
        setLoading(true);
        try {
            const { files } = await api.listFiles(activeWorkspaceId);
            setFiles(files);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [activeWorkspaceId]);

    const handleFileChosen = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const { uploadUrl } = await api.requestUploadUrl(activeWorkspaceId, file.name, file.type);
            await api.uploadToS3(uploadUrl, file);
            toast.success(`${file.name} uploaded`);
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!activeWorkspaceId) return <div className="empty-state"><h3>No workspace selected</h3></div>;

    return (
        <div>
            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Files</h1>
                    <p style={{ fontSize: 14, color: 'var(--color-on-surface-var)' }}>
                        Workspace attachments, PDFs, and images.
                    </p>
                </div>
                <div>
                    <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChosen} />
                    <button className="btn btn-primary" disabled={uploading} onClick={() => fileInputRef.current.click()}>
                        <Upload size={15} strokeWidth={1.5} />
                        {uploading ? 'Uploading…' : 'Upload file'}
                    </button>
                </div>
            </div>

            {/* File list card */}
            <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)',
            }}>
                {loading ? (
                    <div className="board-loading">Loading files…</div>
                ) : files.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={32} color="var(--color-on-surface-var)" strokeWidth={1.5} />
                        <h3>No files yet</h3>
                        <p>Upload attachments, PDFs, or images for this workspace.</p>
                    </div>
                ) : (
                    <div>
                        {/* Table header */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr auto auto',
                            padding: '10px 20px',
                            borderBottom: '1px solid var(--color-border)',
                            background: 'var(--color-surface-subtle)',
                        }}>
                            {['File', 'Size', ''].map((h, i) => (
                                <span key={i} style={{
                                    fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                                    textTransform: 'uppercase', color: 'var(--color-on-surface-var)',
                                }}>{h}</span>
                            ))}
                        </div>

                        {files.map((f, idx) => (
                            <div
                                key={f.key}
                                style={{
                                    display: 'grid', gridTemplateColumns: '1fr auto auto',
                                    alignItems: 'center', gap: 'var(--space-4)',
                                    padding: '14px 20px',
                                    borderBottom: idx < files.length - 1 ? '1px solid var(--color-border)' : 'none',
                                    transition: 'background 0.12s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-subtle)'}
                                onMouseLeave={e => e.currentTarget.style.background = ''}
                            >
                                {/* File info */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                                    <FileText size={20} color="var(--color-action)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
                                    <span style={{
                                        fontSize: 14, fontWeight: 500, color: 'var(--color-on-surface)',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>{f.fileName}</span>
                                </div>
                                {/* Size */}
                                <span style={{ fontSize: 13, color: 'var(--color-on-surface-var)', whiteSpace: 'nowrap' }}>
                                    {formatSize(f.size)}
                                </span>
                                {/* Download */}
                                <a href={f.downloadUrl} className="btn btn-secondary" download style={{ padding: '6px 12px' }}>
                                    <Download size={14} strokeWidth={1.5} /> Download
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}