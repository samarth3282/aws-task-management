import { useEffect, useRef, useState } from 'react';
import { Upload, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useWorkspace } from '../context/WorkspaceContext';

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
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
            <div className="board-header">
                <h1>Files</h1>
                <div>
                    <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChosen} />
                    <button className="btn btn-primary" disabled={uploading} onClick={() => fileInputRef.current.click()}>
                        <Upload size={15} /> {uploading ? 'Uploading…' : 'Upload file'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="board-loading">Loading files…</div>
            ) : files.length === 0 ? (
                <div className="empty-state">
                    <FileText size={32} color="var(--color-text-muted)" />
                    <h3>No files yet</h3>
                    <p>Upload attachments, PDFs, or images for this workspace.</p>
                </div>
            ) : (
                <div className="members-list">
                    {files.map(f => (
                        <div className="member-row" key={f.key}>
                            <FileText size={20} color="var(--color-primary)" />
                            <div className="member-info">
                                <div className="member-email">{f.fileName}</div>
                                <div className="member-role">{formatSize(f.size)}</div>
                            </div>
                            <a href={f.downloadUrl} className="btn btn-secondary" download>
                                <Download size={14} /> Download
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}