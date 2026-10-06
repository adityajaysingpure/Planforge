import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useForm, useController } from "react-hook-form";

const SUGGESTIONS = [
  "ReactJS", "Python", "FastAPI", "MongoDB", "PostgreSQL",
  "Node.js", "TypeScript", "Docker", "AWS", "Redis",
  "GraphQL", "Next.js", "Django", "Flask", "Tailwind CSS",
];

/**
 * StepStack — react-hook-form with useController for the tag array field.
 *
 * tech_stack is a controlled array managed via RHF's useController.
 * validate() rule: at least one tag required.
 * Keyboard: Enter/comma adds tag, Backspace on empty input removes last.
 */
const StepStack = forwardRef(function StepStack({ defaultValues = {} }, ref) {
  const { control, trigger, getValues, formState: { errors } } = useForm({
    defaultValues: {
      tech_stack: defaultValues.tech_stack || [],
    },
    mode: "onTouched",
  });

  const { field } = useController({
    name: "tech_stack",
    control,
    rules: {
      validate: (v) =>
        (Array.isArray(v) && v.length > 0) || "Add at least one technology.",
    },
  });

  const [inputVal, setInputVal] = useState("");

  useImperativeHandle(ref, () => ({
    async validate() { return await trigger(); },
    getValues()      { return getValues(); },
  }));

  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag) return;
    const current = field.value || [];
    if (!current.includes(tag) && current.length < 12) {
      field.onChange([...current, tag]);
    }
    setInputVal("");
  };

  const removeTag = (tag) => {
    field.onChange((field.value || []).filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputVal);
    }
    if (e.key === "Backspace" && !inputVal && field.value?.length > 0) {
      removeTag(field.value[field.value.length - 1]);
    }
  };

  const hasError = !!errors.tech_stack;

  return (
    <div>
      <h3 style={heading}>Tech stack</h3>
      <p style={sub}>
        What technologies will this project use?{" "}
        <span style={{ color: "#9ca3af" }}>Press Enter or comma to add.</span>
      </p>

      {/* Tag input */}
      <div
        style={{
          display: "flex", flexWrap: "wrap", gap: 6,
          padding: "10px 12px", borderRadius: 10, minHeight: 52,
          border: `1.5px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
          cursor: "text", background: "#fff",
        }}
        onClick={(e) => e.currentTarget.querySelector("input")?.focus()}
      >
        {(field.value || []).map((tag) => (
          <span key={tag} style={tagStyle}>
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              style={tagX}
            >×</button>
          </span>
        ))}
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputVal.trim()) addTag(inputVal); }}
          placeholder={field.value?.length ? "" : "Type a technology..."}
          style={{
            border: "none", outline: "none", fontSize: 13,
            minWidth: 130, flex: 1, fontFamily: "inherit",
          }}
        />
      </div>
      {hasError && <p style={errStyle}>{errors.tech_stack.message}</p>}

      {/* Quick-add suggestions */}
      <div style={{ marginTop: 14 }}>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>
          QUICK ADD
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SUGGESTIONS
            .filter((s) => !(field.value || []).includes(s))
            .map((s) => (
              <button
                key={s} type="button"
                onClick={() => addTag(s)}
                style={suggStyle}
              >
                + {s}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
});

export default StepStack;

const heading  = { margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#1f2937" };
const sub      = { margin: "0 0 16px", fontSize: 14, color: "#6b7280" };
const errStyle = { margin: "4px 0 0", fontSize: 12, color: "#ef4444" };
const tagStyle = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "3px 8px 3px 10px", borderRadius: 999,
  background: "#eef2ff", color: "#4f46e5", fontSize: 13, fontWeight: 500,
};
const tagX = {
  background: "none", border: "none", color: "#6366f1",
  cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 0,
};
const suggStyle = {
  padding: "4px 12px", borderRadius: 999, fontSize: 12,
  border: "1px solid #e5e7eb", background: "#fff",
  color: "#6b7280", cursor: "pointer",
};
