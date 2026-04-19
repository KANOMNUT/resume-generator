import {
  PreviewData,
  LEVEL_LABELS,
  LINK_TYPE_LABELS,
  dateStr,
  yearRange,
} from "@/types/resume";

interface ModernTemplateProps {
  d: PreviewData;
}

export default function ModernTemplate({ d }: ModernTemplateProps) {
  const fullName = `${d.firstName || "Your"} ${d.lastName || "Name"}`.trim();
  const nickname =
    d.nickname && d.nickname.trim() ? `(${d.nickname.trim()})` : "";
  const initials = `${(d.firstName || "?")[0]}${(d.lastName || "")[0] || ""}`.toUpperCase();

  return (
    <div
      style={{
        fontFamily: "var(--font-ui)",
        color: "#111214",
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: "24px",
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          background: "#111214",
          color: "#eceff4",
          padding: "40px 22px",
          minHeight: "864px",
        }}
      >
        <div
          style={{
            width: "76px",
            height: "76px",
            borderRadius: "50%",
            background: "#2b2d33",
            display: "grid",
            placeItems: "center",
            color: "#878a92",
            fontFamily: "var(--font-serif)",
            fontSize: "28px",
            fontWeight: 600,
            overflow: "hidden",
            marginBottom: "14px",
          }}
        >
          {d.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.photo}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initials
          )}
        </div>

        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "-0.015em",
            margin: 0,
          }}
        >
          {fullName}
        </h1>
        {nickname && (
          <p
            style={{
              margin: 0,
              marginTop: "3px",
              fontSize: "13px",
              color: "#878a92",
              fontStyle: "italic",
            }}
          >
            {nickname}
          </p>
        )}

        {d.title && (
          <div
            style={{
              fontSize: "11px",
              color: "#a9acb3",
              marginTop: "2px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {d.title}
          </div>
        )}

        <SideHeader label="Contact" />
        {d.email && <SideItem text={d.email} />}
        {d.phone && <SideItem text={d.phone} />}
        {d.location && <SideItem text={d.location} />}

        {(d.links || []).length > 0 && (
          <>
            <SideHeader label="Links" />
            {d.links
              .filter((l) => l.url)
              .map((l, i) => (
                <div
                  key={i}
                  style={{ fontSize: "11px", color: "#d6d9de", marginBottom: "4px" }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#878a92",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {l.type === "other"
                      ? l.otherLabel || "Link"
                      : LINK_TYPE_LABELS[l.type]}
                  </div>
                  {l.url.replace(/^https?:\/\//, "")}
                </div>
              ))}
          </>
        )}

        {(d.languages || []).length > 0 && (
          <>
            <SideHeader label="Languages" />
            {d.languages.map((l, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontSize: "11px",
                  color: "#d6d9de",
                  marginBottom: "4px",
                }}
              >
                <span>{l.language}</span>
                <span style={{ color: "#878a92", fontSize: "10px" }}>
                  {LEVEL_LABELS[l.level]}
                </span>
              </div>
            ))}
          </>
        )}

        {(d.skills || []).length > 0 && (
          <>
            <SideHeader label="Skills" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {d.skills.map((s, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "10px",
                    background: "#2b2d33",
                    color: "#d6d9de",
                    padding: "2px 7px",
                    borderRadius: "999px",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main content */}
      <div style={{ padding: "40px 36px 40px 0" }}>
        {d.summary && (
          <>
            <MainHeader label="About" first />
            <div style={{ fontSize: "11.5px", color: "#2a2c31", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {d.summary}
            </div>
          </>
        )}

        {(d.experience || []).length > 0 && (
          <>
            <MainHeader label="Experience" first={!d.summary} />
            {d.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: "14px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "14px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "12.5px" }}>
                      {e.company || "Company"}
                    </div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: "var(--accent)",
                        fontWeight: 500,
                      }}
                    >
                      {e.position || "Position"}
                    </div>
                  </div>
                  <div
                    style={{
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
                    style={{ fontSize: "11px", color: "#2a2c31", marginTop: "4px", whiteSpace: "pre-wrap" }}
                  >
                    {e.description}
                  </div>
                )}
                {(e.projects || []).length > 0 && (
                  <div style={{ marginTop: "6px" }}>
                    {e.projects.map((p, pi) => (
                      <div
                        key={pi}
                        style={{
                          fontSize: "10.5px",
                          marginTop: "2px",
                          color: "#55585f",
                        }}
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
            ))}
          </>
        )}

        {(d.education || []).length > 0 && (
          <>
            <MainHeader
              label="Education"
              first={!d.summary && !d.experience.length}
            />
            {d.education.map((e, i) => (
              <div key={i} style={{ marginBottom: "14px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "14px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "12.5px" }}>
                      {e.institution || "Institution"}
                    </div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: "var(--accent)",
                        fontWeight: 500,
                      }}
                    >
                      {e.degree}
                      {e.fieldOfStudy ? ` \u00b7 ${e.fieldOfStudy}` : ""}
                    </div>
                  </div>
                  <div
                    style={{
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
                    style={{ fontSize: "11px", color: "#2a2c31", marginTop: "4px", whiteSpace: "pre-wrap" }}
                  >
                    {e.description}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {(d.certificates || []).length > 0 && (
          <>
            <MainHeader label="Certificates" first={false} />
            {d.certificates.map((c, i) => (
              <div key={i} style={{ marginBottom: "6px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "14px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "12.5px" }}>{c.name}</div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: "var(--accent)",
                        fontWeight: 500,
                      }}
                    >
                      {c.issuer}
                    </div>
                  </div>
                  <div
                    style={{ fontSize: "10.5px", color: "#878a92", whiteSpace: "nowrap" }}
                  >
                    {c.year}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function SideHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: "9.5px",
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        color: "#878a92",
        marginTop: "22px",
        marginBottom: "6px",
      }}
    >
      {label}
    </div>
  );
}

function SideItem({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: "11px",
        color: "#d6d9de",
        marginBottom: "4px",
        wordBreak: "break-word",
      }}
    >
      {text}
    </div>
  );
}

function MainHeader({ label, first }: { label: string; first: boolean }) {
  return (
    <div
      style={{
        fontSize: "10.5px",
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        fontWeight: 700,
        color: "#111214",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        margin: first ? "0 0 10px" : "24px 0 10px",
      }}
    >
      {label}
      <span
        style={{ flex: 1, height: "1px", background: "#e6e6e3", display: "block" }}
      />
    </div>
  );
}
