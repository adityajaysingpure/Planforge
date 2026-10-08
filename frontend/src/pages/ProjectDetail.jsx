import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SprintBoard from "../components/board/SprintBoard";
import { getProjects, getSprints, createSprint, updateSprint, deleteSprint } from "../services/api";

export default function ProjectDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [project, setProject]       = useState(null);
  const [sprints, setSprints]       = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showNewSprint, setShowNewSprint] = useState(false);
  const [sprintForm, setSprintForm] = useState({ name: "", goal: "", start_date: "", end_date: "" });
  const [saving, setSaving]         = useState(false);
  const [viewMode, setViewMode]     = useState("board"); // "board" | "backlog"

  useEffect(() => {
    Promise.all([
      getProjects().then((r) => r.data.find((p) => p._id === id)),
      getSprints(id),
    ]).then(([proj, sprintRes]) => {
      setProject(proj || null);
      const sprintList = sprintRes.data;
      setSprints(sprintList);
      const active = sprintList.find((s) => s.is_active);
      setActiveSprint(active || sprintList[0] || null);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleCreateSprint = async () => {
    if (!sprintForm.name.trim()) return;
    setSaving(true);
    try {
      const res = await createSprint({ ...sprintForm, project_id: id });
      setSprints((prev) => [...prev, res.data]);
      if (!activeSprint) setActiveSprint(res.data);
      setShowNewSprint(false);
      setSprintForm({ name: "", goal: "", start_date: "", end_date: "" });
    } finally {
      setSaving(false);
    }
  };

  const handleActivateSprint = async (sprint) => {
    await updateSprint(sprint._id, { is_active: true });
    setSprints((prev) => prev.map((s) => ({ ...s, is_active: s._id === sprint._id })));
    setActiveSprint({ ...sprint, is_active: true });
  };

  const handleDeleteSprint = async (sprint) => {
    await deleteSprint(sprint._id);
    const updated = sprints.filter((s) => s._id !== sprint._id);
    setSprints(updated);
    if (activeSprint?._id === sprint._id) {
      setActiveSprint(updated[0] || null);
    }
  };

  if (loading) return <div style={{ padding: 32, color: "#9ca3af" }}>Loading...</div>;
  if (!project) return <div style={{ padding: 32 }}>Project not found. <button onClick={() => navigate("/")}>Go back</button></div>;

  const accentColor = project.color || "#4f46e5";

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb" }}>

      {/* Sub-nav */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #f3f4f6",
        padding: "0 24px", display: "flex", alignItems: "center",
        gap: 20, height: 52,
      }}>
        <button
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 13 }}
        >
          ← Projects
        </button>

        <div style={{ width: 1, height: 20, background: "#f3f4f6" }} />

        {/* Sprint selector */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {sprints.map((s) => (
            <button
              key={s._id}
              onClick={() => setActiveSprint(s)}
              style={{
                padding: "4px 12px", borderRadius: 999, fontSize: 12,
                fontWeight: 600, border: "none", cursor: "pointer",
                background: activeSprint?._id === s._id ? accentColor : "#f3f4f6",
                color: activeSprint?._id === s._id ? "#fff" : "#6b7280",
                position: "relative",
              }}
            >
              {s.name}
              {s.is_active && (
                <span style={{
                  position: "absolute", top: -3, right: -3,
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#22c55e", border: "1.5px solid #fff",
                }} />
              )}
            </button>
          ))}
          <button
            onClick={() => setShowNewSprint(true)}
            style={{
              padding: "4px 10px", borderRadius: 999, fontSize: 12,
              border: "1.5px dashed #d1d5db", background: "none",
              color: "#9ca3af", cursor: "pointer", fontWeight: 600,
            }}
          >+ Sprint</button>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {activeSprint && !activeSprint.is_active && (
            <button
              onClick={() => handleActivateSprint(activeSprint)}
              style={{
                padding: "5px 14px", borderRadius: 8, fontSize: 12,
                fontWeight: 600, border: `1.5px solid ${accentColor}`,
                color: accentColor, background: "none", cursor: "pointer",
              }}
            >▶ Activate</button>
          )}
          {["board", "backlog"].map((m) => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 12,
              fontWeight: 600, border: "none", cursor: "pointer",
              textTransform: "capitalize",
              background: viewMode === m ? "#1f2937" : "#f3f4f6",
              color: viewMode === m ? "#fff" : "#6b7280",
            }}>{m}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1f2937" }}>
            <span style={{ color: accentColor }}>●</span> {project.name}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>
            {activeSprint
              ? `${activeSprint.name}${activeSprint.is_active ? " · Active" : ""}`
              : "No sprint selected"}
            {activeSprint?.goal && ` · Goal: ${activeSprint.goal}`}
          </p>
        </div>

        {activeSprint ? (
          <SprintBoard
            projectId={id}
            sprintId={viewMode === "backlog" ? "backlog" : activeSprint._id}
            sprints={sprints}
            accentColor={accentColor}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            <p style={{ fontSize: 36, margin: "0 0 12px" }}>🏃</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>No sprints yet.</p>
            <p style={{ fontSize: 13 }}>Create a sprint to start planning your work.</p>
            <button onClick={() => setShowNewSprint(true)} style={{ ...priBtn, marginTop: 14 }}>
              + Create first sprint
            </button>
          </div>
        )}
      </div>

      {/* New sprint modal */}
      {showNewSprint && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setShowNewSprint(false)}>
          <div style={modalStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>New Sprint</h3>
              <button onClick={() => setShowNewSprint(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { key: "name", label: "Sprint name *", type: "text", placeholder: "e.g. Sprint 1 — Auth" },
                { key: "goal", label: "Sprint goal", type: "text", placeholder: "What will this sprint deliver?" },
                { key: "start_date", label: "Start date", type: "date" },
                { key: "end_date",   label: "End date",   type: "date" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{label}</label>
                  <input
                    type={type}
                    value={sprintForm[key]}
                    onChange={(e) => setSprintForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 8,
                      border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none",
                      fontFamily: "inherit", boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
              <button onClick={() => setShowNewSprint(false)} style={secBtn}>Cancel</button>
              <button onClick={handleCreateSprint} disabled={saving || !sprintForm.name.trim()} style={{ ...priBtn, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Creating..." : "Create Sprint"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 200, padding: 16,
};
const modalStyle = {
  background: "#fff", borderRadius: 14, padding: 24,
  width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
};
const priBtn = {
  padding: "9px 20px", borderRadius: 8, background: "#4f46e5",
  color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
};
const secBtn = {
  padding: "9px 16px", borderRadius: 8, background: "#f3f4f6",
  color: "#6b7280", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
};
