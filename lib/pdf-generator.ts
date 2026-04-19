import PDFDocument from "pdfkit";
import type { ResumeData } from "./schema";
import type { TemplateId } from "@/types/resume";

// ---------------------------------------------------------------------------
// Shared layout constants
// ---------------------------------------------------------------------------
const MARGINS = {
  top: 50,
  bottom: 50,
  left: 50,
  right: 50,
} as const;

const PAGE_WIDTH = 595.28; // A4 width in points
const PAGE_HEIGHT = 841.89; // A4 height in points
const CONTENT_WIDTH = PAGE_WIDTH - MARGINS.left - MARGINS.right;

// Photo dimensions (Classic/Compact: small circle-style, float right)
const PHOTO_SIZE = 48; // 64px → ~48pt
const PHOTO_GAP = 10.5; // 14px marginLeft in preview → 10.5pt

// ---------------------------------------------------------------------------
// Level labels shared across all templates
// ---------------------------------------------------------------------------
const LEVEL_LABELS: Record<string, string> = {
  native: "Native",
  fluent: "Fluent",
  advanced: "Advanced",
  intermediate: "Intermediate",
  basic: "Basic",
};

/**
 * Generates a PDF resume from validated resume data.
 * @param data - Validated and sanitized resume data
 * @param template - Template layout to use; defaults to "classic"
 * @param accentColor - Accent hex color (e.g. "#3a3dd6"); defaults to "#3a3dd6"
 * @returns Buffer containing the PDF document
 * @throws Error if PDF generation fails
 */
export async function generateResumePDF(
  data: ResumeData,
  template: TemplateId = "classic",
  accentColor: string = "#3a3dd6"
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: MARGINS,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      if (template === "modern") {
        generateModernLayout(doc, data, accentColor);
      } else if (template === "compact") {
        generateCompactLayout(doc, data, accentColor);
      } else {
        generateClassicLayout(doc, data);
      }

      doc.end();
    } catch (error) {
      reject(
        error instanceof Error
          ? error
          : new Error("Unknown error during PDF generation")
      );
    }
  });
}

// ===========================================================================
// CLASSIC LAYOUT
// Mirrors ClassicTemplate.tsx exactly.
// ===========================================================================

// Design colors — matched pixel-for-pixel to ClassicTemplate.tsx
const CC = {
  NAME: "#111214",
  NICKNAME: "#55585f",
  TITLE: "#55585f",
  CONTACT: "#55585f",
  SECTION_HEADER: "#111214",
  SECTION_BORDER: "#111214",
  COMPANY: "#111214",
  POSITION: "#55585f",
  DATE: "#878a92",
  BODY: "#2a2c31",
} as const;

// Font sizes in pt, derived from design px values (1pt ≈ 1.333px)
//   name 28px → 21pt, title 13px → 9.75pt, contact 11px → 8.25pt,
//   section header 11px → 8.25pt, company 13px → 9.75pt,
//   position 12px → 9pt, date 10.5px → 7.9pt, body 11.5px → 8.6pt
const CF = {
  NAME: 21,
  TITLE: 9.75,
  CONTACT: 8.25,
  SECTION_HEADER: 8.25,
  COMPANY: 9.75,
  POSITION: 9,
  DATE: 7.9,
  BODY: 8.6,
} as const;

function generateClassicLayout(doc: PDFKit.PDFDocument, data: ResumeData): void {
  classicHeader(doc, data);
  classicSummary(doc, data);
  classicExperience(doc, data);
  classicEducation(doc, data);
  classicSkills(doc, data);
  classicLanguages(doc, data);
  classicCertificates(doc, data);
}

/**
 * Draws a small filled 1.2pt-radius circle — matches the 3px dot bullet in
 * ClassicTemplate.tsx with opacity 0.4.
 * Returns the total horizontal space consumed (dot width + margins).
 */
function classicBulletDot(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  fontSize: number,
  color: string = CC.CONTACT
): number {
  const radius = 1.2;
  // vertically center on cap-height (≈ 0.7× font-size from baseline top)
  const cy = y + fontSize * 0.45;
  doc.save();
  doc.circle(x + radius, cy, radius).fillOpacity(0.4).fill(color);
  doc.restore();
  // 6px margin each side ≈ 4.5pt each, total gap = dot_diameter + 9pt
  return radius * 2 + 9;
}

/**
 * Section header: ALL CAPS, letter-spaced, bold, with a full-width 0.75pt
 * bottom border in #111214. Matches <SectionHeader> in ClassicTemplate.tsx.
 * Preview: font 11px → ~8.25pt, letterSpacing 0.14em, borderBottom 1px solid #111214,
 *          paddingBottom 5px, marginBottom 10px.
 */
function classicSectionHeader(doc: PDFKit.PDFDocument, label: string): void {
  const y = doc.y;
  doc
    .font("Helvetica-Bold")
    .fontSize(CF.SECTION_HEADER)
    .fillColor(CC.SECTION_HEADER)
    .text(label.toUpperCase(), MARGINS.left, y, {
      width: CONTENT_WIDTH,
      characterSpacing: 1.15, // 0.14em at 8.25pt ≈ 1.155pt
      align: "left",
    });
  // paddingBottom 5px ≈ 3.75pt; draw line a few pt below text
  const lineY = doc.y + 3;
  doc
    .save()
    .strokeColor(CC.SECTION_BORDER)
    .lineWidth(0.75)
    .moveTo(MARGINS.left, lineY)
    .lineTo(MARGINS.left + CONTENT_WIDTH, lineY)
    .stroke()
    .restore();
  // marginBottom 10px ≈ 7.5pt
  doc.y = lineY + 7.5;
}

/**
 * Header: photo (float-right), name (bold), nickname (inline, muted),
 * title (italic, muted), contact row (dot-separated).
 */
