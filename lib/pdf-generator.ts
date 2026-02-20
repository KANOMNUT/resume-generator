import PDFDocument from "pdfkit";
import type { ResumeData } from "./schema";

// Color scheme constants
const COLORS = {
  BLACK: "#000000",
  DARK_GRAY: "#333333",
  LIGHT_GRAY: "#CCCCCC",
  BLUE: "#0066CC",
} as const;

// Layout constants
const MARGINS = {
  top: 50,
  bottom: 50,
  left: 50,
  right: 50,
} as const;

const PAGE_WIDTH = 595.28; // A4 width in points
const PAGE_HEIGHT = 841.89; // A4 height in points
const CONTENT_WIDTH = PAGE_WIDTH - MARGINS.left - MARGINS.right;

// Photo dimensions
const PHOTO_SIZE = 200; // 110pt square
const PHOTO_GAP = 12; // gap between photo and text

// Font sizes
const FONT_SIZES = {
  NAME: 22,
  CONTACT: 10,
  SECTION_HEADER: 14,
  COMPANY: 12,
  POSITION: 11,
  SUMMARY: 11,
  DESCRIPTION: 10,
  SKILLS: 11,
  CERTIFICATES: 11,
} as const;

/**
 * Generates a PDF resume from validated resume data.
 * @param data - Validated and sanitized resume data
 * @returns Buffer containing the PDF document
 * @throws Error if PDF generation fails
 */
