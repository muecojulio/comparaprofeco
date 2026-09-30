"use client";

export default function Switch({ checked, onChange, label, name }) {
  return (
    <label className="switch-row">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        name={name}
        aria-checked={checked}
        className={`switch ${checked ? "is-on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-thumb" />
      </button>
    </label>
  );
}