function classicHeader(doc: PDFKit.PDFDocument, data: ResumeData): void {
  // Photo — top-right, clipped to a circle matching the UI preview
  if (data.photo) {
    try {
      const base64Data = data.photo.split(",")[1];
      const imageBuffer = Buffer.from(base64Data, "base64");

      const photoX = PAGE_WIDTH - MARGINS.right - PHOTO_SIZE;

      const r = PHOTO_SIZE / 2;
      const cx = photoX + r;
      const cy = MARGINS.top + r;
      const diameter = r * 2;

      doc.save();
      // Clip circular avatar
      doc.circle(cx, cy, r).clip();

      // Draw image using COVER (matches object-fit: cover)
      doc.image(
        imageBuffer,
        cx - r,
        cy - r,
        {
          cover: [diameter, diameter],
          align: "center",
          valign: "center",
        }
      );

      doc.restore();

    } catch {
      // Skip or fallback if needed
    }
  }

  const textWidth = data.photo
    ? CONTENT_WIDTH - PHOTO_SIZE - PHOTO_GAP
    : CONTENT_WIDTH;

  const firstName = data.firstName || "";
  const lastName = data.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  // Name — 21pt bold #111214
  doc
    .font("Helvetica-Bold")
    .fontSize(CF.NAME)
    .fillColor(CC.NAME)
    .text(fullName, MARGINS.left, MARGINS.top, {
      width: textWidth,
      continued: !!(data.nickname && data.nickname.trim()),
      lineBreak: false,
    });

  // Nickname — same line, regular weight, color #55585f, marginLeft ~6pt
  if (data.nickname && data.nickname.trim()) {
    doc
      .font("Helvetica")
      .fontSize(CF.NAME)
      .fillColor(CC.NICKNAME)
      .text(` (${data.nickname.trim()})`, {
        continued: false,
        lineBreak: false,
      });
  }

  // Advance past name line
  doc.y = MARGINS.top + CF.NAME + 3;

  // Title — italic, 9.75pt, color #55585f, marginTop ~3pt
  if (data.title && data.title.trim()) {
    doc.y += 3;
    doc
      .font("Helvetica-Oblique")
      .fontSize(CF.TITLE)
      .fillColor(CC.TITLE)
      .text(data.title.trim(), MARGINS.left, doc.y, {
        width: textWidth,
        align: "left",
      });
  }

  // Contact row — marginTop 10px ≈ 7.5pt
  doc.y += 7.5;

  // Build contact items (email, phone, location) and links separately.
  // URLs get their own link; email gets mailto:; phone and location are plain text.
  const contactItems: { text: string; href?: string }[] = [
    ...(data.email ? [{ text: data.email, href: `mailto:${data.email}` }] : []),
    ...(data.phone ? [{ text: data.phone }] : []),
    ...(data.location ? [{ text: data.location }] : []),
  ];

  const linkItems: { text: string; href: string }[] = (data.links || [])
    .filter((l) => l.url && l.url.trim())
    .map((l) => ({
      text: l.url.replace(/^https?:\/\//, ""),
      href: l.url,
    }));

  // Helper to render a dot-separated row of items inline
  const renderContactRow = (
    items: { text: string; href?: string }[],
    rowY: number
  ) => {
    let cx = MARGINS.left;
    items.forEach((item, i) => {
      if (i > 0) {
        // 3pt dot, opacity 0.4, margin ~10px (7.5pt) total
        cx += classicBulletDot(doc, cx, rowY, CF.CONTACT, CC.CONTACT);
      }
      // Pre-compute width so PDFKit can build the link annotation rect correctly.
      // When link is set and lineBreak:false is used without a width, PDFKit
      // reads options.textWidth (which is undefined in the no-wrapper path) to
      // size the annotation, producing renderedWidth = NaN and throwing
      // "unsupported number: NaN". Passing the measured width here gives PDFKit
      // a valid renderedWidth via the LineWrapper path.
      doc.font("Helvetica").fontSize(CF.CONTACT);
      const textW = doc.widthOfString(item.text);
      const textOptions: PDFKit.Mixins.TextOptions = {
        lineBreak: false,
        // No underline — preview does not underline contact items
        ...(item.href
          ? { link: item.href, underline: false, width: textW }
          : {}),
      };
      doc.fillColor(CC.CONTACT).text(item.text, cx, rowY, textOptions);
      cx += textW;
    });
  };

  if (contactItems.length > 0) {
    const rowY = doc.y;
    renderContactRow(contactItems, rowY);
    doc.y = rowY + CF.CONTACT + 4;
  }

  // Links row — rendered on a new line below the contact row
  if (linkItems.length > 0) {
    const linksRowY = doc.y;
    renderContactRow(linkItems, linksRowY);
    doc.y = linksRowY + CF.CONTACT + 4;
  }

  // Ensure we clear the photo area (no extra clearance gap — preview float has none)
  if (data.photo) {
    const photoBottom = MARGINS.top + PHOTO_SIZE;
    if (doc.y < photoBottom) doc.y = photoBottom;
  }

  // marginTop before first section ≈ 22px → 16.5pt
  doc.y += 16.5;
}

/** Summary: italic body text, #2a2c31. marginTop 22px → 16.5pt between sections. */
function classicSummary(doc: PDFKit.PDFDocument, data: ResumeData): void {
  if (!data.summary || !data.summary.trim()) return;
  checkPageBreak(doc);
  classicSectionHeader(doc, "Summary");
  doc
    .font("Helvetica-Oblique")
    .fontSize(CF.BODY)
    .fillColor(CC.BODY)
    .text(data.summary.trim(), MARGINS.left, doc.y, {
      width: CONTENT_WIDTH,
      align: "left",
      lineGap: 1.5, // ~1.55 line-height
    });
  doc.y += 16.5;
}

/** Experience: [Company · Position] right-aligned date, then description, then projects. */
function classicExperience(doc: PDFKit.PDFDocument, data: ResumeData): void {
  if (!data.experience || data.experience.length === 0) return;
  checkPageBreak(doc);
  classicSectionHeader(doc, "Experience");

  data.experience.forEach((exp, index) => {
    checkPageBreak(doc);

    // Date string: "MMM YYYY — MMM YYYY" or "MMM YYYY — Present"
    const startLabel = [exp.startMonth, exp.startYear].filter(Boolean).join(" ");
    const endLabel = exp.isCurrent
      ? "Present"
      : [exp.endMonth, exp.endYear].filter(Boolean).join(" ");
    const durationText = endLabel ? `${startLabel} \u2014 ${endLabel}` : startLabel;

    const entryY = doc.y;

    // Date — right-aligned, 7.9pt, #878a92
    doc
      .font("Helvetica")
      .fontSize(CF.DATE)
      .fillColor(CC.DATE)
      .text(durationText, MARGINS.left, entryY, {
        width: CONTENT_WIDTH,
        align: "right",
        lineBreak: false,
      });

    const dateWidth = doc.widthOfString(durationText) + 16;
    let lx = MARGINS.left;

    // Company — bold, 9.75pt, #111214
    const companyText = exp.company || "Company";
    doc
      .font("Helvetica-Bold")
      .fontSize(CF.COMPANY)
      .fillColor(CC.COMPANY)
      .text(companyText, lx, entryY, { lineBreak: false });
    lx += doc.widthOfString(companyText);

    // Inline dot bullet
    lx += classicBulletDot(doc, lx, entryY, CF.COMPANY, CC.COMPANY);

    // Position — italic, 9pt, #55585f
    const posText = exp.position || "Position";
    const posAvail = CONTENT_WIDTH - (lx - MARGINS.left) - dateWidth;
    if (posAvail > 10) {
      doc
        .font("Helvetica-Oblique")
        .fontSize(CF.POSITION)
        .fillColor(CC.POSITION)
        .text(posText, lx, entryY, { width: posAvail, lineBreak: false });
    }

    // Advance past the header row
    doc.y = entryY + CF.COMPANY + 4;

    // Description — 8.6pt, #2a2c31, preserve newlines, marginTop ~5px → 3.75pt
    if (exp.description && exp.description.trim()) {
      doc.y += 3.75;
      const lines = exp.description.split("\n");
      lines.forEach((line) => {
        doc
          .font("Helvetica")
          .fontSize(CF.BODY)
          .fillColor(CC.BODY)
          .text(line || " ", MARGINS.left, doc.y, {
            width: CONTENT_WIDTH,
            align: "left",
            lineGap: 1.5,
          });
      });
    }

    // Projects — marginTop 6px ≈ 4.5pt
    if (exp.projects && exp.projects.length > 0) {
      doc.y += 4.5;
      exp.projects.forEach((project) => {
        doc.y += 2.25; // 3px gap
        const projY = doc.y;
        let px = MARGINS.left;

        // Project name — bold, 8.6pt, #2a2c31
        doc
          .font("Helvetica-Bold")
          .fontSize(CF.BODY)
          .fillColor(CC.BODY)
          .text(project.name, px, projY, { lineBreak: false });
        px += doc.widthOfString(project.name);

        // Detail — " — detail", regular, #55585f
        if (project.detail && project.detail.trim()) {
          doc
            .font("Helvetica")
            .fontSize(CF.BODY)
            .fillColor(CC.POSITION)
            .text(` \u2014 ${project.detail}`, px, projY, {
              width: CONTENT_WIDTH - (px - MARGINS.left),
              lineBreak: false,
            });
        }

        doc.y = projY + CF.BODY + 3;
      });
    }

    // marginBottom: 14px ≈ 10.5pt between entries
    if (index < data.experience.length - 1) {
      doc.y += 10.5;
    }
  });

  doc.y += 16.5;
}

/** Education: [Institution · Degree, FieldOfStudy] right-aligned yearRange. */
function classicEducation(doc: PDFKit.PDFDocument, data: ResumeData): void {
  if (!data.education || data.education.length === 0) return;
  checkPageBreak(doc);
  classicSectionHeader(doc, "Education");

  data.education.forEach((edu, index) => {
    checkPageBreak(doc);

    // yearRange: "YYYY – YYYY" or "YYYY – Present"
    const endLabel = edu.isCurrent ? "Present" : edu.endYear || "";
    const durationText = endLabel
      ? `${edu.startYear} \u2013 ${endLabel}`
      : edu.startYear || "";

    const entryY = doc.y;

    // Date right-aligned
    doc
      .font("Helvetica")
      .fontSize(CF.DATE)
      .fillColor(CC.DATE)
      .text(durationText, MARGINS.left, entryY, {
        width: CONTENT_WIDTH,
        align: "right",
        lineBreak: false,
      });

    const dateWidth = doc.widthOfString(durationText) + 16;
    let lx = MARGINS.left;

    // Institution — bold, 9.75pt, #111214
    const instText = edu.institution || "Institution";
    doc
      .font("Helvetica-Bold")
      .fontSize(CF.COMPANY)
      .fillColor(CC.COMPANY)
      .text(instText, lx, entryY, { lineBreak: false });
    lx += doc.widthOfString(instText);

    // Inline dot bullet
    lx += classicBulletDot(doc, lx, entryY, CF.COMPANY, CC.COMPANY);

    // Degree, fieldOfStudy — italic, 9pt, #55585f
    // Preview: "{degree}, {fieldOfStudy}" (comma separator)
    const degreeText =
      edu.fieldOfStudy && edu.fieldOfStudy.trim()
        ? `${edu.degree}, ${edu.fieldOfStudy}`
        : edu.degree;
    const posAvail = CONTENT_WIDTH - (lx - MARGINS.left) - dateWidth;
    if (posAvail > 10) {
      doc
        .font("Helvetica-Oblique")
        .fontSize(CF.POSITION)
        .fillColor(CC.POSITION)
        .text(degreeText, lx, entryY, { width: posAvail, lineBreak: false });
    }

    doc.y = entryY + CF.COMPANY + 4;

    // Optional description — marginTop ~5px → 3.75pt
    if (edu.description && edu.description.trim()) {
      doc.y += 3.75;
      doc
        .font("Helvetica")
        .fontSize(CF.BODY)
        .fillColor(CC.BODY)
        .text(edu.description.trim(), MARGINS.left, doc.y, {
          width: CONTENT_WIDTH,
          align: "left",
          lineGap: 1.5,
        });
    }

    if (index < data.education.length - 1) {
      doc.y += 10.5;
    }
  });

  doc.y += 16.5;
}

/** Skills: joined by U+00B7 "·" with spaces, single line/wrap, color #2a2c31. */
function classicSkills(doc: PDFKit.PDFDocument, data: ResumeData): void {
  if (!data.skills || data.skills.length === 0) return;
  checkPageBreak(doc);
  classicSectionHeader(doc, "Skills");
  const skillsText = data.skills.map((s) => s.value).join(" \u00b7 ");
  doc
    .font("Helvetica")
    .fontSize(CF.BODY)
    .fillColor(CC.BODY)
    .text(skillsText, MARGINS.left, doc.y, {
      width: CONTENT_WIDTH,
      align: "left",
    });
  doc.y += 16.5;
}

/**
 * Languages: "Language (Level) · Language (Level)" with level in #878a92.
 * Rendered token-by-token for mixed colors, matching ClassicTemplate.tsx.
 */
function classicLanguages(doc: PDFKit.PDFDocument, data: ResumeData): void {
  if (!data.languages || data.languages.length === 0) return;
  checkPageBreak(doc);
  classicSectionHeader(doc, "Languages");

  const rowY = doc.y;
  let cx = MARGINS.left;

  data.languages.forEach((lang, i) => {
    if (i > 0) {
      // " · " separator in body color
      doc
        .font("Helvetica")
        .fontSize(CF.BODY)
        .fillColor(CC.BODY)
        .text(" \u00b7 ", cx, rowY, { lineBreak: false });
      cx += doc.widthOfString(" \u00b7 ");
    }

    // Language name in body color
    doc
      .font("Helvetica")
      .fontSize(CF.BODY)
      .fillColor(CC.BODY)
      .text(lang.language, cx, rowY, { lineBreak: false });
    cx += doc.widthOfString(lang.language);

    // "(Level)" in date/muted color #878a92
    const levelStr = ` (${LEVEL_LABELS[lang.level] ?? lang.level})`;
    doc
      .font("Helvetica")
      .fontSize(CF.BODY)
      .fillColor(CC.DATE)
      .text(levelStr, cx, rowY, { lineBreak: false });
    cx += doc.widthOfString(levelStr);
  });

  doc.y = rowY + CF.BODY + 4;
  doc.y += 16.5;
}

/** Certificates: [Name · Issuer] with year right-aligned. marginBottom 4px per entry. */
function classicCertificates(doc: PDFKit.PDFDocument, data: ResumeData): void {
  if (!data.certificates || data.certificates.length === 0) return;
  checkPageBreak(doc);
  classicSectionHeader(doc, "Certificates");

  data.certificates.forEach((cert) => {
    checkPageBreak(doc);
    const certY = doc.y;

    // Year right-aligned, 7.9pt, #878a92
    if (cert.year) {
      doc
        .font("Helvetica")
        .fontSize(CF.DATE)
        .fillColor(CC.DATE)
        .text(cert.year, MARGINS.left, certY, {
          width: CONTENT_WIDTH,
          align: "right",
          lineBreak: false,
        });
    }

    const yearWidth = cert.year ? doc.widthOfString(cert.year) + 16 : 0;
    let lx = MARGINS.left;

    // Cert name — bold, 9.75pt, #111214
    doc
      .font("Helvetica-Bold")
      .fontSize(CF.COMPANY)
      .fillColor(CC.COMPANY)
      .text(cert.name, lx, certY, { lineBreak: false });
    lx += doc.widthOfString(cert.name);

    // Inline dot bullet
    lx += classicBulletDot(doc, lx, certY, CF.COMPANY, CC.COMPANY);

    // Issuer — italic, 9pt, #55585f
    const issuerAvail = CONTENT_WIDTH - (lx - MARGINS.left) - yearWidth;
    if (issuerAvail > 10) {
      doc
        .font("Helvetica-Oblique")
        .fontSize(CF.POSITION)
        .fillColor(CC.POSITION)
        .text(cert.issuer, lx, certY, { width: issuerAvail, lineBreak: false });
    }

    // marginBottom: 4px ≈ 3pt
    doc.y = certY + CF.COMPANY + 3;
  });
}

// ===========================================================================
// MODERN LAYOUT
// Mirrors ModernTemplate.tsx exactly:
//   - Dark sidebar (#111214) 200px → 150pt wide; light main column
//   - Sidebar: avatar/photo, name, nickname, title, Contact header, items,
//              Links header, Language header, Skills header (pill chips)
//   - Main: sections with line-rule header (flex row, line fills remaining)
//   - Accent color used for position/degree/cert-issuer in main column
// ===========================================================================

const SIDEBAR_WIDTH = 150; // 200px → 150pt
const SIDEBAR_BG = "#111214";
const SIDEBAR_TEXT = "#eceff4";
const SIDEBAR_MUTED = "#878a92";
const SIDEBAR_ITEM = "#d6d9de";
const SIDEBAR_PAD = 16.5; // 22px → 16.5pt
const MAIN_LEFT = SIDEBAR_WIDTH + 18; // 24px gap → 18pt
const MAIN_WIDTH = PAGE_WIDTH - MAIN_LEFT - MARGINS.right;
const MAIN_PAD_TOP = 30; // 40px → 30pt

// Modern font sizes (pt from design px)
const MF = {
  NAME: 16.5,        // 22px → 16.5pt
  NICKNAME: 9.75,    // 13px → 9.75pt
  TITLE: 8.25,       // 11px → 8.25pt
  SIDE_HEADER: 7.1,  // 9.5px → 7.1pt
  SIDE_ITEM: 8.25,   // 11px → 8.25pt
  LINK_TYPE: 6.75,   // 9px → 6.75pt
  MAIN_HEADER: 7.9,  // 10.5px → 7.9pt
  COMPANY: 9.4,      // 12.5px → 9.4pt
  POSITION: 8.6,     // 11.5px → 8.6pt
  DATE: 7.9,         // 10.5px → 7.9pt
  BODY: 8.25,        // 11px → 8.25pt (description)
  PROJECT: 7.9,      // 10.5px → 7.9pt
} as const;

function generateModernLayout(
  doc: PDFKit.PDFDocument,
  data: ResumeData,
  accentColor: string
): void {
  // Draw sidebar background on every new page automatically.
  // This must be registered BEFORE any content is written so it also fires
  // for pages added by PDFKit's automatic text-overflow pagination.
  const drawSidebarBg = () => {
    doc.save();
    doc.rect(0, 0, SIDEBAR_WIDTH, doc.page.height).fill(SIDEBAR_BG);
    doc.restore();
  };
  doc.on("pageAdded", drawSidebarBg);

  // Draw full-page sidebar background on the first (already-open) page
  drawSidebarBg();

  // ── Sidebar ──────────────────────────────────────────────────────────────
  let sy = MAIN_PAD_TOP; // sidebar y cursor (40px → 30pt)

  // Avatar / photo — 76px → 57pt diameter circle (fixed size, matches preview)
  const avatarDiam = 57; // 76px × 0.75 = 57pt
  const avatarRadius = avatarDiam / 2;
  const avatarCx = SIDEBAR_PAD + avatarRadius;
  const avatarCy = sy + avatarRadius;

  if (data.photo) {
    try {
      const base64Data = data.photo.split(",")[1];
      const imageBuffer = Buffer.from(base64Data, "base64");
      const diameter = avatarRadius * 2;
      doc.save();
      // Clip circle
      doc.circle(avatarCx, avatarCy, avatarRadius).clip();

      // Use COVER (this matches object-fit: cover)
      doc.image(
        imageBuffer,
        avatarCx - avatarRadius,
        avatarCy - avatarRadius,
        {
          cover: [diameter, diameter],
          align: "center",
          valign: "center",
        }
      );
      doc.restore();
    } catch {
      modernDrawInitialsAvatar(doc, data, avatarCx, avatarCy, avatarRadius, accentColor);
    }
  } else {
    modernDrawInitialsAvatar(doc, data, avatarCx, avatarCy, avatarRadius, accentColor);
  }

  sy += avatarDiam + 10.5; // 14px → 10.5pt

  // Name — bold 16.5pt #eceff4; letterSpacing -0.015em (≈ -0.25pt at 16.5pt)
  doc
    .font("Helvetica-Bold")
    .fontSize(MF.NAME)
    .fillColor(SIDEBAR_TEXT)
    .text(
      `${data.firstName || ""} ${data.lastName || ""}`.trim(),
      SIDEBAR_PAD,
      sy,
      { width: SIDEBAR_WIDTH - SIDEBAR_PAD * 2, align: "left" }
    );
  sy = doc.y;

  // Nickname — new line, 9.75pt, #878a92, italic; marginTop 3px ≈ 2.25pt
  if (data.nickname && data.nickname.trim()) {
    sy += 2.25;
    doc
      .font("Helvetica-Oblique")
      .fontSize(MF.NICKNAME)
      .fillColor(SIDEBAR_MUTED)
      .text(`(${data.nickname.trim()})`, SIDEBAR_PAD, sy, {
        width: SIDEBAR_WIDTH - SIDEBAR_PAD * 2,
        align: "left",
      });
    sy = doc.y;
  }

  // Title — 8.25pt, #a9acb3, ALL CAPS, letterSpacing 0.1em; marginTop 2px ≈ 1.5pt
  if (data.title && data.title.trim()) {
    sy += 1.5;
    doc
      .font("Helvetica")
      .fontSize(MF.TITLE)
      .fillColor("#a9acb3")
      .text(data.title.trim().toUpperCase(), SIDEBAR_PAD, sy, {
        width: SIDEBAR_WIDTH - SIDEBAR_PAD * 2,
        characterSpacing: 0.83, // 0.1em at 8.25pt
        align: "left",
      });
    sy = doc.y;
  }

  // Contact section header
  sy = modernSideHeader(doc, "CONTACT", sy);
  if (data.email) {
    sy = modernSideItem(doc, data.email, sy);
  }
  if (data.phone) {
    sy = modernSideItem(doc, data.phone, sy);
  }
  if (data.location) {
    sy = modernSideItem(doc, data.location, sy);
  }

  // Links section
  const filteredLinks = (data.links || []).filter((l) => l.url && l.url.trim());
  if (filteredLinks.length > 0) {
    sy = modernSideHeader(doc, "LINKS", sy);
    filteredLinks.forEach((l) => {
      // Link type label — 6.75pt, #878a92, ALL CAPS
      doc
        .font("Helvetica")
        .fontSize(MF.LINK_TYPE)
        .fillColor(SIDEBAR_MUTED)
        .text(
          getLinkLabel(l).toUpperCase(),
          SIDEBAR_PAD,
          sy,
          { width: SIDEBAR_WIDTH - SIDEBAR_PAD * 2, characterSpacing: 0.54 }
        );
      sy = doc.y + 1;
      // URL — 8.25pt, #d6d9de
      doc
        .font("Helvetica")
        .fontSize(MF.SIDE_ITEM)
        .fillColor(SIDEBAR_ITEM)
        .text(l.url.replace(/^https?:\/\//, ""), SIDEBAR_PAD, sy, {
          width: SIDEBAR_WIDTH - SIDEBAR_PAD * 2,
          align: "left",
        });
      sy = doc.y + 3;
    });
  }

  // Languages section — each on its own line with level right-aligned
  if (data.languages && data.languages.length > 0) {
    sy = modernSideHeader(doc, "LANGUAGES", sy);
    data.languages.forEach((lang) => {
      const itemY = sy;
      // Language name left, level right
      doc
        .font("Helvetica")
        .fontSize(MF.SIDE_ITEM)
        .fillColor(SIDEBAR_ITEM)
        .text(lang.language, SIDEBAR_PAD, itemY, {
          width: SIDEBAR_WIDTH - SIDEBAR_PAD * 2,
          lineBreak: false,
        });
      // Level — 7.5pt, #878a92, right
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(SIDEBAR_MUTED)
        .text(
          LEVEL_LABELS[lang.level] ?? lang.level,
          SIDEBAR_PAD,
          itemY,
          {
            width: SIDEBAR_WIDTH - SIDEBAR_PAD * 2,
            align: "right",
            lineBreak: false,
          }
        );
      sy = itemY + MF.SIDE_ITEM + 3;
    });
  }

  // Skills — pill-style chips; preview: fontSize 10px (7.5pt), bg #2b2d33, color #d6d9de
  if (data.skills && data.skills.length > 0) {
    sy = modernSideHeader(doc, "SKILLS", sy);
    // Render skills as wrapped pills
    const pillPadH = 5.25; // 7px → 5.25pt
    const pillPadV = 1.5;  // 2px → 1.5pt
    const pillFontSize = 7.5; // 10px → 7.5pt
    const pillGap = 3;
    let px = SIDEBAR_PAD;
    let rowY = sy;
    const maxX = SIDEBAR_WIDTH - SIDEBAR_PAD;

    doc.font("Helvetica").fontSize(pillFontSize).fillColor(SIDEBAR_ITEM);

    data.skills.forEach((skill) => {
      const skillText = skill.value;
      const textW = doc.widthOfString(skillText);
      const pillW = textW + pillPadH * 2;
      const pillH = pillFontSize + pillPadV * 2;

      // Wrap to next row if pill overflows
      if (px + pillW > maxX && px > SIDEBAR_PAD) {
        px = SIDEBAR_PAD;
        rowY += pillH + pillGap;
      }

      // Pill background — rounded rect, #2b2d33
      doc.save();
      const rr = pillH / 2; // border-radius: 999px
      doc
        .roundedRect(px, rowY, pillW, pillH, rr)
        .fill("#2b2d33");
      doc.restore();

      // Skill text
      doc
        .font("Helvetica")
        .fontSize(pillFontSize)
        .fillColor(SIDEBAR_ITEM)
        .text(skillText, px + pillPadH, rowY + pillPadV, { lineBreak: false });

      px += pillW + pillGap;
      sy = rowY + pillH;
    });

    sy += pillGap;
  }

  // ── Main column ───────────────────────────────────────────────────────────
  // Reset doc cursor to main column top
  doc.x = MAIN_LEFT;
  doc.y = MAIN_PAD_TOP;

  let isFirst = true;

  // About / Summary
  if (data.summary && data.summary.trim()) {
    modernMainHeader(doc, "About", isFirst, MAIN_LEFT, MAIN_WIDTH);
    isFirst = false;
    doc
      .font("Helvetica")
      .fontSize(MF.BODY)
      .fillColor(CC.BODY)
      .text(data.summary.trim(), MAIN_LEFT, doc.y, {
        width: MAIN_WIDTH,
        align: "left",
        lineGap: 2,
      });
    doc.y += 4;
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    modernMainHeader(doc, "Experience", isFirst, MAIN_LEFT, MAIN_WIDTH);
    isFirst = false;

    data.experience.forEach((exp, i) => {
      checkPageBreakModern(doc);

      const startLabel = [exp.startMonth, exp.startYear].filter(Boolean).join(" ");
      const endLabel = exp.isCurrent
        ? "Present"
        : [exp.endMonth, exp.endYear].filter(Boolean).join(" ");
      const durationText = endLabel ? `${startLabel} \u2014 ${endLabel}` : startLabel;

      const entryY = doc.y;

      // Date — right-aligned, 7.9pt, #878a92
      doc
        .font("Helvetica")
        .fontSize(MF.DATE)
        .fillColor(CC.DATE)
        .text(durationText, MAIN_LEFT, entryY, {
          width: MAIN_WIDTH,
          align: "right",
          lineBreak: false,
        });

      // Company — bold 9.4pt, #111214
      doc
        .font("Helvetica-Bold")
        .fontSize(MF.COMPANY)
        .fillColor(CC.NAME)
        .text(exp.company || "Company", MAIN_LEFT, entryY, {
          width: MAIN_WIDTH - doc.widthOfString(durationText) - 10.5,
          lineBreak: false,
        });

      // Position — 8.6pt, accent color, weight 500 (use regular since no medium font)
      doc.y = entryY + MF.COMPANY + 2;
      doc
        .font("Helvetica")
        .fontSize(MF.POSITION)
        .fillColor(accentColor)
        .text(exp.position || "Position", MAIN_LEFT, doc.y, {
          width: MAIN_WIDTH,
          align: "left",
        });

      // Description — 8.25pt, #2a2c31, marginTop 4px ≈ 3pt
      if (exp.description && exp.description.trim()) {
        doc.y += 3;
        exp.description.split("\n").forEach((line) => {
          doc
            .font("Helvetica")
            .fontSize(MF.BODY)
            .fillColor(CC.BODY)
            .text(line || " ", MAIN_LEFT, doc.y, {
              width: MAIN_WIDTH,
              align: "left",
              lineGap: 1.5,
            });
        });
      }

      // Projects — marginTop 6px ≈ 4.5pt
      if (exp.projects && exp.projects.length > 0) {
        doc.y += 4.5;
        exp.projects.forEach((project) => {
          doc.y += 1.5; // 2px gap
          const projY = doc.y;
          let px2 = MAIN_LEFT;

          // Name — bold 7.9pt, #111214
          doc
            .font("Helvetica-Bold")
            .fontSize(MF.PROJECT)
            .fillColor(CC.NAME)
            .text(project.name, px2, projY, { lineBreak: false });
          px2 += doc.widthOfString(project.name);

          // Detail — " — detail", regular, #55585f
          if (project.detail && project.detail.trim()) {
            doc
              .font("Helvetica")
              .fontSize(MF.PROJECT)
              .fillColor(CC.POSITION)
              .text(` \u2014 ${project.detail}`, px2, projY, {
                width: MAIN_WIDTH - (px2 - MAIN_LEFT),
                lineBreak: false,
              });
          }

          doc.y = projY + MF.PROJECT + 2.5;
        });
      }

      // marginBottom 14px ≈ 10.5pt
      if (i < data.experience.length - 1) {
        doc.y += 10.5;
      }
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    modernMainHeader(doc, "Education", isFirst, MAIN_LEFT, MAIN_WIDTH);
    isFirst = false;

    data.education.forEach((edu, i) => {
      checkPageBreakModern(doc);

      const endLabel = edu.isCurrent ? "Present" : edu.endYear || "";
      const durationText = endLabel
        ? `${edu.startYear} \u2013 ${endLabel}`
        : edu.startYear || "";

      const entryY = doc.y;

      // Date right-aligned
      doc
        .font("Helvetica")
        .fontSize(MF.DATE)
        .fillColor(CC.DATE)
        .text(durationText, MAIN_LEFT, entryY, {
          width: MAIN_WIDTH,
          align: "right",
          lineBreak: false,
        });

      // Institution — bold 9.4pt
      doc
        .font("Helvetica-Bold")
        .fontSize(MF.COMPANY)
        .fillColor(CC.NAME)
        .text(edu.institution || "Institution", MAIN_LEFT, entryY, {
          width: MAIN_WIDTH - doc.widthOfString(durationText) - 10.5,
          lineBreak: false,
        });

      // Degree · FieldOfStudy — accent, 8.6pt; preview uses " · " separator
      doc.y = entryY + MF.COMPANY + 2;
      const degreeText =
        edu.fieldOfStudy && edu.fieldOfStudy.trim()
          ? `${edu.degree} \u00b7 ${edu.fieldOfStudy}`
          : edu.degree;
      doc
        .font("Helvetica")
        .fontSize(MF.POSITION)
        .fillColor(accentColor)
        .text(degreeText, MAIN_LEFT, doc.y, {
          width: MAIN_WIDTH,
          align: "left",
        });

      // Description
      if (edu.description && edu.description.trim()) {
        doc.y += 3;
        doc
          .font("Helvetica")
          .fontSize(MF.BODY)
          .fillColor(CC.BODY)
          .text(edu.description.trim(), MAIN_LEFT, doc.y, {
            width: MAIN_WIDTH,
            align: "left",
            lineGap: 1.5,
          });
      }

      if (i < data.education.length - 1) {
        doc.y += 10.5;
      }
    });
  }

  // Certificates
  if (data.certificates && data.certificates.length > 0) {
    modernMainHeader(doc, "Certificates", isFirst, MAIN_LEFT, MAIN_WIDTH);

    data.certificates.forEach((cert, i) => {
      checkPageBreakModern(doc);

      const entryY = doc.y;

      // Year right-aligned, 7.9pt, #878a92
      if (cert.year) {
        doc
          .font("Helvetica")
          .fontSize(MF.DATE)
          .fillColor(CC.DATE)
          .text(cert.year, MAIN_LEFT, entryY, {
            width: MAIN_WIDTH,
            align: "right",
            lineBreak: false,
          });
      }

      // Name — bold 9.4pt
      doc
        .font("Helvetica-Bold")
        .fontSize(MF.COMPANY)
        .fillColor(CC.NAME)
        .text(cert.name, MAIN_LEFT, entryY, {
          width: MAIN_WIDTH - (cert.year ? doc.widthOfString(cert.year) + 10.5 : 0),
          lineBreak: false,
        });

      // Issuer — accent, 8.6pt
      doc.y = entryY + MF.COMPANY + 2;
      doc
        .font("Helvetica")
        .fontSize(MF.POSITION)
        .fillColor(accentColor)
        .text(cert.issuer, MAIN_LEFT, doc.y, {
          width: MAIN_WIDTH,
          align: "left",
        });

      // marginBottom 6px ≈ 4.5pt
      if (i < data.certificates.length - 1) {
        doc.y += 4.5;
      }
    });
  }

  // Unregister the sidebar background listener now that all content is drawn.
  // This prevents the listener from firing if PDFKit internally adds any
  // trailing page during doc.end() finalization, which would create an
  // extra blank page with only a sidebar background on it.
  doc.removeListener("pageAdded", drawSidebarBg);
}

/**
 * Draws the initials avatar circle for Modern template.
 * Preview: 76px circle, bg #2b2d33, text #878a92, serif, 28px → 21pt, weight 600.
 */
function modernDrawInitialsAvatar(
  doc: PDFKit.PDFDocument,
  data: ResumeData,
  cx: number,
  cy: number,
  radius: number,
  _accentColor: string
): void {
  // Background circle — #2b2d33
  doc.save();
  doc.circle(cx, cy, radius).fill("#2b2d33");
  doc.restore();

  const initials = (
    (data.firstName ? data.firstName.charAt(0) : "") +
    (data.lastName ? data.lastName.charAt(0) : "")
  ).toUpperCase();

  const fontSize = 21; // 28px → 21pt
  doc
    .font("Helvetica-Bold")
    .fontSize(fontSize)
    .fillColor(SIDEBAR_MUTED); // #878a92

  const tw = doc.widthOfString(initials);
  const tx = cx - tw / 2;
  const ty = cy - fontSize * 0.38; // approximate vertical centering
  doc.text(initials, tx, ty, { lineBreak: false });
}

/**
 * Sidebar section header: 9.5px → 7.1pt, ALL CAPS, letterSpacing 0.14em,
 * color #878a92, marginTop 22px → 16.5pt, marginBottom 6px → 4.5pt.
 * Returns the new sy after the header.
 */
function modernSideHeader(
  doc: PDFKit.PDFDocument,
  label: string,
  sy: number
): number {
  sy += 16.5; // marginTop 22px
  doc
    .font("Helvetica")
    .fontSize(MF.SIDE_HEADER)
    .fillColor(SIDEBAR_MUTED)
    .text(label.toUpperCase(), SIDEBAR_PAD, sy, {
      width: SIDEBAR_WIDTH - SIDEBAR_PAD * 2,
      characterSpacing: 0.99, // 0.14em at 7.1pt
      align: "left",
    });
  return doc.y + 4.5; // marginBottom 6px
}

/**
 * Sidebar item: 11px → 8.25pt, color #d6d9de, marginBottom 4px → 3pt.
 * Returns the new sy.
 */
function modernSideItem(
  doc: PDFKit.PDFDocument,
  text: string,
  sy: number
): number {
  doc
    .font("Helvetica")
    .fontSize(MF.SIDE_ITEM)
    .fillColor(SIDEBAR_ITEM)
    .text(text, SIDEBAR_PAD, sy, {
      width: SIDEBAR_WIDTH - SIDEBAR_PAD * 2,
      align: "left",
    });
  return doc.y + 3; // marginBottom 4px
}

/**
 * Main column section header for Modern template.
 * Preview: 10.5px → 7.9pt, ALL CAPS, letterSpacing 0.16em, bold, #111214,
 * flex row with 1px #e6e6e3 line filling the rest.
 * marginTop 24px → 18pt (or 0 if first), marginBottom 10px → 7.5pt.
 */
function modernMainHeader(
  doc: PDFKit.PDFDocument,
  label: string,
  first: boolean,
  x: number,
  width: number
): void {
  if (!first) {
    doc.y += 18; // marginTop 24px between sections
  }

  const headerY = doc.y;
  doc
    .font("Helvetica-Bold")
    .fontSize(MF.MAIN_HEADER)
    .fillColor(CC.NAME)
    .text(label.toUpperCase(), x, headerY, {
      characterSpacing: 1.26, // 0.16em at 7.9pt
      lineBreak: false,
    });

  // Horizontal rule — 1px, #e6e6e3, from after text to right edge
  const textEnd = x + doc.widthOfString(label.toUpperCase()) + 7.5; // 10px gap
  const lineY = headerY + MF.MAIN_HEADER * 0.5; // vertically center on text
  doc
    .save()
    .strokeColor("#e6e6e3")
    .lineWidth(0.75)
    .moveTo(textEnd, lineY)
    .lineTo(x + width, lineY)
    .stroke()
    .restore();

  doc.y = headerY + MF.MAIN_HEADER + 7.5; // marginBottom 10px
}

function checkPageBreakModern(doc: PDFKit.PDFDocument): void {
  const remainingSpace = PAGE_HEIGHT - MARGINS.bottom - doc.y;
  if (remainingSpace < 100) {
    // pageAdded listener in generateModernLayout will re-draw the sidebar bg
    doc.addPage();
    doc.x = MAIN_LEFT;
    doc.y = MAIN_PAD_TOP;
  }
}

// ===========================================================================
// COMPACT LAYOUT
// Mirrors CompactTemplate.tsx exactly:
//   - No sidebar; tight spacing throughout
//   - Header: name (bold), nickname inline (muted, smaller), title (accent),
//             contact items (gap-separated, no divider dots), no photo
//   - Sections: borderTop rule (except first), 9.5px ALL CAPS header (bold, #111214)
//   - Entries: 110px left column (date, muted) + flex-1 right column
//   - Skills/Languages: joined by " · "
//   - Certificates: same 2-col layout as experience/education
// ===========================================================================

// Compact design colors
const KK = {
  NAME: "#111214",
  NICKNAME: "#878a92",
  TITLE: "#55585f", // accent — we use accentColor param at call sites
  CONTACT: "#55585f",
  SECTION_BG: "none",
  SECTION_TEXT: "#111214",
  DATE: "#878a92",
  COMPANY: "#111214",
  POSITION: "#55585f",
  BODY: "#2a2c31",
} as const;

// Compact font sizes (pt from design px)
const KF = {
  NAME: 15,        // 20px → 15pt
  NICKNAME: 9.75,  // 13px → 9.75pt
  TITLE: 8.25,     // 11px → 8.25pt
  CONTACT: 7.5,    // 10px → 7.5pt
  SECTION: 7.1,    // 9.5px → 7.1pt
  COMPANY: 8.6,    // 11.5px → 8.6pt
  POSITION: 7.9,   // 10.5px → 7.9pt
  DATE: 7.5,       // 10px → 7.5pt
  BODY: 7.9,       // 10.5px → 7.9pt
  PROJECT: 7.5,    // 10px → 7.5pt
} as const;

// Left date column width in the 2-col entry layout: 110px → 82.5pt
const DATE_COL = 82.5;
const CONTENT_COL = CONTENT_WIDTH - DATE_COL - 10.5; // 14px gap → 10.5pt

function generateCompactLayout(
  doc: PDFKit.PDFDocument,
  data: ResumeData,
  accentColor: string
): void {
  // ── Header ────────────────────────────────────────────────────────────────
  // Name — 15pt bold #111214
  const firstName = data.firstName || "";
  const lastName = data.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  doc
    .font("Helvetica-Bold")
    .fontSize(KF.NAME)
    .fillColor(KK.NAME)
    .text(fullName, MARGINS.left, MARGINS.top, {
      width: CONTENT_WIDTH,
      continued: !!(data.nickname && data.nickname.trim()),
      lineBreak: false,
    });

  // Nickname inline — regular, 9.75pt, #878a92, marginLeft 6px ≈ 4.5pt
  if (data.nickname && data.nickname.trim()) {
    doc
      .font("Helvetica")
      .fontSize(KF.NICKNAME)
      .fillColor(KK.NICKNAME)
      .text(` (${data.nickname.trim()})`, {
        continued: false,
        lineBreak: false,
      });
  }

  doc.y = MARGINS.top + KF.NAME + 2;

  // Title — 8.25pt, accentColor, weight 500; marginTop 2px ≈ 1.5pt
  if (data.title && data.title.trim()) {
    doc.y += 1.5;
    doc
      .font("Helvetica")
      .fontSize(KF.TITLE)
      .fillColor(accentColor)
      .text(data.title.trim(), MARGINS.left, doc.y, {
        width: CONTENT_WIDTH,
        align: "left",
      });
  }

  // Contact items — marginTop 6px ≈ 4.5pt; gap-separated (no dots)
  const contactItems: string[] = [
    data.email,
    data.phone,
    data.location ?? "",
  ].filter(Boolean) as string[];

  const linkItems: { text: string; href: string }[] = (data.links || [])
    .filter((l) => l.url && l.url.trim())
    .map((l) => ({
      text: l.url.replace(/^https?:\/\//, ""),
      href: l.url,
    }));

  // Helper to render a gap-separated row of compact contact items inline
  const renderCompactRow = (
    items: { text: string; href?: string }[],
    rowY: number
  ) => {
    let cx = MARGINS.left;
    items.forEach((item, i) => {
      if (i > 0) {
        // gap separator — a narrow space (no dot in compact)
        doc
          .font("Helvetica")
          .fontSize(KF.CONTACT)
          .fillColor(KK.CONTACT)
          .text("  ", cx, rowY, { lineBreak: false });
        cx += doc.widthOfString("  ");
      }
      doc.font("Helvetica").fontSize(KF.CONTACT);
      const textW = doc.widthOfString(item.text);
      const textOptions: PDFKit.Mixins.TextOptions = {
        lineBreak: false,
        ...(item.href
          ? { link: item.href, underline: false, width: textW }
          : {}),
      };
      doc.fillColor(KK.CONTACT).text(item.text, cx, rowY, textOptions);
      cx += textW;
    });
  };

  if (contactItems.length > 0) {
    doc.y += 4.5;
    // Preview uses flexWrap: "wrap" with gap: 12px → space them with a separator
    const rowY = doc.y;
    renderCompactRow(
      contactItems.map((t) => ({ text: t })),
      rowY
    );
    doc.y = rowY + KF.CONTACT + 3;
  }

  // Links row — rendered on a new line below the contact row
  if (linkItems.length > 0) {
    const linksRowY = doc.y;
    renderCompactRow(linkItems, linksRowY);
    doc.y = linksRowY + KF.CONTACT + 3;
  }

  // ── Sections ──────────────────────────────────────────────────────────────
  let firstSection = true;

  // Summary
  if (data.summary && data.summary.trim()) {
    compactSectionHeader(doc, "Summary", firstSection);
    firstSection = false;
    doc
      .font("Helvetica")
      .fontSize(KF.BODY)
      .fillColor(KK.BODY)
      .text(data.summary.trim(), MARGINS.left, doc.y, {
        width: CONTENT_WIDTH,
        align: "left",
        lineGap: 1,
      });
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    compactSectionHeader(doc, "Experience", firstSection);
    firstSection = false;

    data.experience.forEach((exp, i) => {
      checkPageBreak(doc);

      const startLabel = [exp.startMonth, exp.startYear].filter(Boolean).join(" ");
      const endLabel = exp.isCurrent
        ? "Present"
        : [exp.endMonth, exp.endYear].filter(Boolean).join(" ");
      const durationText = endLabel ? `${startLabel} \u2014 ${endLabel}` : startLabel;

      const entryY = doc.y;

      // Left column: date in #878a92
      doc
        .font("Helvetica")
        .fontSize(KF.DATE)
        .fillColor(KK.DATE)
        .text(durationText, MARGINS.left, entryY, {
          width: DATE_COL,
          align: "left",
        });

      // Right column starts at DATE_COL + gap
      const rightX = MARGINS.left + DATE_COL + 10.5;

      // Company — bold, 8.6pt, #111214
      doc
        .font("Helvetica-Bold")
        .fontSize(KF.COMPANY)
        .fillColor(KK.COMPANY)
        .text(exp.company || "Company", rightX, entryY, {
          width: CONTENT_COL,
          align: "left",
        });

      // Position — 7.9pt, #55585f
      doc
        .font("Helvetica")
        .fontSize(KF.POSITION)
        .fillColor(KK.POSITION)
        .text(exp.position || "Position", rightX, doc.y, {
          width: CONTENT_COL,
        });

      // Description — 7.9pt, #2a2c31, marginTop 3px ≈ 2.25pt
      if (exp.description && exp.description.trim()) {
        doc.y += 2.25;
        exp.description.split("\n").forEach((line) => {
          doc
            .font("Helvetica")
            .fontSize(KF.BODY)
            .fillColor(KK.BODY)
            .text(line || " ", rightX, doc.y, {
              width: CONTENT_COL,
              align: "left",
              lineGap: 1,
            });
        });
      }

      // Projects — marginTop 4px ≈ 3pt
      if (exp.projects && exp.projects.length > 0) {
        doc.y += 3;
        exp.projects.forEach((project) => {
          doc.y += 1.5; // 2px gap
          const projY = doc.y;
          let px2 = rightX;

          // Name — bold, 7.5pt, #111214
          doc
            .font("Helvetica-Bold")
            .fontSize(KF.PROJECT)
            .fillColor(KK.COMPANY)
            .text(project.name, px2, projY, { lineBreak: false });
          px2 += doc.widthOfString(project.name);

          if (project.detail && project.detail.trim()) {
            doc
              .font("Helvetica")
              .fontSize(KF.PROJECT)
              .fillColor(KK.POSITION)
              .text(` \u2014 ${project.detail}`, px2, projY, {
                width: CONTENT_COL - (px2 - rightX),
                lineBreak: false,
              });
          }

          doc.y = projY + KF.PROJECT + 2;
        });
      }

      // marginBottom 10px ≈ 7.5pt
      if (i < data.experience.length - 1) {
        doc.y += 7.5;
      }
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    compactSectionHeader(doc, "Education", firstSection);
    firstSection = false;

    data.education.forEach((edu, i) => {
      checkPageBreak(doc);

      const endLabel = edu.isCurrent ? "Present" : edu.endYear || "";
      const durationText = endLabel
        ? `${edu.startYear} \u2013 ${endLabel}`
        : edu.startYear || "";

      const entryY = doc.y;
      const rightX = MARGINS.left + DATE_COL + 10.5;

      // Date left column
      doc
        .font("Helvetica")
        .fontSize(KF.DATE)
        .fillColor(KK.DATE)
        .text(durationText, MARGINS.left, entryY, {
          width: DATE_COL,
          align: "left",
        });

      // Institution — bold, 8.6pt
      doc
        .font("Helvetica-Bold")
        .fontSize(KF.COMPANY)
        .fillColor(KK.COMPANY)
        .text(edu.institution || "Institution", rightX, entryY, {
          width: CONTENT_COL,
          align: "left",
        });

      // Degree · FieldOfStudy — 7.9pt, #55585f; preview uses " · " separator
      const degreeText =
        edu.fieldOfStudy && edu.fieldOfStudy.trim()
          ? `${edu.degree} \u00b7 ${edu.fieldOfStudy}`
          : edu.degree;
      doc
        .font("Helvetica")
        .fontSize(KF.POSITION)
        .fillColor(KK.POSITION)
        .text(degreeText, rightX, doc.y, {
          width: CONTENT_COL,
        });

      // Description
      if (edu.description && edu.description.trim()) {
        doc.y += 2.25;
        doc
          .font("Helvetica")
          .fontSize(KF.BODY)
          .fillColor(KK.BODY)
          .text(edu.description.trim(), rightX, doc.y, {
            width: CONTENT_COL,
            align: "left",
            lineGap: 1,
          });
      }

      if (i < data.education.length - 1) {
        doc.y += 7.5;
      }
    });
  }

  // Skills — joined by " · "
  if (data.skills && data.skills.length > 0) {
    compactSectionHeader(doc, "Skills", firstSection);
    firstSection = false;
    const skillsText = data.skills.map((s) => s.value).join(" \u00b7 ");
    doc
      .font("Helvetica")
      .fontSize(KF.BODY)
      .fillColor(KK.BODY)
      .text(skillsText, MARGINS.left, doc.y, {
        width: CONTENT_WIDTH,
        align: "left",
      });
  }

  // Languages — "Language (Level) · ..." with level in #878a92 inline
  if (data.languages && data.languages.length > 0) {
    compactSectionHeader(doc, "Languages", firstSection);
    firstSection = false;

    // Render inline mixed-color tokens
    const rowY = doc.y;
    let cx = MARGINS.left;

    data.languages.forEach((lang, li) => {
      if (li > 0) {
        doc
          .font("Helvetica")
          .fontSize(KF.BODY)
          .fillColor(KK.BODY)
          .text(" \u00b7 ", cx, rowY, { lineBreak: false });
        cx += doc.widthOfString(" \u00b7 ");
      }
      doc
        .font("Helvetica")
        .fontSize(KF.BODY)
        .fillColor(KK.BODY)
        .text(lang.language, cx, rowY, { lineBreak: false });
      cx += doc.widthOfString(lang.language);

      const levelStr = ` (${LEVEL_LABELS[lang.level] ?? lang.level})`;
      doc
        .font("Helvetica")
        .fontSize(KF.BODY)
        .fillColor(KK.DATE)
        .text(levelStr, cx, rowY, { lineBreak: false });
      cx += doc.widthOfString(levelStr);
    });

    doc.y = rowY + KF.BODY + 3;
  }

  // Certificates — same 2-col layout as experience/education
  if (data.certificates && data.certificates.length > 0) {
    compactSectionHeader(doc, "Certificates", firstSection);

    data.certificates.forEach((cert, i) => {
      checkPageBreak(doc);

      const entryY = doc.y;
      const rightX = MARGINS.left + DATE_COL + 10.5;

      // Year left column — 7.5pt, #878a92
      doc
        .font("Helvetica")
        .fontSize(KF.DATE)
        .fillColor(KK.DATE)
        .text(cert.year || "", MARGINS.left, entryY, {
          width: DATE_COL,
          align: "left",
        });

      // Name — bold, 8.6pt, #111214
      doc
        .font("Helvetica-Bold")
        .fontSize(KF.COMPANY)
        .fillColor(KK.COMPANY)
        .text(cert.name, rightX, entryY, {
          width: CONTENT_COL,
          align: "left",
        });

      // Issuer — 7.9pt, #55585f
      doc
        .font("Helvetica")
        .fontSize(KF.POSITION)
        .fillColor(KK.POSITION)
        .text(cert.issuer, rightX, doc.y, {
          width: CONTENT_COL,
        });

      // marginBottom 10px ≈ 7.5pt
      if (i < data.certificates.length - 1) {
        doc.y += 7.5;
      }
    });
  }
}

/**
 * Compact section header: borderTop (except first), marginTop 12px → 9pt,
 * paddingTop 10px → 7.5pt (when not first), label 9.5px → 7.1pt, bold,
 * ALL CAPS, #111214, marginBottom 6px → 4.5pt.
 */
function compactSectionHeader(
  doc: PDFKit.PDFDocument,
  label: string,
  first: boolean
): void {
  // marginTop 12px → 9pt always; border and paddingTop only when not first
  doc.y += 9;

  if (!first) {
    // borderTop: 1px solid #e6e6e3
    const lineY = doc.y;
    doc
      .save()
      .strokeColor("#e6e6e3")
      .lineWidth(0.75)
      .moveTo(MARGINS.left, lineY)
      .lineTo(MARGINS.left + CONTENT_WIDTH, lineY)
      .stroke()
      .restore();
    doc.y += 7.5; // paddingTop 10px
  }

  // Header label — bold, 7.1pt, ALL CAPS, #111214, letterSpacing 0.14em
  doc
    .font("Helvetica-Bold")
    .fontSize(KF.SECTION)
    .fillColor(KK.SECTION_TEXT)
    .text(label.toUpperCase(), MARGINS.left, doc.y, {
      width: CONTENT_WIDTH,
      characterSpacing: 0.99, // 0.14em at 7.1pt
      align: "left",
    });

  doc.y += 4.5; // marginBottom 6px
}

// ===========================================================================
// Shared helpers
// ===========================================================================

/**
 * Checks if remaining page space is < 100pt and adds a new page if needed.
 */
function checkPageBreak(doc: PDFKit.PDFDocument): void {
  if (PAGE_HEIGHT - MARGINS.bottom - doc.y < 100) {
    doc.addPage();
  }
}

/**
 * Resolves a link's display label.
 */
function getLinkLabel(link: { type: string; otherLabel?: string | "" }): string {
  if (link.type === "other") {
    return link.otherLabel && link.otherLabel.trim()
      ? capitalizeFirst(link.otherLabel.trim())
      : "Other";
  }
  const MAP: Record<string, string> = {
    git: "Git Repo",
    portfolio: "Portfolio",
    linkedin: "LinkedIn",
  };
  return MAP[link.type] ?? capitalizeFirst(link.type);
}

function capitalizeFirst(str: string): string {
  if (!str || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
