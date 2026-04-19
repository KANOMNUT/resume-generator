import {
  PreviewData,
  LEVEL_LABELS,
  LINK_TYPE_LABELS,
  dateStr,
  yearRange,
} from "@/types/resume";

interface ClassicTemplateProps {
  d: PreviewData;
}

export default function ClassicTemplate({ d }: ClassicTemplateProps) {
  const fullName = `${d.firstName || "Your"} ${d.lastName || "Name"}`.trim();
  const nickname =
    d.nickname && d.nickname.trim() ? `(${d.nickname.trim()})` : "";

  return (
    <div
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: "11.5px",
        lineHeight: 1.55,
        color: "#111214",
      }}
    >
      {d.photo && (
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            overflow: "hidden",
            background: "#e8eaeb",
            float: "right",
            marginLeft: "14px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={d.photo}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      <h1
        style={{
          fontSize: "28px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          margin: 0,
          color: "#111214",
        }}
      >
        {fullName}
        {nickname && (
          <span style={{ fontWeight: 400, color: "#55585f", marginLeft: "8px" }}>
            {nickname}
          </span>
        )}
      </h1>

      {d.title && (
        <div
          style={{
            fontSize: "13px",
            color: "#55585f",
            fontWeight: 400,
            marginTop: "4px",
            fontStyle: "italic",
          }}
        >
          {d.title}
        </div>
      )}

      {/* Contact row: email · phone · location */}
      {[d.email, d.phone, d.location].filter(Boolean).length > 0 && (
        <div
          style={{
            marginTop: "10px",
            fontSize: "11px",
            color: "#55585f",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            fontFamily: "var(--font-ui)",
          }}
        >
          {[d.email, d.phone, d.location]
            .filter(Boolean)
            .map((item, i) => (
              <span key={i}>
                {i > 0 && (
                  <span
                    style={{
                      display: "inline-block",
                      width: "3px",
                      height: "3px",
                      background: "currentColor",
                      borderRadius: "50%",
                      verticalAlign: "middle",
                      margin: "0 10px",
                      opacity: 0.4,
                    }}
                  />
                )}
                {item}
              </span>
            ))}
        </div>
      )}

      {/* Links row: website · LinkedIn · GitHub · … */}
      {(d.links || []).filter((l) => l.url).length > 0 && (
        <div
          style={{
            fontSize: "11px",
            color: "#55585f",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            fontFamily: "var(--font-ui)",
          }}
        >
          {(d.links || [])
            .filter((l) => l.url)
            .map((l, i) => (
              <span key={i}>
                {i > 0 && (
                  <span
                    style={{
                      display: "inline-block",
                      width: "3px",
                      height: "3px",
                      background: "currentColor",
                      borderRadius: "50%",
                      verticalAlign: "middle",
                      margin: "0 10px",
                      opacity: 0.4,
                    }}
                  />
                )}
                {l.url.replace(/^https?:\/\//, "")}
              </span>
            ))}
        </div>
      )}

      {d.summary && (
        <div style={{ marginTop: "22px" }}>
          <SectionHeader label="Summary" />
          <div
            style={{
              marginTop: "5px",
              fontSize: "11.5px",
              color: "#2a2c31",
              fontFamily: "var(--font-ui)",
              fontStyle: "italic",
              whiteSpace: "pre-wrap",
            }}
          >
            {d.summary}
          </div>
        </div>
      )}

      {(d.experience || []).length > 0 && (
        <div style={{ marginTop: "22px" }}>
          <SectionHeader label="Experience" />
          {d.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: "14px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "16px",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#111214" }}>
                    {e.company || "Company"}
                  </span>
                  <Bullet />
                  <span style={{ fontStyle: "italic", color: "#55585f", fontSize: "12px" }}>
                    {e.position || "Position"}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "10.5px",
                    color: "#878a92",
                    whiteSpace: "nowrap",
                  }}
                >
                  {dateStr(e.startMonth, e.startYear, e.isCurrent, e.endMonth, e.endYear)}
                </div>
              </div>
              {e.description && (
                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "11.5px",
                    color: "#2a2c31",
                    fontFamily: "var(--font-ui)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {e.description}
                </div>
              )}
              {(e.projects || []).length > 0 && (
                <div
                  style={{
                    marginTop: "6px",
                    fontFamily: "var(--font-ui)",
                    fontSize: "11px",
                  }}
                >
                  {e.projects.map((p, pi) => (
                    <div key={pi} style={{ marginTop: "3px", color: "#2a2c31" }}>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                      {p.detail && (
                        <span style={{ color: "#55585f" }}> &mdash; {p.detail}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(d.education || []).length > 0 && (
        <div style={{ marginTop: "22px" }}>
          <SectionHeader label="Education" />
          {d.education.map((e, i) => (
            <div key={i} style={{ marginBottom: "14px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "16px",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#111214" }}>
                    {e.institution || "Institution"}
                  </span>
                  <Bullet />
                  <span style={{ fontStyle: "italic", color: "#55585f", fontSize: "12px" }}>
                    {e.degree}
                    {e.fieldOfStudy ? `, ${e.fieldOfStudy}` : ""}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "10.5px",
                    color: "#878a92",
                    whiteSpace: "nowrap",
                  }}
                >
                  {yearRange(e.startYear, e.endYear, e.isCurrent)}
                </div>
              </div>
              {e.description && (
                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "11.5px",
                    color: "#2a2c31",
                    fontFamily: "var(--font-ui)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {e.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(d.skills || []).length > 0 && (
        <div style={{ marginTop: "22px" }}>
          <SectionHeader label="Skills" />
          <div
            style={{
              marginTop: "5px",
              fontSize: "11.5px",
              color: "#2a2c31",
              fontFamily: "var(--font-ui)",
            }}
          >
            {d.skills.join(" \u00b7 ")}
          </div>
        </div>
      )}

      {(d.languages || []).length > 0 && (
        <div style={{ marginTop: "22px" }}>
          <SectionHeader label="Languages" />
          <div
            style={{
              marginTop: "5px",
              fontSize: "11.5px",
              color: "#2a2c31",
              fontFamily: "var(--font-ui)",
            }}
          >
            {d.languages.map((l, i) => (
              <span key={i}>
                {l.language}{" "}
                <span style={{ color: "#878a92" }}>({LEVEL_LABELS[l.level]})</span>
                {i < d.languages.length - 1 ? " \u00b7 " : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {(d.certificates || []).length > 0 && (
        <div style={{ marginTop: "22px" }}>
          <SectionHeader label="Certificates" />
          {d.certificates.map((c, i) => (
            <div key={i} style={{ marginBottom: "4px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "16px",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#111214" }}>
                    {c.name}
                  </span>
                  <Bullet />
                  <span style={{ fontStyle: "italic", color: "#55585f", fontSize: "12px" }}>
                    {c.issuer}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "10.5px",
                    color: "#878a92",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.year}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        fontFamily: "var(--font-ui)",
        fontWeight: 600,
        color: "#111214",
        borderBottom: "1px solid #111214",
        paddingBottom: "5px",
        marginBottom: "10px",
      }}
    >
      {label}
    </div>
  );
}

function Bullet() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "3px",
        height: "3px",
        background: "currentColor",
        borderRadius: "50%",
        verticalAlign: "middle",
        margin: "0 6px",
        opacity: 0.4,
      }}
    />
  );
}
