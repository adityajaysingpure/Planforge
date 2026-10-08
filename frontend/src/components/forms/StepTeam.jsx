import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useForm, useController } from "react-hook-form";

const COLORS = [
  "#4f46e5", "#0891b2", "#059669", "#dc2626",
  "#d97706", "#7c3aed", "#db2777", "#0284c7",
];

/**
 * StepTeam — color picker + team members
 *
 * Both fields are optional so validate() always passes.
 * color uses useController for the swatch selector.
 * team_members uses useController for the tag-style member list.
 */
const StepTeam = forwardRef(function StepTeam({ defaultValues = {} }, ref) {
  const { control, trigger, getValues } = useForm({
    defaultValues: {
      color:        defaultValues.color        || "#4f46e5",
      team_members: defaultValues.team_members || [],
    },
  });

  const { field: colorField }   = useController({ name: "color",        control });
  const { field: membersField } = useController({ name: "team_members", control });

  const [memberInput, setMemberInput] = useState("");

  useImperativeHandle(ref, () => ({
    async validate() { return await trigger(); },   // always true — optional fields
    getValues()      { return getValues(); },
  }));

  const addMember = (raw) => {
    const name = raw.trim();
    if (!name) return;
    const current = membersField.value || [];
    if (!current.includes(name) && current.length < 10) {
      membersField.onChange([...current, name]);
    }
    setMemberInput("");
  };

  const removeMember = (name) => {
    membersField.onChange((membersField.value || []).filter((m) => m !== name));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addMember(memberInput);
    }
    if (e.key === "Backspace" && !memberInput && membersField.value?.length > 0) {
      removeMember(membersField.value[membersField.value.length - 1]);
    }
  };

  return (
    <div>
      <h3 style={heading}>Team & appearance</h3>
      <p style={sub}>Add team members and pick a project color.</p>

      {/* Color picker */}
      <div style={{ marginBottom: 24 }}>
        <label style={lbl}>Project color</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => colorField.onChange(c)}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: c, border: "none", cursor: "pointer",
                outline: colorField.value === c ? `3px solid ${c}` : "none",
                outlineOffset: 3,
                transform: colorField.value === c ? "scale(1.15)" : "scale(1)",
                transition: "transform 0.15s, outline 0.15s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Team members */}
      <div>
        <label style={lbl}>
          Team members{" "}
          <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
        </label>
        <div
          style={{
            display: "flex", flexWrap: "wrap", gap: 6,
            padding: "10px 12px", borderRadius: 10,
            border: "1.5px solid #e5e7eb", minHeight: 52,
            cursor: "text", background: "#fff",
          }}
          onClick={(e) => e.currentTarget.querySelector("input")?.focus()}
        >
          {(membersField.value || []).map((m) => (
            <span key={m} style={memberTag}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%",
                background: colorField.value || "#4f46e5",
                color: "#fff", fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {m[0].toUpperCase()}
              </span>
              {m}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeMember(m); }}
                style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 14, padding: 0 }}
              >×</button>
            </span>
          ))}
          <input
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (memberInput.trim()) addMember(memberInput); }}
            placeholder={membersField.value?.length ? "" : "Type name and press Enter..."}
            style={{
              border: "none", outline: "none", fontSize: 13,
              minWidth: 140, flex: 1, fontFamily: "inherit",
            }}
          />
        </div>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9ca3af" }}>
          Press Enter or comma after each name.
        </p>
      </div>
    </div>
  );
});

export default StepTeam;

const heading  = { margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#1f2937" };
const sub      = { margin: "0 0 20px", fontSize: 14, color: "#6b7280" };
const lbl      = { display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#374151" };
const memberTag = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "3px 8px 3px 4px", borderRadius: 999,
  background: "#f3f4f6", fontSize: 13, color: "#374151",
};
