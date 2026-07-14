import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = import.meta.env.VITE_API_URL;

async function authedFetch(path, options = {}) {
    const session = await fetchAuthSession();
    const token = session.tokens.idToken.toString();

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            Authorization: token,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
            const body = await res.json();
            if (body.error) message = body.error;
        } catch {
            // response wasn't JSON — keep the generic message
        }
        throw new Error(message);
    }

    if (res.status === 204) return null;
    return res.json();
}

export const api = {
    // Workspaces
    listWorkspaces: () => authedFetch('/workspaces'),
    createWorkspace: (name, description) =>
        authedFetch('/workspaces', { method: 'POST', body: JSON.stringify({ name, description }) }),
    inviteMember: (workspaceId, email) =>
        authedFetch(`/workspaces/${workspaceId}/members`, { method: 'POST', body: JSON.stringify({ email }) }),
    listMembers: (workspaceId) => authedFetch(`/workspaces/${workspaceId}/members`),

    // Tasks
    listTasks: (workspaceId) => authedFetch(`/workspaces/${workspaceId}/tasks`),
    createTask: (workspaceId, task) =>
        authedFetch(`/workspaces/${workspaceId}/tasks`, { method: 'POST', body: JSON.stringify({ ...task, workspaceId }) }),
    updateTask: (workspaceId, taskId, fullTask) =>
        authedFetch(`/workspaces/${workspaceId}/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(fullTask) }),
    deleteTask: (workspaceId, taskId) =>
        authedFetch(`/workspaces/${workspaceId}/tasks/${taskId}`, { method: 'DELETE' }),

    // Comments
    listComments: (workspaceId, taskId) => authedFetch(`/workspaces/${workspaceId}/tasks/${taskId}/comments`),
    addComment: (workspaceId, taskId, text) =>
        authedFetch(`/workspaces/${workspaceId}/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),

    // Files
    listFiles: (workspaceId) => authedFetch(`/workspaces/${workspaceId}/files`),
    requestUploadUrl: (workspaceId, fileName, fileType) =>
        authedFetch('/upload', { method: 'POST', body: JSON.stringify({ workspaceId, fileName, fileType }) }),
    uploadToS3: async (uploadUrl, file) => {
        const res = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
        if (!res.ok) throw new Error('Upload to S3 failed');
    }
};