"use client";

import Icon from "@/components/ui/Icon";

interface TopbarProps {
  firstName: string;
  lastName: string;
  onStartEmpty: () => void;
  onGeneratePDF: () => void;
  isGenerating: boolean;
}

export default function Topbar({
  firstName,
  lastName,
  onStartEmpty,
  onGeneratePDF,
  isGenerating,
}: TopbarProps) {
  const name = [firstName, lastName].filter(Boolean).join(" ") || "New Resume";

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "10px 20px",
        background: "rgba(246,246,244,0.85)",
        backdropFilter: "saturate(1.2) blur(10px)",
        WebkitBackdropFilter: "saturate(1.2) blur(10px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: 600,
          fontSize: "14px",
          letterSpacing: "-0.01em",
          color: "var(--ink)",
        }}
      >
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "6px",
            background: "var(--ink)",
            position: "relative",
            display: "grid",
            placeItems: "center",
            color: "var(--panel)",
            fontFamily: "var(--font-serif)",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          R
          <span
            style={{
              content: '""',
              position: "absolute",
              right: "-3px",
              bottom: "-3px",
              width: "8px",
              height: "8px",
              borderRadius: "2px",
              background: "var(--accent)",
              display: "block",
            }}
          />
        </div>
        Resume Studio
      </div>

      {/* Breadcrumbs */}
      <div style={{ color: "var(--ink-4)", fontSize: "13px" }}>
        <b style={{ color: "var(--ink-2)", fontWeight: 500 }}>{name}</b>
        {" / Untitled resume"}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Save status */}
      <div
        style={{
          color: "var(--ink-4)",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--ok)",
            display: "inline-block",
          }}
        />
        Saved &middot; just now
      </div>

      {/* Start empty */}
      <button
        onClick={onStartEmpty}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          height: "34px",
          padding: "0 12px",
          borderRadius: "8px",
          border: "1px solid transparent",
          background: "transparent",
          color: "var(--ink-2)",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Start empty
      </button>

      {/* Generate PDF */}
      <button
        onClick={onGeneratePDF}
        disabled={isGenerating}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          height: "34px",
          padding: "0 12px",
          borderRadius: "8px",
          border: "1px solid var(--accent)",
          background: "var(--accent)",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 500,
          cursor: isGenerating ? "not-allowed" : "pointer",
          opacity: isGenerating ? 0.7 : 1,
          boxShadow: "0 1px 0 rgba(17,18,20,0.05), inset 0 -1px 0 rgba(0,0,0,0.15)",
        }}
      >
        <Icon name="download" size={14} />
        {isGenerating ? "Generating…" : "Generate PDF"}
      </button>
    </div>
  );
}
