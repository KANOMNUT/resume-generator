import { PreviewData, LEVEL_LABELS, dateStr, yearRange } from "@/types/resume";

const INK = "#111214";
const BODY = "#2a2c31";
const MUTED = "#6b6e76";

/** Accent header band, serif headings, single column. Mirrored by generateExecutiveLayout in lib/pdf-generator.ts. */
export default function ExecutiveTemplate({ d }: { d: PreviewData }) {
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
          background: "var(--accent)",
          color: "#fff",
          padding: "34px 46px 28px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "30px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {fullName}
            {nickname && <span style={{ fontWeight: 400 }}> ({nickname})</span>}
          </h1>
          {d.title && <div style={{ fontSize: "13px", marginTop: "4px", opacity: 0.85 }}>{d.title}</div>}
          {contact.length > 0 && (
            <div
              style={{
                marginTop: "14px",
                fontSize: "10.5px",
                display: "flex",
                flexWrap: "wrap",
                columnGap: "16px",
                opacity: 0.92,
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
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(255,255,255,0.85)",
              flexShrink: 0,
            }}
          />
        )}
      </header>

      <div style={{ padding: "6px 46px 40px" }}>
        {d.summary && (
          <Section title="Profile">
            <div style={{ color: BODY, whiteSpace: "pre-wrap" }}>{d.summary}</div>
          </Section>
        )}

        {d.experience.length > 0 && (
          <Section title="Experience">
            {d.experience.map((e, i) => (
              <Entry
                key={i}
                title={e.position || "Position"}
                sub={e.company || "Company"}
                date={dateStr(e.startMonth, e.startYear, e.isCurrent, e.endMonth, e.endYear)}
                body={e.description}
                projects={e.projects}
              />
            ))}
          </Section>
        )}

        {d.education.length > 0 && (
          <Section title="Education">
            {d.education.map((e, i) => (
              <Entry
                key={i}
                title={[e.degree, e.fieldOfStudy].filter(Boolean).join(", ") || "Degree"}
                sub={e.institution || "Institution"}
                date={yearRange(e.startYear, e.endYear, e.isCurrent)}
                body={e.description}
              />
            ))}
          </Section>
        )}

        {d.skills.length > 0 && (
          <Section title="Skills">
            <div style={{ color: BODY }}>{d.skills.join(", ")}</div>
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
              <Entry key={i} title={c.name} sub={c.issuer} date={c.year} />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--accent)",
            margin: 0,
          }}
        >
          {title}
        </h2>
        <div style={{ flex: 1, height: "1px", background: "var(--accent)", opacity: 0.35 }} />
      </div>
      {children}
    </section>
  );
}

function Entry({
  title,
  sub,
  date,
  body,
  projects,
}: {
  title: string;
  sub?: string;
  date?: string;
  body?: string;
  projects?: { name: string; detail?: string }[];
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "16px" }}>
        <span style={{ fontWeight: 600, fontSize: "12.5px" }}>{title}</span>
        {date && <span style={{ fontSize: "10.5px", color: MUTED, whiteSpace: "nowrap" }}>{date}</span>}
      </div>
      {sub && <div style={{ color: "var(--accent)", fontWeight: 500 }}>{sub}</div>}
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
