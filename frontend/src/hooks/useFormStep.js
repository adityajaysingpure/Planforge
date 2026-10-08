import { useState, useRef } from "react";

/**
 * useFormStep
 * -----------
 * Manages multi-step form navigation where each step
 * owns its own react-hook-form instance via forwardRef.
 *
 * Each step ref exposes:
 *   validate()  → async, returns boolean (RHF trigger)
 *   getValues() → returns that step's field values
 *
 * goNext() calls validate() and blocks if it returns false.
 * RHF handles showing inline errors — no need to pass errors down.
 */
export function useFormStep(totalSteps) {
  const [step, setStep] = useState(0);

  // Fixed array of refs — one per step
  const stepRefs = Array.from({ length: totalSteps }, () => useRef(null));

  const goNext = async () => {
    const ref = stepRefs[step]?.current;
    if (!ref) { setStep((s) => Math.min(s + 1, totalSteps - 1)); return true; }

    const valid = await ref.validate();
    if (!valid) return false;

    setStep((s) => Math.min(s + 1, totalSteps - 1));
    return true;
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const goTo = (n) => {
    if (n < step) setStep(n);
  };

  return { step, stepRefs, goNext, goPrev, goTo };
}
