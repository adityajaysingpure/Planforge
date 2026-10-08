import React, { useRef, useState } from "react";
import TaskForm from "../forms/TaskForm";
import { useTasks } from "../../hooks/useTasks";

const COLUMNS = [
  { key: "todo",        label: "To Do",      color: "#6b7280" },
  { key: "in_progress", label: "In Progress", color: "#f59e0b" },
  { key: "in_review",   label: "In Review",   color: "#6366f1" },
  { key: "done",        label: "Done",        color: "#22c55e" },
];

const PRIORITY_COLOR = {
  low: "#22c55e", medium: "#f59e0b",
  high: "#ef4444", urgent: "#7f1d1d",
};

export default function SprintBoard({ projectId, sprintId, sprints, accentColor }) {
  const { byStatus, loading, add, remove, cycleStatus } = useTasks(projectId, sprintId);
  const [showAddTask, setShowAddTask]   = useState(false);
  const [addToStatus, setAddToStatus]  = useState("todo");
  const taskFormRef                    = useRef(null);
  const [saving, setSaving]            = useState(false);

  const handleAddTask = (status) => {
    setAddToStatus(status);
    setShowAddTask(true);
  };

  const handleSaveTask = async () => {
    if (!taskFormRef.current) return;
    const errs = taskFormRef.current.validate();
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      const values = taskFormRef.current.getValues();
      await add({ ...values, status: addToStatus });
      setShowAddTask(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", gap: 16 }}>
        {COLUMNS.map((c) => (
          <div key={c.key} style={{ flex: 1, background: "#f9fafb", borderRadius: 10, padding: 14, minHeight: 200 }}>
            <div style={{ height: 16, background: "#e5e7eb", borderRadius: 4, width: "60%", marginBottom: 12 }} />
            {[1, 2].map((i) => (
              <div key={i} style={{ height: 72, background: "#e5e7eb", borderRadius: 8, marginBottom: 8 }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {COLUMNS.map((col) => {
          const colTasks = byStatus[col.key] || [];
          return (
            <div key={col.key} style={{
              background: "#f9fafb", borderRadius: 12,
              padding: "12px 10px", minHeight: 300,
              border: "1px solid #f3f4f6",
            }}>
              {/* Column header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "0 4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.color, display: "inline-block" }} />
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>{col.label}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 999,
                    background: "#e5e7eb", color: "#6b7280",
                  }}>{colTasks.length}</span>
                </div>
                <button
                  onClick={() => handleAddTask(col.key)}
                  style={{
                    background: "none", border: "none", color: "#9ca3af",
                    cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 2,
                  }}
                  title={`Add task to ${col.label}`}
                >+</button>
              </div>

              {/* Task cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {colTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    accentColor={accentColor}
                    onCycle={() => cycleStatus(task._id)}
                    onDelete={() => remove(task._id)}
                  />
                ))}

                {colTasks.length === 0 && (
                  <div
                    onClick={() => handleAddTask(col.key)}
                    style={{
                      padding: "20px 10px", textAlign: "center",
                      color: "#d1d5db", fontSize: 12, cursor: "pointer",
                      border: "1.5px dashed #e5e7eb", borderRadius: 8,
                    }}
                  >
                    + Add task
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add task modal */}
      {showAddTask && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setShowAddTask(false)}>
          <div style={modalStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1f2937" }}>
                New task
              </h3>
              <button onClick={() => setShowAddTask(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af" }}>×</button>
            </div>
            <TaskForm
              ref={taskFormRef}
              projectId={projectId}
              sprintId={sprintId}
              sprints={sprints}
              initialData={{ status: addToStatus }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAddTask(false)} style={secBtn}>Cancel</button>
              <button onClick={handleSaveTask} disabled={saving} style={{ ...priBtn, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TaskCard({ task, accentColor, onCycle, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";

  return (
    <div
      style={{
        background: "#fff", borderRadius: 10, padding: "10px 12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        borderLeft: `3px solid ${PRIORITY_COLOR[task.priority] || "#e5e7eb"}`,
        position: "relative",
      }}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Title */}
      <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#1f2937", lineHeight: 1.4 }}>
        {task.title}
      </p>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
          {task.tags.slice(0, 3).map((t) => (
            <span key={t} style={{
              padding: "1px 6px", borderRadius: 999, fontSize: 10,
              background: "#f3f4f6", color: "#6b7280", fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {task.story_points && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "1px 6px",
              borderRadius: 4, background: "#eef2ff", color: "#4f46e5",
            }}>{task.story_points}pt</span>
          )}
          {task.assignee && (
            <span style={{
              width: 20, height: 20, borderRadius: "50%",
              background: accentColor || "#4f46e5", color: "#fff",
              fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }} title={task.assignee}>
              {task.assignee[0].toUpperCase()}
            </span>
          )}
          {isOverdue && (
            <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 600 }}>Overdue</span>
          )}
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {/* Cycle status button */}
          <button
            onClick={onCycle}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "#9ca3af", padding: "2px 4px",
            }}
            title="Move to next status"
          >
            →
          </button>
          {/* Delete */}
          <button
            onClick={onDelete}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 15, color: "#d1d5db", padding: "2px 4px",
            }}
            title="Delete task"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 300, padding: 16,
};
const modalStyle = {
  background: "#fff", borderRadius: 14, padding: "24px",
  width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  maxHeight: "90vh", overflowY: "auto",
};
const priBtn = {
  padding: "9px 20px", borderRadius: 8, background: "#4f46e5",
  color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
};
const secBtn = {
  padding: "9px 16px", borderRadius: 8, background: "#f3f4f6",
  color: "#6b7280", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
};
