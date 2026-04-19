"use client";

import { PreviewData, TemplateId } from "@/types/resume";
import ClassicTemplate from "@/components/preview/ClassicTemplate";
import ModernTemplate from "@/components/preview/ModernTemplate";
import CompactTemplate from "@/components/preview/CompactTemplate";
import Icon from "@/components/ui/Icon";

interface ResumePreviewProps {
  data: PreviewData;
  template: TemplateId;
  onTemplateChange: (t: TemplateId) => void;
  zoom: number;
  onZoomChange: (z: number) => void;
}

const TEMPLATES: [TemplateId, string][] = [
  ["classic", "Classic"],
  ["modern", "Modern"],
  ["compact", "Compact"],
];

export default function ResumePreview({
  data,
  template,
  onTemplateChange,
  zoom,
  onZoomChange,
}: ResumePreviewProps) {
  const TemplateComponent =
    template === "classic"
      ? ClassicTemplate
      : template === "modern"
      ? ModernTemplate
      : CompactTemplate;

  const PAGE_H = 864;

  return (
    <div
      className="pane right"
      style={{
        background: "#ecece9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "28px 28px 80px",
        overflowY: "auto",
        minWidth: 0,
      }}
    >
      {/* Controls */}
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {/* Template pill switcher */}
        <div
          style={{
            display: "inline-flex",
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            padding: "3px",
            gap: "2px",
          }}
        >
          {TEMPLATES.map(([id, label]) => (
            <div
              key={id}
              onClick={() => onTemplateChange(id)}
              style={{
                padding: "5px 11px",
                fontSize: "12.5px",
                color: template === id ? "#fff" : "var(--ink-3)",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 500,
                background: template === id ? "var(--ink)" : "transparent",
                userSelect: "none",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Zoom control */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            padding: "3px",
          }}
        >
          <button
            onClick={() =>
              onZoomChange(Math.max(0.5, parseFloat((zoom - 0.1).toFixed(2))))
            }
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "5px",
              border: "none",
              background: "transparent",
              color: "var(--ink-3)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon name="zoomout" size={14} />
          </button>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11.5px",
              color: "var(--ink-3)",
              padding: "0 6px",
              minWidth: "40px",
              textAlign: "center",
            }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() =>
              onZoomChange(Math.min(1.2, parseFloat((zoom + 0.1).toFixed(2))))
            }
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "5px",
              border: "none",
              background: "transparent",
              color: "var(--ink-3)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon name="zoomin" size={14} />
          </button>
        </div>
      </div>

      {/* Page frame */}
      <div
        style={{
          position: "relative",
          width: "640px",
          transformOrigin: "top center",
          transform: `scale(${zoom})`,
          marginBottom: `${-(PAGE_H * (1 - zoom))}px`,
        }}
      >
        <div
          style={{
            width: "640px",
            minHeight: `${PAGE_H}px`,
            background: "#fff",
            boxShadow: "var(--shadow-2)",
            borderRadius: "2px",
            padding: template === "modern" ? 0 : "44px 46px",
            color: "#111214",
            fontSize: "11.5px",
            lineHeight: 1.55,
            overflow: template === "modern" ? "hidden" : undefined,
          }}
        >
          <TemplateComponent d={data} />
        </div>
      </div>
    </div>
  );
}
