import { useState, useEffect, useCallback } from "react";
import { getProjects, createProject, updateProject, deleteProject } from "../services/api";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch {
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (data) => {
    const res = await createProject(data);
    setProjects((prev) => [res.data, ...prev]);
    return res.data;
  };

  const update = async (id, data) => {
    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (p._id === id ? { ...p, ...data } : p))
    );
    await updateProject(id, data);
  };

  const remove = async (id) => {
    setProjects((prev) => prev.filter((p) => p._id !== id));
    await deleteProject(id);
  };

  return { projects, loading, error, add, update, remove, refresh: load };
}
