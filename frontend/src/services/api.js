import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
});

// Projects
export const getProjects      = ()         => http.get("/projects/");
export const createProject    = (data)     => http.post("/projects/", data);
export const updateProject    = (id, data) => http.patch(`/projects/${id}`, data);
export const deleteProject    = (id)       => http.delete(`/projects/${id}`);
export const getProjectStats  = (id)       => http.get(`/projects/${id}/stats`);

// Sprints
export const getSprints       = (projectId)       => http.get(`/sprints/project/${projectId}`);
export const createSprint     = (data)            => http.post("/sprints/", data);
export const updateSprint     = (id, data)        => http.patch(`/sprints/${id}`, data);
export const deleteSprint     = (id)              => http.delete(`/sprints/${id}`);

// Tasks
export const getTasks         = (projectId, params) => http.get(`/tasks/project/${projectId}`, { params });
export const createTask       = (data)              => http.post("/tasks/", data);
export const updateTask       = (id, data)          => http.patch(`/tasks/${id}`, data);
export const cycleTaskStatus  = (id, status)        => http.patch(`/tasks/${id}/status?status=${status}`);
export const deleteTask       = (id)                => http.delete(`/tasks/${id}`);
