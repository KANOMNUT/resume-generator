"use client";

import { ACCENTS, TemplateId } from "@/types/resume";
import Icon from "@/components/ui/Icon";

interface TweaksPanelProps {
  template: TemplateId;
  onTemplateChange: (t: TemplateId) => void;
  accent: string;
  onAccentChange: (a: string) => void;
  onClose: () => void;
  onLoadSample: () => void;
  onClearAll: () => void;
}

const TEMPLATES: [TemplateId, string][] = [
  ["classic", "Classic"],
  ["modern", "Modern"],
  ["compact", "Compact"],
];

export default function TweaksPanel({
  template,
  onTemplateChange,
  accent,
  onAccentChange,
  onClose,
  onLoadSample,
  onClearAll,
}: TweaksPanelProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "22px",
        right: "22px",
        width: "280px",
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: "12px",
        boxShadow: "var(--shadow-2)",
        padding: "14px 14px 12px",
        zIndex: 50,
      }}
    >
      <h3
        style={{
          fontSize: "12px",
          margin: "0 0 10px",
          color: "var(--ink-2)",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Icon name="settings" size={13} /> Tweaks
        </span>
        <span
          onClick={onClose}
          style={{ cursor: "pointer", color: "var(--ink-4)" }}
        >
          <Icon name="x" size={14} />
        </span>
      </h3>

      {/* Template picker */}
      <div style={{ marginBottom: "10px" }}>
        <label
          style={{
            fontSize: "11px",
            color: "var(--ink-4)",
            display: "block",
            marginBottom: "5px",
          }}
        >
          Template
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "6px",
          }}
        >
          {TEMPLATES.map(([id, name]) => (
            <div
              key={id}
              onClick={() => onTemplateChange(id)}
              style={{
                cursor: "pointer",
                border: `1px solid ${template === id ? "var(--ink)" : "var(--line)"}`,
                borderRadius: "6px",
                padding: "6px",
                background: template === id ? "#fff" : "#fafaf8",
                fontSize: "10px",
                textAlign: "center",
                color: template === id ? "var(--ink)" : "var(--ink-3)",
                userSelect: "none",
              }}
            >
              <ThumbArt variant={id} />
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* Accent color */}
      <div style={{ marginBottom: "10px" }}>
        <label
          style={{
            fontSize: "11px",
            color: "var(--ink-4)",
            display: "block",
            marginBottom: "5px",
          }}
        >
          Accent color
        </label>
        <div style={{ display: "flex", gap: "6px" }}>
          {ACCENTS.map((a) => (
            <div
              key={a.value}
              onClick={() => onAccentChange(a.value)}
              title={a.name}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                cursor: "pointer",
                border: `2px solid ${accent === a.value ? "var(--ink)" : "transparent"}`,
                transform: accent === a.value ? "scale(1.08)" : "scale(1)",
                transition: "transform 0.1s",
                background: a.value,
              }}
            />
          ))}
        </div>
      </div>

      {/* Sample data */}
      <div>
        <label
          style={{
            fontSize: "11px",
            color: "var(--ink-4)",
            display: "block",
            marginBottom: "5px",
          }}
        >
          Sample data
        </label>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={onLoadSample}
            style={{
              flex: 1,
              height: "28px",
              fontSize: "12px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              border: "1px solid var(--line)",
              background: "var(--panel)",
              color: "var(--ink-2)",
              cursor: "pointer",
            }}
          >
            Load sample
          </button>
          <button
            onClick={onClearAll}
            style={{
              flex: 1,
              height: "28px",
              fontSize: "12px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              border: "1px solid var(--line)",
              background: "var(--panel)",
              color: "var(--ink-2)",
              cursor: "pointer",
            }}
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}

function ThumbArt({ variant }: { variant: TemplateId }) {
  return (
    <div
      style={{
        height: "48px",
        borderRadius: "3px",
        background: "#fff",
        border: "1px solid var(--line-2)",
        marginBottom: "4px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {variant === "classic" && (
        <>
          <div
            style={{
              position: "absolute",
              top: "6px",
              left: "6px",
              right: "6px",
              height: "3px",
              background: "#111214",
              borderRadius: "1px",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: "6px",
              right: "20px",
              height: "1px",
              background: "#ccc",
              boxShadow: "0 4px 0 #ccc, 0 8px 0 #ccc, 0 12px 0 #ccc, 0 18px 0 #ccc, 0 22px 0 #ccc",
            }}
          />
        </>
      )}
      {variant === "modern" && (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "18px",
              background: "#111214",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "6px",
              left: "24px",
              right: "6px",
              height: "1.5px",
              background: "#ccc",
              boxShadow: "0 4px 0 #ccc, 0 8px 0 #ccc, 0 12px 0 #ccc, 0 18px 0 #ccc, 0 22px 0 #ccc",
            }}
          />
        </>
      )}
      {variant === "compact" && (
        <div
          style={{
            position: "absolute",
            top: "6px",
            left: "6px",
            right: "6px",
            height: "1.5px",
            background: "#111214",
            boxShadow: "0 3px 0 #ccc, 0 7px 0 #ccc, 0 11px 0 #ccc, 0 17px 0 #111214, 0 21px 0 #ccc, 0 25px 0 #ccc",
          }}
        />
      )}
    </div>
  );
}
