import React, { forwardRef, useImperativeHandle } from "react";
import { useForm, useController } from "react-hook-form";

const PRIORITIES = ["low", "medium", "high", "urgent"];
const STATUSES   = ["todo", "in_progress", "in_review", "done"];
const POINTS     = [1, 2, 3, 5, 8, 13];

const PRIORITY_COLOR = {
  low: "#22c55e", medium: "#f59e0b",
  high: "#ef4444", urgent: "#7f1d1d",
};

/**
 * TaskForm — react-hook-form + forwardRef + useImperativeHandle
 *
 * Exposes:
 *   validate()  → triggers RHF validation, returns boolean
 *   getValues() → returns payload ready to POST/PATCH
 *
 * Custom fields (priority pills, story points, tags) use useController
 * so RHF tracks their values and includes them in getValues().
 */
const TaskForm = forwardRef(function TaskForm(
  { projectId, sprintId, sprints = [], initialData = {} },
  ref
) {
  const {
    register,
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title:        initialData.title        || "",
      description:  initialData.description  || "",
      priority:     initialData.priority     || "medium",
      status:       initialData.status       || "todo",
      assignee:     initialData.assignee     || "",
      story_points: initialData.story_points || null,
      tags:         initialData.tags         || [],
      due_date:     initialData.due_date
        ? new Date(initialData.due_date).toISOString().slice(0, 10)
        : "",
      sprint_id:    initialData.sprint_id || sprintId || "",
    },
    mode: "onTouched",
  });

  // Controlled fields (not native inputs)
  const { field: priorityField }     = useController({ name: "priority",     control });
  const { field: storyPointsField }  = useController({ name: "story_points", control });
  const { field: tagsField }         = useController({ name: "tags",         control });

  useImperativeHandle(ref, () => ({
    async validate() {
      return await trigger();
    },
    getValues() {
      const vals = getValues();
      return {
        ...vals,
        project_id:   projectId,
        sprint_id:    vals.sprint_id || null,
        story_points: vals.story_points ? Number(vals.story_points) : null,
        due_date:     vals.due_date
          ? new Date(vals.due_date).toISOString()
          : null,
      };
    },
  }));

  const addTag = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const input = e.target;
    const tag   = input.value.trim();
    if (tag && !tagsField.value.includes(tag) && tagsField.value.length < 6) {
      tagsField.onChange([...tagsField.value, tag]);
      input.value = "";
    }
  };

  const removeTag = (tag) => {
    tagsField.onChange(tagsField.value.filter((t) => t !== tag));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Title */}
      <div>
        <input
          {...register("title", {
            required:  "Title is required.",
            maxLength: { value: 120, message: "Keep it under 120 characters." },
            validate:  (v) => v.trim().length > 0 || "Title cannot be blank.",
          })}
          placeholder="Task title..."
          autoFocus
          style={{
            ...inp,
            fontSize: 15, fontWeight: 600,
            borderColor: errors.title ? "#ef4444" : "#e5e7eb",
          }}
        />
        {errors.title && <p style={errStyle}>{errors.title.message}</p>}
      </div>

      {/* Description */}
      <textarea
        {...register("description")}
        placeholder="Add a description..."
        rows={3}
        style={{ ...inp, resize: "vertical" }}
      />

      {/* Priority pills — useController */}
      <div>
        <label style={lbl}>Priority</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PRIORITIES.map((p) => (
            <button
              key={p} type="button"
              onClick={() => priorityField.onChange(p)}
              style={{
                padding: "5px 12px", borderRadius: 999, fontSize: 12,
                fontWeight: 600, border: "none", cursor: "pointer",
                textTransform: "capitalize",
                background: priorityField.value === p
                  ? PRIORITY_COLOR[p] : "#f3f4f6",
                color: priorityField.value === p ? "#fff" : "#6b7280",
              }}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* Status + Assignee */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Status</label>
          <select {...register("status")} style={inp}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lbl}>Assignee</label>
          <input
            {...register("assignee")}
            placeholder="Name or @handle"
            style={inp}
          />
        </div>
      </div>

      {/* Story points — useController */}
      <div>
        <label style={lbl}>Story points</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {POINTS.map((p) => (
            <button
              key={p} type="button"
              onClick={() =>
                storyPointsField.onChange(
                  storyPointsField.value === p ? null : p
                )
              }
              style={{
                width: 34, height: 30, borderRadius: 6, fontSize: 12,
                fontWeight: 600, border: "none", cursor: "pointer",
                background: storyPointsField.value === p ? "#4f46e5" : "#f3f4f6",
                color: storyPointsField.value === p ? "#fff" : "#6b7280",
              }}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* Due date + Sprint */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Due date</label>
          <input type="date" {...register("due_date")} style={inp} />
        </div>
        {sprints.length > 0 && (
          <div>
            <label style={lbl}>Sprint</label>
            <select {...register("sprint_id")} style={inp}>
              <option value="">Backlog</option>
              {sprints.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tags — useController */}
      <div>
        <label style={lbl}>Tags</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
          {tagsField.value.map((t) => (
            <span key={t} style={tagStyle}>
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, fontSize: 13 }}
              >×</button>
            </span>
          ))}
        </div>
        <input
          onKeyDown={addTag}
          placeholder="Type a tag and press Enter..."
          style={{ ...inp, marginTop: 2 }}
        />
      </div>
    </div>
  );
});

export default TaskForm;

const inp = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};
const lbl = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "#9ca3af", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.04em",
};
const errStyle = { margin: "4px 0 0", fontSize: 12, color: "#ef4444" };
const tagStyle = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "2px 8px", borderRadius: 999,
  background: "#f3f4f6", fontSize: 12, color: "#374151",
};
