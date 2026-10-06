import { useState, useEffect, useCallback } from "react";
import { getTasks, createTask, updateTask, cycleTaskStatus, deleteTask } from "../services/api";

const STATUS_ORDER = ["todo", "in_progress", "in_review", "done"];

export function useTasks(projectId, sprintId = null) {
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const params = sprintId ? { sprint_id: sprintId } : {};
      const res = await getTasks(projectId, params);
      setTasks(res.data);
    } catch {
      /* silent — board shows empty state */
    } finally {
      setLoading(false);
    }
  }, [projectId, sprintId]);

  useEffect(() => { load(); }, [load]);

  const add = async (data) => {
    const res = await createTask(data);
    setTasks((prev) => [res.data, ...prev]);
    return res.data;
  };

  // Optimistic status cycle — click moves task to next column instantly
  const cycleStatus = async (taskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t._id !== taskId) return t;
        const idx     = STATUS_ORDER.indexOf(t.status);
        const nextIdx = (idx + 1) % STATUS_ORDER.length;
        return { ...t, status: STATUS_ORDER[nextIdx] };
      })
    );
    const task    = tasks.find((t) => t._id === taskId);
    if (!task) return;
    const idx     = STATUS_ORDER.indexOf(task.status);
    const next    = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    await cycleTaskStatus(taskId, next).catch(() => load()); // revert on error
  };

  const update = async (id, data) => {
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...data } : t)));
    await updateTask(id, data);
  };

  const remove = async (id) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
    await deleteTask(id);
  };

  // Group by status for the board view
  const byStatus = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  return { tasks, byStatus, loading, add, update, remove, cycleStatus, refresh: load };
}
