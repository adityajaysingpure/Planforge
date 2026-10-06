import React, { useRef, useState } from "react";
import StepBasics from "./StepBasics";
import StepStack  from "./StepStack";
import StepTeam   from "./StepTeam";
import StepReview from "./StepReview";

const STEPS = ["Basics", "Stack", "Team", "Review"];
const STEP_COMPONENTS = [StepBasics, StepStack, StepTeam, StepReview];

/**
 * ProjectWizard
 * -------------
 * Each step owns its own useForm instance (via forwardRef).
 * The parent collects values from each step ref via getValues()
 * and merges them as the user progresses.
 *
 * On Next:
 *   1. Call stepRefs[current].current.validate() — RHF triggers all rules
 *   2. If valid: call getValues() to snapshot this step's data into mergedData
 *   3. Advance step
 *
 * On Submit:
 *   Fire onSubmit with the fully merged data object.
 */
export default function ProjectWizard({ onSubmit, onCancel, submitting }) {
  const [step, setStep]           = useState(0);
  const [mergedData, setMergedData] = useState({ color: "#4f46e5", status: "active" });

  // One ref per step
  const stepRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const goNext = async () => {
    const ref = stepRefs[step]?.current;
    if (!ref) return;

    const valid = await ref.validate();
    if (!valid) return;                     // RHF already shows inline errors

    // Snapshot this step's values into mergedData
    const values = ref.getValues();
    setMergedData((prev) => ({ ...prev, ...values }));
    setStep((s) => s + 1);
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const goTo = (n) => {
    if (n < step) setStep(n);
  };

  const handleSubmit = async () => {
    // Collect final merged snapshot (StepReview returns empty — data already merged)
    const payload = { ...mergedData };
    if (!payload.start_date) delete payload.start_date;
    if (!payload.end_date)   delete payload.end_date;
    await onSubmit(payload);
  };

  const StepComponent = STEP_COMPONENTS[step];

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={modal}>

        {/* Step indicator */}
        <div style={{ padding: "20px 24px 0" }}>
          <div style={{ display: "flex", gap: 0 }}>
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div
                  onClick={() => i < step && goTo(i)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    cursor: i < step ? "pointer" : "default",
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    background: i < step ? "#4f46e5" : i === step ? "#eef2ff" : "#f3f4f6",
                    color: i < step ? "#fff" : i === step ? "#4f46e5" : "#9ca3af",
                    border: i === step ? "2px solid #4f46e5" : "2px solid transparent",
                    transition: "all 0.2s",
                  }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span style={{
                    fontSize: 11, marginTop: 4, fontWeight: 600,
                    color: i === step ? "#4f46e5" : i < step ? "#374151" : "#9ca3af",
                  }}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, marginTop: 14, alignSelf: "flex-start",
                    background: i < step ? "#4f46e5" : "#f3f4f6",
                    transition: "background 0.3s",
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div style={{ padding: "24px 24px 0", flex: 1, overflowY: "auto" }}>
          <StepComponent
            ref={stepRefs[step]}
            defaultValues={mergedData}
            mergedData={mergedData}      /* StepReview uses this */
            onGoTo={goTo}               /* StepReview edit shortcuts */
          />
        </div>

        {/* Navigation */}
        <div style={{
          padding: "16px 24px 20px", marginTop: 20,
          display: "flex", justifyContent: "space-between",
          borderTop: "1px solid #f3f4f6",
        }}>
          <button
            type="button"
            onClick={step === 0 ? onCancel : goPrev}
            style={secBtn}
          >
            {step === 0 ? "Cancel" : "← Back"}
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={goNext} style={priBtn}>
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              style={{ ...priBtn, opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "Creating..." : "🚀 Create Project"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 200, padding: 16,
};
const modal = {
  background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520,
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  display: "flex", flexDirection: "column", maxHeight: "90vh",
};
const priBtn = {
  padding: "10px 24px", borderRadius: 10, background: "#4f46e5",
  color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
};
const secBtn = {
  padding: "10px 20px", borderRadius: 10, background: "#f3f4f6",
  color: "#6b7280", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer",
};
