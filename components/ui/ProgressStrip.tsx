import Icon from "@/components/ui/Icon";

export interface CompletionChecks {
  personal: boolean;
  links: boolean;
  summary: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  languages: boolean;
  certificates: boolean;
}

interface ProgressStripProps {
  checks: CompletionChecks;
  pct: number;
  onChipClick: (section: keyof CompletionChecks) => void;
}

const CHIPS: [keyof CompletionChecks, string][] = [
  ["personal", "Personal"],
  ["links", "Links"],
  ["summary", "Summary"],
  ["experience", "Experience"],
  ["education", "Education"],
  ["skills", "Skills"],
  ["languages", "Languages"],
  ["certificates", "Certificates"],
];

export default function ProgressStrip({
  checks,
  pct,
  onChipClick,
}: ProgressStripProps) {
  const doneSections = Object.values(checks).filter(Boolean).length;

  return (
    <div
      style={{
        margin: "22px 0 20px",
        padding: "14px 14px 12px",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        background: "var(--panel)",
        boxShadow: "var(--shadow-1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "12.5px",
          color: "var(--ink-3)",
          marginBottom: "10px",
        }}
      >
        <span>
          Completion &middot; <b style={{ color: "var(--ink)", fontWeight: 600 }}>{pct}%</b>
        </span>
        <span style={{ color: "var(--ink-4)" }}>{doneSections} of 8 sections</span>
      </div>

      <div
        style={{
          height: "4px",
          background: "var(--line-2)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            background: "linear-gradient(90deg, var(--accent) 0%, color-mix(in oklab, var(--accent) 65%, #000) 100%)",
            borderRadius: "4px",
            transition: "width 0.35s cubic-bezier(.2,.7,.2,1)",
            width: `${pct}%`,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginTop: "10px",
        }}
      >
        {CHIPS.map(([key, label]) => {
          const done = checks[key];
          return (
            <span
              key={key}
              onClick={() => onChipClick(key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11.5px",
                color: done ? "var(--ink-2)" : "var(--ink-3)",
                padding: "3px 8px 3px 6px",
                borderRadius: "999px",
                background: "var(--chip)",
                border: "1px solid transparent",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: done ? "var(--accent)" : "var(--line-2)",
                  color: done ? "#fff" : "transparent",
                  fontSize: "9px",
                  lineHeight: 1,
                }}
              >
                <Icon name="check" size={8} />
              </span>
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
