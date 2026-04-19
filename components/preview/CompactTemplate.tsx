import { PreviewData, LEVEL_LABELS, dateStr, yearRange } from "@/types/resume";

interface CompactTemplateProps {
  d: PreviewData;
}

export default function CompactTemplate({ d }: CompactTemplateProps) {
  const fullName = `${d.firstName || "Your"} ${d.lastName || "Name"}`.trim();
  const nickname =
    d.nickname && d.nickname.trim() ? `(${d.nickname.trim()})` : "";

  const contactItems = [d.email, d.phone, d.location].filter(
    Boolean
  ) as string[];

  const linkItems = (d.links || [])
    .filter((l) => l.url)
    .map((l) => l.url.replace(/^https?:\/\//, ""));

  return (
    <div
      style={{
        fontFamily: "var(--font-ui)",
        fontSize: "10.5px",
        color: "#111214",
      }}
    >
      <h1
        style={{
          fontSize: "20px",
          fontWeight: 700,
          letterSpacing: "-0.015em",
          margin: 0,
          color: "#111214",
        }}
      >
        {fullName}
        {nickname && (
          <span
            style={{
              fontWeight: 400,
              color: "#878a92",
              marginLeft: "6px",
              fontSize: "13px",
            }}
          >
            {nickname}
          </span>
        )}
      </h1>

      {d.title && (
        <div
          style={{
            fontSize: "11px",
            color: "var(--accent)",
            marginTop: "2px",
            fontWeight: 500,
          }}
        >
          {d.title}
        </div>
      )}

      {/* Contact row: email · phone · location */}
      {contactItems.length > 0 && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "10px",
            color: "#55585f",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          {contactItems.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      )}

      {/* Links row: website · LinkedIn · GitHub · … */}
      {linkItems.length > 0 && (
        <div
          style={{
            fontSize: "10px",
            color: "#55585f",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          {linkItems.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      )}

      {d.summary && (
        <CompactSection label="Summary" first>
          <div style={{ fontSize: "10.5px", color: "#2a2c31", whiteSpace: "pre-wrap" }}>{d.summary}</div>
        </CompactSection>
      )}

      {(d.experience || []).length > 0 && (
        <CompactSection label="Experience" first={!d.summary}>
          {d.experience.map((e, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr",
                gap: "14px",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontSize: "10px", color: "#878a92" }}>
                {dateStr(e.startMonth, e.startYear, e.isCurrent, e.endMonth, e.endYear)}
              </div>
              <div>
                <div
                  style={{ fontWeight: 600, fontSize: "11.5px", color: "#111214" }}
                >
                  {e.company || "Company"}
                </div>
                <div style={{ fontSize: "10.5px", color: "#55585f" }}>
                  {e.position || "Position"}
                </div>
                {e.description && (
                  <div
                    style={{ fontSize: "10.5px", color: "#2a2c31", marginTop: "3px", whiteSpace: "pre-wrap" }}
                  >
                    {e.description}
                  </div>
                )}
                {(e.projects || []).length > 0 && (
                  <div style={{ marginTop: "4px" }}>
                    {e.projects.map((p, pi) => (
                      <div
                        key={pi}
                        style={{ fontSize: "10px", color: "#55585f", marginTop: "2px" }}
                      >
                        <span style={{ fontWeight: 600, color: "#111214" }}>
                          {p.name}
                        </span>
                        {p.detail && <> &mdash; {p.detail}</>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CompactSection>
      )}

      {(d.education || []).length > 0 && (
        <CompactSection
          label="Education"
          first={!d.summary && !d.experience.length}
        >
          {d.education.map((e, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr",
                gap: "14px",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontSize: "10px", color: "#878a92" }}>
                {yearRange(e.startYear, e.endYear, e.isCurrent)}
              </div>
              <div>
                <div
                  style={{ fontWeight: 600, fontSize: "11.5px", color: "#111214" }}
                >
                  {e.institution || "Institution"}
                </div>
                <div style={{ fontSize: "10.5px", color: "#55585f" }}>
                  {e.degree}
                  {e.fieldOfStudy ? ` \u00b7 ${e.fieldOfStudy}` : ""}
                </div>
                {e.description && (
                  <div
                    style={{ fontSize: "10.5px", color: "#2a2c31", marginTop: "3px", whiteSpace: "pre-wrap" }}
                  >
                    {e.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CompactSection>
      )}

      {(d.skills || []).length > 0 && (
        <CompactSection label="Skills" first={false}>
          <div style={{ fontSize: "10.5px", color: "#2a2c31" }}>
            {d.skills.join(" \u00b7 ")}
          </div>
        </CompactSection>
      )}

      {(d.languages || []).length > 0 && (
        <CompactSection label="Languages" first={false}>
          <div style={{ fontSize: "10.5px", color: "#2a2c31" }}>
            {d.languages.map((l, i) => (
              <span key={i}>
                {l.language}{" "}
                <span style={{ color: "#878a92" }}>({LEVEL_LABELS[l.level]})</span>
                {i < d.languages.length - 1 ? " \u00b7 " : ""}
              </span>
            ))}
          </div>
        </CompactSection>
      )}

      {(d.certificates || []).length > 0 && (
        <CompactSection label="Certificates" first={false}>
          {d.certificates.map((c, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr",
                gap: "14px",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontSize: "10px", color: "#878a92" }}>{c.year}</div>
              <div>
                <div
                  style={{ fontWeight: 600, fontSize: "11.5px", color: "#111214" }}
                >
                  {c.name}
                </div>
                <div style={{ fontSize: "10.5px", color: "#55585f" }}>{c.issuer}</div>
              </div>
            </div>
          ))}
        </CompactSection>
      )}
    </div>
  );
}

function CompactSection({
  label,
  first,
  children,
}: {
  label: string;
  first: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderTop: first ? "none" : "1px solid #e6e6e3",
        paddingTop: first ? 0 : "10px",
        marginTop: first ? "12px" : "12px",
      }}
    >
      <div
        style={{
          fontSize: "9.5px",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontWeight: 700,
          color: "#111214",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
