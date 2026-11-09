"use client";

import { useEffect, useRef } from "react";
import { PreviewData, TemplateId, TEMPLATES } from "@/types/resume";
import ClassicTemplate from "@/components/preview/ClassicTemplate";
import ModernTemplate from "@/components/preview/ModernTemplate";
import CompactTemplate from "@/components/preview/CompactTemplate";
import ExecutiveTemplate from "@/components/preview/ExecutiveTemplate";
import TimelineTemplate from "@/components/preview/TimelineTemplate";
import Icon from "@/components/ui/Icon";

interface ResumePreviewProps {
  data: PreviewData;
  template: TemplateId;
  onTemplateChange: (t: TemplateId) => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  /** Rendered between the controls and the page (the Tweaks panel). */
  children?: React.ReactNode;
}

const COMPONENTS = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  compact: CompactTemplate,
  executive: ExecutiveTemplate,
  timeline: TimelineTemplate,
};

// Templates whose design runs edge to edge (no page padding).
const FULL_BLEED: TemplateId[] = ["modern", "executive"];

export default function ResumePreview({
  data,
  template,
  onTemplateChange,
  zoom,
  onZoomChange,
  children,
}: ResumePreviewProps) {
  const TemplateComponent = COMPONENTS[template];
  const bleed = FULL_BLEED.includes(template);
  const paneRef = useRef<HTMLDivElement>(null);

  // Shrink the page to fit the available width on first load.
  // A hidden pane (mobile edit view) measures 0, so fall back to the window.
  useEffect(() => {
    const w = paneRef.current?.clientWidth;
    const fit = Math.floor(((w ? w - 56 : window.innerWidth - 32) / 640) * 100) / 100;
    if (fit < zoom) onZoomChange(Math.max(0.4, fit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const PAGE_H = 864;

  return (
    <div ref={paneRef} className="pane right preview-pane">
      {/* Controls */}
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
          margin: "0 auto 16px",
        }}
      >
        {/* Template pill switcher (Tweaks panel covers this on mobile) */}
        <div
          className="template-pills"
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
            <button
              type="button"
              key={id}
              onClick={() => onTemplateChange(id)}
              aria-pressed={template === id}
              style={{
                border: "none",
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
            </button>
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
            type="button"
            aria-label="Zoom out"
            onClick={() =>
              onZoomChange(Math.max(0.4, parseFloat((zoom - 0.1).toFixed(2))))
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
            type="button"
            aria-label="Zoom in"
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

      {children}

      {/* Page frame: outer box takes the scaled width so small screens never scroll sideways */}
      <div
        style={{
          width: `${640 * zoom}px`,
          margin: `0 auto ${-(PAGE_H * (1 - zoom))}px`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "640px",
            transformOrigin: "top left",
            transform: `scale(${zoom})`,
          }}
        >
        <div
          style={{
            width: "640px",
            minHeight: `${PAGE_H}px`,
            background: "#fff",
            boxShadow: "var(--shadow-2)",
            borderRadius: "2px",
            padding: bleed ? 0 : "44px 46px",
            color: "#111214",
            fontSize: "11.5px",
            lineHeight: 1.55,
            overflow: bleed ? "hidden" : undefined,
          }}
        >
          <TemplateComponent d={data} />
        </div>
        </div>
      </div>
    </div>
  );
}
