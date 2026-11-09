import { PreviewData, LEVEL_LABELS, dateStr, yearRange } from "@/types/resume";

const INK = "#111214";
const BODY = "#2a2c31";
const MUTED = "#6b6e76";
const LINE = "#dcdde0";

/** Vertical accent timeline for experience and education. Mirrored by generateTimelineLayout in lib/pdf-generator.ts. */
export default function TimelineTemplate({ d }: { d: PreviewData }) {
  const fullName = `${d.firstName || "Your"} ${d.lastName || "Name"}`.trim();
  const nickname = d.nickname?.trim();
  const contact = [
    d.email,
    d.phone,
    d.location,
    ...(d.links || []).filter((l) => l.url).map((l) => l.url.replace(/^https?:\/\//, "")),
  ].filter(Boolean);

  return (
    <div style={{ fontFamily: "var(--font-ui)", fontSize: "11.5px", lineHeight: 1.55, color: INK }}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          paddingBottom: "16px",
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0 }}>
            {fullName}
            {nickname && <span style={{ fontWeight: 400, color: MUTED }}> ({nickname})</span>}
          </h1>
          {d.title && (
            <div style={{ fontSize: "12.5px", color: "var(--accent)", fontWeight: 500, marginTop: "3px" }}>
              {d.title}
            </div>
          )}
          {contact.length > 0 && (
            <div
              style={{
                marginTop: "10px",
                fontSize: "10.5px",
                color: MUTED,
                display: "flex",
                flexWrap: "wrap",
                columnGap: "14px",
              }}
            >
              {contact.map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
          )}
        </div>
        {d.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={d.photo}
            alt=""
            style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        )}
      </header>

      {d.summary && (
        <Section title="Summary">
          <div style={{ color: BODY, whiteSpace: "pre-wrap" }}>{d.summary}</div>
        </Section>
      )}

      {d.experience.length > 0 && (
        <Section title="Experience">
          {d.experience.map((e, i) => (
            <Node
              key={i}
              date={dateStr(e.startMonth, e.startYear, e.isCurrent, e.endMonth, e.endYear)}
              title={e.position || "Position"}
              sub={e.company || "Company"}
              body={e.description}
              projects={e.projects}
            />
          ))}
        </Section>
      )}

      {d.education.length > 0 && (
        <Section title="Education">
          {d.education.map((e, i) => (
            <Node
              key={i}
              date={yearRange(e.startYear, e.endYear, e.isCurrent)}
              title={[e.degree, e.fieldOfStudy].filter(Boolean).join(", ") || "Degree"}
              sub={e.institution || "Institution"}
              body={e.description}
            />
          ))}
        </Section>
      )}

      {d.skills.length > 0 && (
        <Section title="Skills">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {d.skills.map((s, i) => (
              <span
                key={i}
                style={{
                  border: `1px solid ${LINE}`,
                  borderRadius: "999px",
                  padding: "1px 9px",
                  fontSize: "10.5px",
                  color: BODY,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {d.languages.length > 0 && (
        <Section title="Languages">
          <div style={{ display: "flex", flexWrap: "wrap", columnGap: "18px", color: BODY }}>
            {d.languages.map((l, i) => (
              <span key={i}>
                {l.language} <span style={{ color: MUTED }}>({LEVEL_LABELS[l.level]})</span>
              </span>
            ))}
          </div>
        </Section>
      )}

      {d.certificates.length > 0 && (
        <Section title="Certificates">
          {d.certificates.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginBottom: "4px" }}>
              <span>
                <b>{c.name}</b>
                {c.issuer && <span style={{ color: MUTED }}>, {c.issuer}</span>}
              </span>
              {c.year && <span style={{ fontSize: "10.5px", color: MUTED }}>{c.year}</span>}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: "20px" }}>
      <h2 style={{ fontSize: "12px", fontWeight: 700, margin: "0 0 10px", color: INK }}>{title}</h2>
      {children}
    </section>
  );
}

function Node({
  date,
  title,
  sub,
  body,
  projects,
}: {
  date: string;
  title: string;
  sub: string;
  body?: string;
  projects?: { name: string; detail?: string }[];
}) {
  return (
    <div
      style={{
        position: "relative",
        marginLeft: "4px",
        paddingLeft: "16px",
        paddingBottom: "14px",
        borderLeft: `1.5px solid ${LINE}`,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "-5.5px",
          top: "2px",
          width: "9px",
          height: "9px",
          borderRadius: "50%",
          background: "var(--accent)",
          boxShadow: "0 0 0 2px #fff",
        }}
      />
      {date && <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--accent)", lineHeight: 1.3 }}>{date}</div>}
      <div style={{ fontWeight: 700, fontSize: "12.5px" }}>{title}</div>
      <div style={{ color: MUTED }}>{sub}</div>
      {body && <div style={{ marginTop: "4px", color: BODY, whiteSpace: "pre-wrap" }}>{body}</div>}
      {projects?.map((p, i) => (
        <div key={i} style={{ marginTop: "3px", fontSize: "11px", color: BODY }}>
          <b>{p.name}</b>
          {p.detail && <span style={{ color: MUTED }}> &mdash; {p.detail}</span>}
        </div>
      ))}
    </div>
  );
}
