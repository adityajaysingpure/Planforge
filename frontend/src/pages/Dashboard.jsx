import React, { useState } from "react";
import ProjectCard   from "../components/ui/ProjectCard";
import ProjectWizard from "../components/forms/ProjectWizard";
import { useProjects } from "../hooks/useProjects";

const STATUS_FILTERS = ["all", "active", "on_hold", "completed", "archived"];

export default function Dashboard() {
  const { projects, loading, add, remove } = useProjects();
  const [showWizard, setShowWizard]  = useState(false);
  const [submitting, setSubmitting]  = useState(false);
  const [filter, setFilter]          = useState("all");
  const [search, setSearch]          = useState("");

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await add(data);
      setShowWizard(false);
    } finally {
      setSubmitting(false);
    }
  };

  const visible = projects.filter((p) => {
    const matchFilter = filter === "all" || p.status === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#1f2937" }}>
            Projects
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#9ca3af" }}>
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          style={primaryBtn}
        >
          + New Project
        </button>
      </div>

      {/* Filters + search */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          style={{
            padding: "8px 14px", borderRadius: 10,
            border: "1.5px solid #e5e7eb", fontSize: 13,
            outline: "none", minWidth: 200,
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "8px 14px", borderRadius: 999, fontSize: 12,
              fontWeight: 600, border: "none", cursor: "pointer",
              textTransform: "capitalize",
              background: filter === f ? "#1f2937" : "#f3f4f6",
              color: filter === f ? "#fff" : "#6b7280",
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Project grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 180, background: "#f3f4f6", borderRadius: 14 }} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
          <p style={{ fontSize: 40, margin: "0 0 12px" }}>🗂️</p>
          <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 8px", color: "#374151" }}>
            {search || filter !== "all" ? "No projects match your filter." : "No projects yet."}
          </p>
          {!search && filter === "all" && (
            <button onClick={() => setShowWizard(true)} style={{ ...primaryBtn, marginTop: 12 }}>
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}>
          {visible.map((p) => (
            <ProjectCard key={p._id} project={p} onDelete={remove} />
          ))}
        </div>
      )}

      {showWizard && (
        <ProjectWizard
          onSubmit={handleCreate}
          onCancel={() => setShowWizard(false)}
          submitting={submitting}
        />
      )}
    </div>
  );
}

const primaryBtn = {
  padding: "10px 20px", borderRadius: 10, background: "#4f46e5",
  color: "#fff", border: "none", fontWeight: 700, fontSize: 14,
  cursor: "pointer",
};
