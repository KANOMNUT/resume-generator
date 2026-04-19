import React from "react";

interface FieldProps {
  label?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}

export default function Field({
  label,
  required,
  optional,
  hint,
  error,
  full,
  children,
}: FieldProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        marginTop: "12px",
        gridColumn: full ? "1 / -1" : undefined,
      }}
    >
      {label && (
        <label
          style={{
            fontSize: "12px",
            color: "var(--ink-3)",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {label}
          {required && (
            <span style={{ color: "var(--danger)", fontWeight: 500 }}>*</span>
          )}
          {optional && (
            <span
              style={{
                color: "var(--ink-4)",
                fontWeight: 400,
                fontSize: "11.5px",
              }}
            >
              optional
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && (
        <div style={{ fontSize: "11.5px", color: "var(--ink-4)", marginTop: "2px" }}>
          {hint}
        </div>
      )}
      {error && (
        <div style={{ fontSize: "11.5px", color: "var(--danger)", marginTop: "2px" }}>
          {error}
        </div>
      )}
    </div>
  );
}
