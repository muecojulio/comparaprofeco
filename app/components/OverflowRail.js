"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

function assignRef(ref, value) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

const OverflowRail = forwardRef(function OverflowRail(
  {
    children,
    className = "",
    wrapperClassName = "",
    role,
    ariaLabel,
    ariaRoleDescription,
    keyboardScroll = false,
    suppressClickOnDrag = true,
    ...props
  },
  forwardedRef
) {
  const railRef = useRef(null);
  const pointerRef = useRef(null);
  const clearDragTimerRef = useRef(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const setRailRef = useCallback(
    (node) => {
      railRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef]
  );

  const updateEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const next = {
      start: maxScroll > 2 && rail.scrollLeft > 2,
      end: maxScroll > 2 && maxScroll - rail.scrollLeft > 2
    };

    setEdges((current) =>
      current.start === next.start && current.end === next.end ? current : next
    );
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    updateEdges();
    rail.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges, { passive: true });

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateEdges) : null;
    resizeObserver?.observe(rail);
    if (rail.firstElementChild) resizeObserver?.observe(rail.firstElementChild);

    const mutationObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(updateEdges)
        : null;
    mutationObserver?.observe(rail, { childList: true, subtree: true });

    return () => {
      rail.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      if (clearDragTimerRef.current) window.clearTimeout(clearDragTimerRef.current);
    };
  }, [updateEdges]);

  function handlePointerDown(event) {
    if (!suppressClickOnDrag || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    if (clearDragTimerRef.current) window.clearTimeout(clearDragTimerRef.current);
    pointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      dragged: false,
      pointerId: event.pointerId
    };
  }

  function handlePointerMove(event) {
    const pointer = pointerRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId || pointer.dragged) return;

    const dx = Math.abs(event.clientX - pointer.x);
    const dy = Math.abs(event.clientY - pointer.y);
    if (dx > 9 && dx > dy * 1.1) pointer.dragged = true;
  }

  function handlePointerUp(event) {
    if (!pointerRef.current || pointerRef.current.pointerId !== event.pointerId) return;
    if (pointerRef.current.dragged) pointerRef.current.suppressClick = true;

    // A click following pointerup is dispatched before this cleanup timer. Keep the
    // guard briefly for browsers that dispatch it after a native scroll settles.
    clearDragTimerRef.current = window.setTimeout(() => {
      pointerRef.current = null;
      clearDragTimerRef.current = null;
    }, 500);
  }

  function handlePointerCancel(event) {
    if (!pointerRef.current || pointerRef.current.pointerId !== event.pointerId) return;
    if (pointerRef.current.dragged) pointerRef.current.suppressClick = true;
    clearDragTimerRef.current = window.setTimeout(() => {
      pointerRef.current = null;
      clearDragTimerRef.current = null;
    }, 500);
  }

  function handleClickCapture(event) {
    if (event.detail !== 0 && pointerRef.current?.suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      pointerRef.current = null;
      if (clearDragTimerRef.current) window.clearTimeout(clearDragTimerRef.current);
      clearDragTimerRef.current = null;
      return;
    }

    if (event.detail === 0) pointerRef.current = null;
  }

  return (
    <div className={`overflow-rail ${wrapperClassName}`.trim()}>
      <div
        {...props}
        ref={setRailRef}
        className={`scroll-rail ${className}`.trim()}
        role={role}
        aria-label={ariaLabel}
        aria-roledescription={ariaRoleDescription}
        tabIndex={keyboardScroll && (edges.start || edges.end) ? 0 : undefined}
        onScroll={(event) => {
          props.onScroll?.(event);
          updateEdges();
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleClickCapture}
      >
        {children}
      </div>
      {edges.start && <span className="rail-fade rail-fade-start" aria-hidden="true" />}
      {edges.end && <span className="rail-fade rail-fade-end" aria-hidden="true" />}
    </div>
  );
});

export default OverflowRail;
