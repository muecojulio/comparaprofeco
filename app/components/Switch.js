"use client";

import { useId } from "react";

export default function Switch({ checked, onChange, label, name, disabled = false }) {
  const id = useId().replace(/:/g, "");
  const labelId = `switch-label-${id}`;
  const switchId = `switch-control-${id}`;

  return (
    <label className={`switch-row ${disabled ? "is-disabled" : ""}`.trim()} htmlFor={switchId}>
      <span id={labelId}>{label}</span>
      <button
        id={switchId}
        type="button"
        role="switch"
        name={name}
        aria-labelledby={labelId}
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        className="switch"
        onClick={() => onChange(!checked)}
      >
        <span className="switch-thumb" aria-hidden="true" />
      </button>
    </label>
  );
}
