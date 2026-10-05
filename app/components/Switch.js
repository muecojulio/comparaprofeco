"use client";

import { useId } from "react";

export default function Switch({ checked, onChange, label, name }) {
  const id = useId().replace(/:/g, "");
  const labelId = `switch-label-${id}`;
  const switchId = `switch-control-${id}`;

  return (
    <label className="switch-row" htmlFor={switchId}>
      <span id={labelId}>{label}</span>
      <button
        id={switchId}
        type="button"
        role="switch"
        name={name}
        aria-labelledby={labelId}
        aria-checked={checked}
        className="switch"
        onClick={() => onChange(!checked)}
      >
        <span className="switch-thumb" aria-hidden="true" />
      </button>
    </label>
  );
}
