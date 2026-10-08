import React, { forwardRef, useImperativeHandle, useEffect } from "react";
import { useForm } from "react-hook-form";

/**
 * StepBasics — react-hook-form + forwardRef + useImperativeHandle
 *
 * Owns its own useForm instance. Exposes two methods to the parent:
 *   validate()   → triggers RHF validation, returns true/false
 *   getValues()  → returns the current field values for final merge
 *
 * The parent wizard never manages these fields directly.
 * Auto-focus on name field via RHF's setFocus.
 */
const StepBasics = forwardRef(function StepBasics({ defaultValues = {} }, ref) {
  const {
    register,
    trigger,
    getValues,
    setFocus,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name:        defaultValues.name        || "",
      description: defaultValues.description || "",
      start_date:  defaultValues.start_date  || "",
      end_date:    defaultValues.end_date    || "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  useImperativeHandle(ref, () => ({
    async validate() {
      return await trigger();          // RHF validates all registered fields
    },
    getValues() {
      return getValues();
    },
  }));

  return (
    <div>
      <h3 style={heading}>Project basics</h3>
      <p style={sub}>Give your project a name and a short description.</p>

      <Field label="Project name" required error={errors.name?.message}>
        <input
          {...register("name", {
            required: "Project name is required.",
            minLength: { value: 3, message: "Must be at least 3 characters." },
            maxLength: { value: 60, message: "Keep it under 60 characters." },
            validate: (v) => v.trim().length >= 3 || "Must be at least 3 characters.",
          })}
          placeholder="e.g. Customer Portal Redesign"
          style={{ ...inp, borderColor: errors.name ? "#ef4444" : "#e5e7eb" }}
        />
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <textarea
          {...register("description", {
            maxLength: { value: 300, message: "Keep description under 300 characters." },
          })}
          placeholder="What is this project trying to achieve?"
          rows={4}
          style={{ ...inp, resize: "vertical" }}
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Start date" error={errors.start_date?.message}>
          <input
            type="date"
            {...register("start_date")}
            style={inp}
          />
        </Field>
        <Field label="End date" error={errors.end_date?.message}>
          <input
            type="date"
            {...register("end_date", {
              validate: (v, all) => {
                if (v && all.start_date && v < all.start_date)
                  return "End date must be after start date.";
                return true;
              },
            })}
            style={inp}
          />
        </Field>
      </div>
    </div>
  );
});

export default StepBasics;

function Field({ label, required, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={lbl}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
      {error && <p style={err}>{error}</p>}
    </div>
  );
}

const heading = { margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#1f2937" };
const sub     = { margin: "0 0 20px", fontSize: 14, color: "#6b7280" };
const lbl     = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" };
const inp     = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
const err = { margin: "4px 0 0", fontSize: 12, color: "#ef4444" };