export async function generateResumePDF(data: ResumeData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: MARGINS,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      // Collect PDF data into buffer
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Generate PDF content
      generateHeader(doc, data);
      generateProfessionalSummary(doc, data);
      generateWorkExperience(doc, data);
      generateEducation(doc, data);
      generateSkills(doc, data);
      generateCertificates(doc, data);

      // Finalize the PDF
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

/**
 * Generates the header section with name, contact info, links, and optional photo.
 */
function generateHeader(doc: PDFKit.PDFDocument, data: ResumeData): void {
  const hasPhoto = !!data.photo;
  const textWidth = hasPhoto
    ? CONTENT_WIDTH - PHOTO_SIZE - PHOTO_GAP
    : CONTENT_WIDTH;

  // Render photo on the right side if provided
  if (hasPhoto && data.photo) {
    try {
      const base64Data = data.photo.split(",")[1];
      const imageBuffer = Buffer.from(base64Data, "base64");
      const photoX = PAGE_WIDTH - MARGINS.right - PHOTO_SIZE;

      doc.image(imageBuffer, photoX, MARGINS.top, {
        fit: [PHOTO_SIZE, PHOTO_SIZE],
        align: "center",
        valign: "center",
      });
    } catch {
      // If image fails to render, proceed without it
    }
  }

  // Full name with optional nickname
  const fullName = data.nickname
    ? `${data.firstName} ${data.lastName} (${data.nickname})`
    : `${data.firstName} ${data.lastName}`;

  doc
    .font("Helvetica-Bold")
    .fontSize(FONT_SIZES.NAME)
    .fillColor(COLORS.BLACK)
    .text(fullName, MARGINS.left, MARGINS.top, {
      width: textWidth,
      align: "left",
    });

  doc.moveDown(0.5);

  // Contact information
  const contactInfo = `${data.email} | ${data.phone}`;
  doc
    .font("Helvetica")
    .fontSize(FONT_SIZES.CONTACT)
    .fillColor(COLORS.DARK_GRAY)
    .text(contactInfo, MARGINS.left, doc.y, {
      width: textWidth,
      align: "left",
    });

  // Links
  if (data.links && data.links.length > 0) {
    doc.moveDown(0.3);

    data.links.forEach((link, index) => {
      const linkText = `${capitalizeFirst(link.type)}: ${link.url}`;
      doc
        .fillColor(COLORS.BLUE)
        .text(linkText, MARGINS.left, doc.y, {
          width: textWidth,
          align: "left",
          link: link.url,
          underline: false,
        });

      if (index < data.links.length - 1) {
        doc.moveDown(0.2);
      }
    });
  }

  // Ensure we move below the photo area when a photo is present
  if (hasPhoto) {
    const photoBottom = MARGINS.top + PHOTO_SIZE + 10;
    if (doc.y < photoBottom) {
      doc.y = photoBottom;
    }
  }

  doc.moveDown(1.5);
}

/**
 * Generates the Professional Summary section.
 */
function generateProfessionalSummary(
  doc: PDFKit.PDFDocument,
  data: ResumeData
): void {
  if (!data.summary || data.summary.trim().length === 0) {
    return;
  }

  checkPageBreak(doc);

  addSectionHeader(doc, "PROFESSIONAL SUMMARY");

  doc
    .font("Helvetica")
    .fontSize(FONT_SIZES.SUMMARY)
    .fillColor(COLORS.DARK_GRAY)
    .text(data.summary, {
      width: CONTENT_WIDTH,
      align: "left",
      indent: 20,
    });

  doc.moveDown(1.5);
}

/**
 * Generates the Work Experience section.
 */
function generateWorkExperience(
  doc: PDFKit.PDFDocument,
  data: ResumeData
): void {
  if (!data.experience || data.experience.length === 0) {
    return;
  }

  checkPageBreak(doc);

  addSectionHeader(doc, "WORK EXPERIENCE");

  data.experience.forEach((exp, index) => {
    // Check if we need a page break before this entry
    checkPageBreak(doc);

    const currentY = doc.y;

    // Company name (left-aligned)
    doc
      .font("Helvetica-Bold")
      .fontSize(FONT_SIZES.COMPANY)
      .fillColor(COLORS.BLACK)
      .text(exp.company, MARGINS.left, currentY, {
        width: CONTENT_WIDTH - 150, // Leave space for duration
        align: "left",
        continued: false,
      });

    // Duration (right-aligned on same line)
    doc.text(exp.duration, MARGINS.left, currentY, {
      width: CONTENT_WIDTH,
      align: "right",
    });

    doc.moveDown(0.3);

    // Position (italic)
    doc
      .font("Helvetica-Oblique")
      .fontSize(FONT_SIZES.POSITION)
      .fillColor(COLORS.DARK_GRAY)
      .text(exp.position, {
        width: CONTENT_WIDTH,
        align: "left",
      });

    doc.moveDown(0.3);

    // Description
    doc
      .font("Helvetica")
      .fontSize(FONT_SIZES.DESCRIPTION)
      .fillColor(COLORS.DARK_GRAY)
      .text(exp.description, {
        width: CONTENT_WIDTH,
        align: "left",
      });

    // Projects
    if (exp.projects && exp.projects.length > 0) {
      doc.moveDown(0.5);

      // "Projects:" label
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLORS.BLACK)
        .text("Projects:", {
          width: CONTENT_WIDTH,
          align: "left",
        });

      exp.projects.forEach((project, projectIndex) => {
        doc.moveDown(0.25);

        // Bullet + project name
        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor(COLORS.DARK_GRAY)
          .text(`\u2022 ${project.name}`, MARGINS.left + 10, doc.y, {
            width: CONTENT_WIDTH - 10,
            align: "left",
          });

        // Optional detail text
        if (project.detail && project.detail.trim().length > 0) {
          doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor(COLORS.DARK_GRAY)
            .text(project.detail, MARGINS.left + 20, doc.y, {
              width: CONTENT_WIDTH - 20,
              align: "left",
            });
        }

        // Space between projects, but not after the last one
        if (projectIndex < exp.projects.length - 1) {
          doc.moveDown(0.25);
        }
      });
    }

    // Add space between entries (but not after the last one)
    if (index < data.experience.length - 1) {
      doc.moveDown(1);
    }
  });

  doc.moveDown(1.5);
}

/**
 * Generates the Education section.
 */
