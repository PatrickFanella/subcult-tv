import React from "react";
/* The Commons mark: a lattice of shared plots with one claimed square.
   Colours come from the design tokens so it follows light and dark mode. */
export function Mark({ size = 28, className = "" }) {
  return (
    <svg
      className={"mark " + className}
      width={size}
      height={size}
      viewBox="0 0 44 44"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="2"
        y="2"
        width="40"
        height="40"
        fill="var(--paper-2)"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M10 16h24M10 22h24M10 28h24M16 10v24M22 10v24M28 10v24"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect x="22" y="22" width="6" height="6" fill="var(--clay)" />
    </svg>
  );
}
