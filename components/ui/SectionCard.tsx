"use client";

import React from "react";
import Icon from "@/components/ui/Icon";

interface SectionCardProps {
  n: number;
  title: string;
  subtitle: string;
  done: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function SectionCard({
  n,
  title,
  subtitle,
  done,
  open,
  onToggle,
  children,
}: SectionCardProps) {
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        marginBottom: "10px",
        boxShadow: "var(--shadow-1)",
        overflow: "hidden",
      }}
    >
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 16px",
          cursor: "pointer",
          userSelect: "none",
          background: "transparent",
        }}
      >
        {/* Number / check badge */}
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "6px",
            background: done ? "var(--ink)" : "var(--chip)",
            color: done ? "#fff" : "var(--ink-3)",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            flexShrink: 0,
          }}
        >
          {done ? <Icon name="check" size={12} /> : n}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "-0.005em",
            color: "var(--ink)",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginLeft: "auto",
            fontSize: "12px",
            color: "var(--ink-4)",
          }}
        >
          {subtitle}
        </div>

        {/* Caret */}
        <span
          style={{
            color: "var(--ink-4)",
            transition: "transform 0.2s ease",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            display: "flex",
            marginLeft: "8px",
          }}
        >
          <Icon name="chev" size={14} />
        </span>
      </div>

      {open && (
        <div
          style={{
            padding: "4px 16px 18px",
            borderTop: "1px solid var(--line-2)",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
