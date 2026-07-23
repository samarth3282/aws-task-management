import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as api from "../lib/api";
import { withViewTransition } from "../lib/transition.js";

const WorkspaceContext = createContext(null);

const LAST_WORKSPACE_KEY = "taskflow:lastWorkspaceId";

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listWorkspaces();
      setWorkspaces(list);

      const acceptedList = list.filter((w) => w.status !== "PENDING");
      const stillExists = acceptedList.some((w) => w.workspaceId === remembered);

      setActiveId((current) => {
        if (current && acceptedList.some((w) => w.workspaceId === current)) return current;
        if (stillExists) return remembered;
        return acceptedList[0]?.workspaceId ?? null;
      });
    } catch (err) {
      setError(err.message || "Couldn't load your workspaces.");
    } finally {
      withViewTransition(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const selectWorkspace = useCallback((id) => {
    setActiveId(id);
    window.localStorage.setItem(LAST_WORKSPACE_KEY, id);
  }, []);

  const createWorkspace = useCallback(async (name, description) => {
    const { workspaceId } = await api.createWorkspace(name, description);
    await loadWorkspaces();
    selectWorkspace(workspaceId);
    return workspaceId;
  }, [loadWorkspaces, selectWorkspace]);

  const active = workspaces.find((w) => w.workspaceId === activeId) || null;

  return (
    <WorkspaceContext.Provider
      value={{ workspaces, active, activeId, loading, error, selectWorkspace, createWorkspace, reload: loadWorkspaces }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
