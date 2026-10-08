import React, { forwardRef, useImperativeHandle } from "react";

/**
 * StepReview — no form, just display.
 *
 * Receives the merged data from the parent wizard.
 * validate() always returns true — user reviews and submits.
 * getValues() returns empty object — parent already has all data.
 */
const StepReview = forwardRef(function StepReview({ mergedData = {}, onGoTo }, ref) {
  useImperativeHandle(ref, () => ({
    async validate() { return true; },
    getValues()      { return {}; },
  }));

  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  return (
    <div>
      <h3 style={heading}>Review & create</h3>
      <p style={sub}>Everything look good? Hit Create to launch your project.</p>

      <Section label="Basics" onEdit={() => onGoTo(0)}>
        <Row label="Name">
          <strong style={{ color: mergedData.color || "#4f46e5" }}>{mergedData.name}</strong>
        </Row>
        {mergedData.description && (
          <Row label="Description">
            <span style={{ color: "#6b7280" }}>{mergedData.description}</span>
          </Row>
        )}
        <Row label="Timeline">
          {fmt(mergedData.start_date)} → {fmt(mergedData.end_date)}
        </Row>
      </Section>

      <Section label="Tech Stack" onEdit={() => onGoTo(1)}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(mergedData.tech_stack || []).map((t) => (
            <span key={t} style={{
              padding: "3px 10px", borderRadius: 999, fontSize: 12,
              background: "#eef2ff", color: "#4f46e5", fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>
      </Section>

      <Section label="Team & Color" onEdit={() => onGoTo(2)}>
        <Row label="Color">
          <span style={{
            display: "inline-block", width: 14, height: 14, borderRadius: "50%",
            background: mergedData.color || "#4f46e5", verticalAlign: "middle", marginRight: 6,
          }} />
          {mergedData.color || "#4f46e5"}
        </Row>
        <Row label="Members">
          {(mergedData.team_members || []).length > 0
            ? (mergedData.team_members || []).join(", ")
            : <span style={{ color: "#9ca3af" }}>No members added</span>}
        </Row>
      </Section>
    </div>
  );
});

export default StepReview;

function Section({ label, onEdit, children }) {
  return (
    <div style={{
      marginBottom: 14, padding: "14px 16px", borderRadius: 10,
      background: "#f9fafb", border: "1px solid #f3f4f6",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </p>
        <button onClick={onEdit} type="button" style={{
          background: "none", border: "none", fontSize: 12,
          color: "#4f46e5", cursor: "pointer", fontWeight: 600,
        }}>Edit</button>
      </div>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: 13 }}>
      <span style={{ minWidth: 90, color: "#9ca3af", fontWeight: 500 }}>{label}</span>
      <span style={{ color: "#1f2937", flex: 1 }}>{children}</span>
    </div>
  );
}

const heading = { margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#1f2937" };
const sub     = { margin: "0 0 20px", fontSize: 14, color: "#6b7280" };
