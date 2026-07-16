import { API_URL } from "../config";
import { getToken } from "./auth";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body } = {}) {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new ApiError(data.error || "Something went wrong. Try again.", res.status);
  }
  return data;
}

// ---- Workspaces ----
export const listWorkspaces = () => request("/workspaces").then((d) => d.workspaces || []);

export const createWorkspace = (name, description = "") =>
  request("/workspaces", { method: "POST", body: { name, description } });

// ---- Tasks ----
export const getTasks = (workspaceId) =>
  request(`/workspaces/${workspaceId}/tasks`).then((d) => d.tasks || []);

export const createTask = (workspaceId, task) =>
  request(`/workspaces/${workspaceId}/tasks`, {
    method: "POST",
    body: { workspaceId, ...task },
  });

// UpdateTask replaces every field on every call — always send the full task.
export const updateTask = (workspaceId, taskId, task) =>
  request(`/workspaces/${workspaceId}/tasks/${taskId}`, {
    method: "PUT",
    body: {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      assigneeId: task.assigneeId,
    },
  });

export const deleteTask = (workspaceId, taskId) =>
  request(`/workspaces/${workspaceId}/tasks/${taskId}`, { method: "DELETE" });

// ---- Comments ----
export const getComments = (workspaceId, taskId) =>
  request(`/workspaces/${workspaceId}/tasks/${taskId}/comments`).then((d) => d.comments || []);

export const createComment = (workspaceId, taskId, text) =>
  request(`/workspaces/${workspaceId}/tasks/${taskId}/comments`, {
    method: "POST",
    body: { text },
  });

// ---- Members ----
export const getWorkspaceMembers = (workspaceId) =>
  request(`/workspaces/${workspaceId}/members`).then((d) => d.members || []);

export const inviteMember = (workspaceId, email) =>
  request(`/workspaces/${workspaceId}/members`, { method: "POST", body: { email } });

// ---- Files ----
export const getWorkspaceFiles = (workspaceId) =>
  request(`/workspaces/${workspaceId}/files`).then((d) => d.files || []);

export const getSignedUploadUrl = (workspaceId, fileName, fileType) =>
  request(`/upload`, { method: "POST", body: { workspaceId, fileName, fileType } });

export async function uploadFile(workspaceId, file) {
  const { uploadUrl, key } = await getSignedUploadUrl(workspaceId, file.name, file.type);
  await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  return key;
}

export { ApiError };
