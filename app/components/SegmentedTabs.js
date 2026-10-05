"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import OverflowRail from "./OverflowRail";

function getScrollBehavior() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    ? "auto"
    : "smooth";
}

export default function SegmentedTabs({
  tabs,
  value,
  onChange,
  idBase,
  ariaLabel,
  panelId
}) {
  const railRef = useRef(null);
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const activeTab = tabs.find((tab) => tab.value === value);

  const updateIndicator = useCallback(() => {
    const activeButton = tabRefs.current[value];
    if (!activeButton) {
      setIndicator({ left: 0, width: 0 });
      return;
    }

    setIndicator({ left: activeButton.offsetLeft, width: activeButton.offsetWidth });
  }, [value]);

  const centerActiveTab = useCallback(() => {
    const rail = railRef.current;
    const activeButton = tabRefs.current[value];
    if (!rail || !activeButton) return;

    const left = Math.max(
      0,
      activeButton.offsetLeft - (rail.clientWidth - activeButton.offsetWidth) / 2
    );
    rail.scrollTo({ left, behavior: getScrollBehavior() });
  }, [value]);

  useEffect(() => {
    updateIndicator();
    centerActiveTab();

    const rail = railRef.current;
    if (!rail || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(() => {
      updateIndicator();
      centerActiveTab();
    });
    observer.observe(rail);
    if (rail.firstElementChild) observer.observe(rail.firstElementChild);
    Object.values(tabRefs.current).forEach((button) => {
      if (button) observer.observe(button);
    });

    return () => observer.disconnect();
  }, [centerActiveTab, updateIndicator]);

  function moveFocus(event) {
    const currentIndex = tabs.findIndex((tab) => tab.value === value);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    onChange(nextTab.value);
    tabRefs.current[nextTab.value]?.focus();
  }

  if (!activeTab) return null;

  return (
    <OverflowRail
      ref={railRef}
      className="segmented-scroll"
      wrapperClassName="segmented-rail-shell"
      role="region"
      ariaLabel="Pestañas de evaluación"
      ariaRoleDescription="lista desplazable"
    >
      <div
        className="segmented-tabs"
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
      >
        <span
          className="tab-indicator"
          aria-hidden="true"
          style={{
            width: `${indicator.width}px`,
            transform: `translateX(${indicator.left}px)`
          }}
        />
        {tabs.map((tab) => {
          const selected = tab.value === value;
          const tabId = `${idBase}-tab-${tab.value}`;
          return (
            <button
              key={tab.value}
              ref={(node) => {
                if (node) tabRefs.current[tab.value] = node;
                else delete tabRefs.current[tab.value];
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-label={tab.ariaLabel || tab.label}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className="tab segmented-tab"
              onClick={() => onChange(tab.value)}
              onKeyDown={moveFocus}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </OverflowRail>
  );
}
