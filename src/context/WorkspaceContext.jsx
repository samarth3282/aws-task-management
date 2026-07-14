import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshWorkspaces = useCallback(async () => {
        setLoading(true);
        try {
            const { workspaces } = await api.listWorkspaces();
            setWorkspaces(workspaces);
            setActiveWorkspaceId(prev => {
                if (prev && workspaces.some(w => w.workspaceId === prev)) return prev;
                return workspaces[0]?.workspaceId || null;
            });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refreshWorkspaces(); }, [refreshWorkspaces]);

    const createWorkspace = async (name, description) => {
        const result = await api.createWorkspace(name, description);
        await refreshWorkspaces();
        setActiveWorkspaceId(result.workspaceId);
        toast.success(`Workspace "${name}" created`);
        return result.workspaceId;
    };

    const activeWorkspace = workspaces.find(w => w.workspaceId === activeWorkspaceId) || null;

    return (
        <WorkspaceContext.Provider
            value={{ workspaces, activeWorkspaceId, activeWorkspace, setActiveWorkspaceId, loading, refreshWorkspaces, createWorkspace }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const ctx = useContext(WorkspaceContext);
    if (!ctx) throw new Error('useWorkspace must be used inside a WorkspaceProvider');
    return ctx;
}