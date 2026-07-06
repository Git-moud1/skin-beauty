"use client";

import { useEffect, useRef } from "react";

// Keeps keyboard focus inside an open dialog and returns it to the
// element that opened the dialog once it closes. Attach the returned
// ref to the dialog panel. Pass { autoFocus: false } when the dialog
// manages its own initial focus (e.g. focusing a specific input).
const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useFocusTrap({ autoFocus = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const visibleFocusables = () =>
      Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    // Focus the first focusable once content has mounted.
    let raf;
    if (autoFocus) {
      raf = requestAnimationFrame(() => {
        const items = visibleFocusables();
        (items[0] || node).focus();
      });
    }

    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const items = visibleFocusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !node.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKeyDown);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      node.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [autoFocus]);

  return ref;
}
