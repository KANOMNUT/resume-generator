import React from "react";
import Icon from "@/components/ui/Icon";

interface EntryCardProps {
  idx: number;
  label: string;
  onRemove: () => void;
  onDuplicate?: () => void;
  children: React.ReactNode;
}

export default function EntryCard({
  idx,
  label,
  onRemove,
  onDuplicate,
  children,
}: EntryCardProps) {
  return (
    <div
      style={{
        border: "1px solid var(--line-2)",
        borderRadius: "var(--radius-sm)",
        padding: "12px 12px 14px",
        background: "#fafaf8",
        marginTop: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "6px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "var(--ink-3)",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              background: "var(--chip)",
              padding: "1px 6px",
              borderRadius: "4px",
              color: "var(--ink-3)",
            }}
          >
            {String(idx + 1).padStart(2, "0")}
          </span>
          <span>{label}</span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {onDuplicate && (
            <IconBtn onClick={onDuplicate} title="Duplicate">
              <Icon name="copy" size={14} />
            </IconBtn>
          )}
          <IconBtn onClick={onRemove} title="Remove" danger>
            <Icon name="trash" size={14} />
          </IconBtn>
        </div>
      </div>
      {children}
    </div>
  );
}

function IconBtn({
  onClick,
  title,
  danger,
  children,
}: {
  onClick: () => void;
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        width: "26px",
        height: "26px",
        borderRadius: "6px",
        display: "grid",
        placeItems: "center",
        background: "transparent",
        border: "none",
        color: "var(--ink-4)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = danger
          ? "#fdecea"
          : "#eeeeea";
        (e.currentTarget as HTMLButtonElement).style.color = danger
          ? "var(--danger)"
          : "var(--ink-2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-4)";
      }}
    >
      {children}
    </button>
  );
}
