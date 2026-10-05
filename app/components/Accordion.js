"use client";

import { useId, useState } from "react";

export default function Accordion({ title, children, initiallyOpen = false }) {
  const baseId = `accordion-${useId().replace(/:/g, "")}`;
  const triggerId = `${baseId}-trigger`;
  const panelId = `${baseId}-panel`;
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <section className={`accordion ${open ? "is-open" : ""}`}>
      <h2 className="accordion-heading">
        <button
          className="accordion-trigger"
          id={triggerId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        >
          <span>{title}</span>
          <span className="accordion-chevron" aria-hidden="true">⌄</span>
        </button>
      </h2>
      <div
        className="accordion-panel"
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="accordion-panel-inner">{children}</div>
      </div>
    </section>
  );
}
