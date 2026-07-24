import { API_URL } from "../config";
import { getToken, verifySession } from "./auth";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body } = {}) {
  if (method !== "GET") {
    const isValid = await verifySession();
    if (!isValid) {
      window.dispatchEvent(new Event("session_invalidated"));
      throw new ApiError("Session invalid. You logged in on another device.", 401);
    }
  }

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

export const deleteComment = (workspaceId, taskId, commentId) =>
  request(`/workspaces/${workspaceId}/tasks/${taskId}/comments/${encodeURIComponent(commentId)}`, { method: "DELETE" });

// ---- Members ----
export const getWorkspaceMembers = (workspaceId) =>
  request(`/workspaces/${workspaceId}/members`).then((d) => d.members || []);

export const getWorkspaceProfiles = (workspaceId) =>
  request(`/workspaces/${workspaceId}/profiles`).then((d) => d.profiles || {});

export const inviteMember = (workspaceId, email) =>
  request(`/workspaces/${workspaceId}/members`, { method: "POST", body: { email } });

// ---- Files ----
export const getWorkspaceFiles = (workspaceId) =>
  request(`/workspaces/${workspaceId}/files`).then((d) => d.files || []);

export const getSignedUploadUrl = (workspaceId, fileName, fileType, fileSize) =>
  request(`/upload`, { method: "POST", body: { workspaceId, fileName, fileType, fileSize } });

export const getProfileUploadUrl = (fileName, fileType, fileSize) =>
  request(`/upload-profile`, { method: "POST", body: { fileName, fileType, fileSize } });

export async function uploadFile(workspaceId, file) {
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("File size exceeds the 25MB limit.");
  }
  const { uploadUrl, key } = await getSignedUploadUrl(workspaceId, file.name, file.type, file.size);

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!res.ok) throw new Error("Failed to upload file to S3");
  return key;
}

export async function uploadProfilePhoto(file) {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size exceeds the 5MB limit.");
  }
  const { uploadUrl, publicUrl, key } = await getProfileUploadUrl(file.name, file.type, file.size);

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!res.ok) throw new Error("Failed to upload profile photo to S3");
  return { publicUrl, key };
}

export const respondToInvite = (workspaceId, action) =>
  request(`/workspaces/${workspaceId}/respond-invite`, {
    method: "POST",
    body: { action },
  });

export const requestLeaveWorkspace = (workspaceId) =>
  request(`/workspaces/${workspaceId}/leave-request`, {
    method: "POST",
  });

export const respondToLeaveRequest = (workspaceId, userId, action) =>
  request(`/workspaces/${workspaceId}/respond-leave`, {
    method: "POST",
    body: { userId, action },
  });

export const deleteWorkspaceFile = (workspaceId, fileKey) =>
  request(`/workspaces/${workspaceId}/files`, {
    method: "DELETE",
    body: { key: fileKey },
  });

export const removeWorkspaceMember = (workspaceId, userId) =>
  request(`/workspaces/${workspaceId}/members/${userId}`, {
    method: "DELETE",
  });

export const deleteWorkspace = (workspaceId) =>
  request(`/workspaces/${workspaceId}`, {
    method: "DELETE",
  });

export { ApiError };