function generateEducation(doc: PDFKit.PDFDocument, data: ResumeData): void {
  if (!data.education || data.education.length === 0) {
    return;
  }

  checkPageBreak(doc);

  addSectionHeader(doc, "EDUCATION");

  data.education.forEach((edu, index) => {
    checkPageBreak(doc);

    const currentY = doc.y;

    // Institution name (left-aligned)
    doc
      .font("Helvetica-Bold")
      .fontSize(FONT_SIZES.COMPANY)
      .fillColor(COLORS.BLACK)
      .text(edu.institution, MARGINS.left, currentY, {
        width: CONTENT_WIDTH - 150,
        align: "left",
        continued: false,
      });

    // Duration (right-aligned on same line)
    doc.text(edu.duration, MARGINS.left, currentY, {
      width: CONTENT_WIDTH,
      align: "right",
    });

    doc.moveDown(0.3);

    // Degree + optional field of study (italic)
    const degreeText =
      edu.fieldOfStudy && edu.fieldOfStudy.trim().length > 0
        ? `${edu.degree} — ${edu.fieldOfStudy}`
        : edu.degree;

    doc
      .font("Helvetica-Oblique")
      .fontSize(FONT_SIZES.POSITION)
      .fillColor(COLORS.DARK_GRAY)
      .text(degreeText, {
        width: CONTENT_WIDTH,
        align: "left",
      });

    // Optional description / activities
    if (edu.description && edu.description.trim().length > 0) {
      doc.moveDown(0.3);
      doc
        .font("Helvetica")
        .fontSize(FONT_SIZES.DESCRIPTION)
        .fillColor(COLORS.DARK_GRAY)
        .text(edu.description, {
          width: CONTENT_WIDTH,
          align: "left",
        });
    }

    if (index < data.education.length - 1) {
      doc.moveDown(1);
    }
  });

  doc.moveDown(1.5);
}

/**
 * Generates the Skills section.
 */
function generateSkills(doc: PDFKit.PDFDocument, data: ResumeData): void {
  if (!data.skills || data.skills.length === 0) {
    return;
  }

  checkPageBreak(doc);

  addSectionHeader(doc, "SKILLS");

  // Join skills with bullet separator
  const skillsText = data.skills.map((s) => s.value).join(" • ");

  doc
    .font("Helvetica")
    .fontSize(FONT_SIZES.SKILLS)
    .fillColor(COLORS.DARK_GRAY)
    .text(skillsText, {
      width: CONTENT_WIDTH,
      align: "left",
    });

  doc.moveDown(1.5);
}

/**
 * Generates the Certificates section.
 */
function generateCertificates(doc: PDFKit.PDFDocument, data: ResumeData): void {
  if (!data.certificates || data.certificates.length === 0) {
    return;
  }

  checkPageBreak(doc);

  addSectionHeader(doc, "CERTIFICATES");

  data.certificates.forEach((cert, index) => {
    // Format: "Name — Issuer (Year)" or "Name — Issuer" if no year
    const certText = cert.year
      ? `${cert.name} — ${cert.issuer} (${cert.year})`
      : `${cert.name} — ${cert.issuer}`;

    doc
      .font("Helvetica")
      .fontSize(FONT_SIZES.CERTIFICATES)
      .fillColor(COLORS.DARK_GRAY)
      .text(certText, {
        width: CONTENT_WIDTH,
        align: "left",
      });

    // Add small spacing between certificates
    if (index < data.certificates.length - 1) {
      doc.moveDown(0.3);
    }
  });
}

/**
 * Adds a section header with divider line.
 */
function addSectionHeader(doc: PDFKit.PDFDocument, title: string): void {
  doc
    .font("Helvetica-Bold")
    .fontSize(FONT_SIZES.SECTION_HEADER)
    .fillColor(COLORS.BLACK)
    .text(title, {
      width: CONTENT_WIDTH,
      align: "left",
    });

  doc.moveDown(0.3);

  // Draw divider line
  const lineY = doc.y;
  doc
    .strokeColor(COLORS.LIGHT_GRAY)
    .lineWidth(1)
    .moveTo(MARGINS.left, lineY)
    .lineTo(PAGE_WIDTH - MARGINS.right, lineY)
    .stroke();

  doc.moveDown(0.5);
}

/**
 * Checks if remaining page space is less than 100pt and adds a new page if needed.
 */
function checkPageBreak(doc: PDFKit.PDFDocument): void {
  const remainingSpace = PAGE_HEIGHT - MARGINS.bottom - doc.y;

  if (remainingSpace < 100) {
    doc.addPage();
  }
}

/**
 * Capitalizes the first letter of a string.
 */
function capitalizeFirst(str: string): string {
  if (!str || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
