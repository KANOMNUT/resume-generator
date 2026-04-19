/**
 * Shared inline style objects for form inputs.
 * Using inline styles so we can reference CSS custom properties at runtime.
 */
import React from "react";

const BASE_INPUT: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  border: "1px solid var(--line)",
  borderRadius: "var(--radius-sm)",
  background: "var(--panel)",
  fontSize: "13.5px",
  color: "var(--ink)",
  outline: "none",
  transition: "border-color .1s, box-shadow .1s",
};

const SELECT_BG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'><path d='M2 4l3 3 3-3' fill='none' stroke='%23878a92' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/></svg>\") no-repeat right 10px center";

export function StyledInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      style={{ ...BASE_INPUT, ...props.style }}
      onMouseEnter={(e) => {
        if (document.activeElement !== e.currentTarget) {
          e.currentTarget.style.borderColor = "#d8d8d3";
        }
      }}
      onMouseLeave={(e) => {
        if (document.activeElement !== e.currentTarget) {
          e.currentTarget.style.borderColor = "var(--line)";
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.boxShadow =
          "0 0 0 3px color-mix(in oklab, var(--accent) 18%, transparent)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

export function StyledTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      style={{
        ...BASE_INPUT,
        resize: "vertical",
        minHeight: "80px",
        lineHeight: 1.5,
        ...props.style,
      }}
      onMouseEnter={(e) => {
        if (document.activeElement !== e.currentTarget) {
          e.currentTarget.style.borderColor = "#d8d8d3";
        }
      }}
      onMouseLeave={(e) => {
        if (document.activeElement !== e.currentTarget) {
          e.currentTarget.style.borderColor = "var(--line)";
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.boxShadow =
          "0 0 0 3px color-mix(in oklab, var(--accent) 18%, transparent)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

export function StyledSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    children: React.ReactNode;
  }
) {
  return (
    <select
      {...props}
      style={{
        ...BASE_INPUT,
        appearance: "none",
        WebkitAppearance: "none",
        background: `${SELECT_BG}, var(--panel)`,
        paddingRight: "28px",
        ...props.style,
      }}
      onMouseEnter={(e) => {
        if (document.activeElement !== e.currentTarget) {
          e.currentTarget.style.borderColor = "#d8d8d3";
        }
      }}
      onMouseLeave={(e) => {
        if (document.activeElement !== e.currentTarget) {
          e.currentTarget.style.borderColor = "var(--line)";
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.boxShadow =
          "0 0 0 3px color-mix(in oklab, var(--accent) 18%, transparent)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

export function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        marginTop: "10px",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        height: "32px",
        padding: "0 12px",
        background: "transparent",
        border: "1px dashed var(--line)",
        borderRadius: "8px",
        fontSize: "12.5px",
        color: "var(--ink-3)",
        cursor: "pointer",
        transition: "all 0.1s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-3)";
      }}
    >
      {children}
    </button>
  );
}
