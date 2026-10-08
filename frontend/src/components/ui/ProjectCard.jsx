import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectStats } from "../../services/api";

const STATUS_LABEL = {
  active:    { label: "Active",    color: "#22c55e" },
  on_hold:   { label: "On Hold",   color: "#f59e0b" },
  completed: { label: "Completed", color: "#4f46e5" },
  archived:  { label: "Archived",  color: "#9ca3af" },
};

export default function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getProjectStats(project._id)
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, [project._id]);

  const pct = stats?.completion_pct || 0;
  const r   = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const statusMeta = STATUS_LABEL[project.status] || STATUS_LABEL.active;

  return (
    <div
      onClick={() => navigate(`/project/${project._id}`)}
      style={{
        background: "#fff", borderRadius: 14, padding: "18px 18px 14px",
        boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
        borderTop: `4px solid ${project.color || "#4f46e5"}`,
        cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 8px rgba(0,0,0,0.07)";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, paddingRight: 10 }}>
          <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 15, color: "#1f2937" }}>
            {project.name}
          </p>
          {project.description && (
            <p style={{
              margin: "0 0 10px", fontSize: 12, color: "#9ca3af",
              lineHeight: 1.5,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {project.description}
            </p>
          )}
        </div>

        {/* Progress ring */}
        <svg width={54} height={54} style={{ flexShrink: 0 }}>
          <circle cx={27} cy={27} r={r} fill="none" stroke="#f3f4f6" strokeWidth={4} />
          <circle
            cx={27} cy={27} r={r}
            fill="none"
            stroke={project.color || "#4f46e5"}
            strokeWidth={4}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 27 27)"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
          <text x={27} y={31} textAnchor="middle" fontSize={10} fontWeight={700} fill="#1f2937">
            {pct}%
          </text>
        </svg>
      </div>

      {/* Tech stack chips */}
      {project.tech_stack?.length > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
          {project.tech_stack.slice(0, 4).map((t) => (
            <span key={t} style={{
              padding: "2px 8px", borderRadius: 999, fontSize: 11,
              background: `${project.color || "#4f46e5"}18`,
              color: project.color || "#4f46e5", fontWeight: 600,
            }}>{t}</span>
          ))}
          {project.tech_stack.length > 4 && (
            <span style={{ fontSize: 11, color: "#9ca3af", padding: "2px 4px" }}>
              +{project.tech_stack.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
            color: statusMeta.color,
            background: `${statusMeta.color}18`,
          }}>{statusMeta.label}</span>

          {stats && (
            <span style={{ fontSize: 11, color: "#9ca3af" }}>
              {stats.done}/{stats.total} tasks
            </span>
          )}
        </div>

        {/* Team avatars */}
        {project.team_members?.length > 0 && (
          <div style={{ display: "flex" }}>
            {project.team_members.slice(0, 4).map((m, i) => (
              <span key={m} style={{
                width: 22, height: 22, borderRadius: "50%",
                background: project.color || "#4f46e5",
                color: "#fff", fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginLeft: i > 0 ? -6 : 0,
                border: "2px solid #fff",
              }} title={m}>{m[0].toUpperCase()}</span>
            ))}
          </div>
        )}
      </div>

      {/* Delete button — stop propagation so card click doesn't fire */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(project._id); }}
        style={{
          position: "absolute", top: 10, right: 10,
          background: "none", border: "none",
          color: "#e5e7eb", cursor: "pointer", fontSize: 16,
          opacity: 0, transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = "#ef4444"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; }}
        title="Delete project"
      >×</button>
    </div>
  );
}
