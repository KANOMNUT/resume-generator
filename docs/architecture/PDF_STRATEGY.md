# PDF Generation Strategy — Resume Generator System

> Phase 0 Output | Authoritative & Read-Only after approval

---

## 1. Library Choice: PDFKit

**Selected:** [PDFKit](https://pdfkit.org/) (`pdfkit` npm package)

### Why PDFKit

| Criteria                    | PDFKit                                          |
|-----------------------------|--------------------------------------------------|
| Server-side native          | Yes — designed for Node.js                       |
| Next.js App Router compat   | Excellent — no known issues                      |
| Streaming support           | Native pipe/buffer API                           |
| Bundle size                 | ~2MB, no native binaries                         |
| Headless browser required   | No                                               |
| Multi-page support          | Automatic page breaks                            |
| Font embedding              | TTF, OTF, WOFF — with auto-subsetting            |
| Maintenance                 | Active, battle-tested, 900+ dependents           |

### Rejected Alternatives

| Library              | Reason for Rejection                                            |
|----------------------|-----------------------------------------------------------------|
| @react-pdf/renderer  | Active compatibility issues with Next.js 15 App Router          |
| pdfmake              | Larger bundle, custom font setup overhead                       |
| jsPDF                | Browser-first, requires node-canvas hacks on server             |
| Puppeteer/Playwright | Headless browser — too heavy, violates constraints              |

---

## 2. PDF Layout Design

### Page Setup
- **Size:** A4 (595.28 x 841.89 points)
- **Margins:** 50pt all sides
- **Font:** Helvetica (built-in, no custom font needed for MVP)
- **Color scheme:** Black text, dark gray (#333) for secondary text, light gray (#CCCCCC) for dividers

### Resume Layout Structure

```
┌──────────────────────────────────────┐
│  FIRST LAST (NICKNAME)               │  ← 22pt bold
│  email | phone                       │  ← 10pt, gray
│  link1 | link2 | link3              │  ← 10pt, blue
├──────────────────────────────────────┤
│  PROFESSIONAL SUMMARY                │  ← 14pt bold, section header
│  ─────────────────────               │  ← gray divider line
│  Summary text paragraph...           │  ← 11pt regular
├──────────────────────────────────────┤
│  WORK EXPERIENCE                     │
│  ─────────────────────               │
│  Company Name          Duration      │  ← 12pt bold + right-aligned
│  Position                            │  ← 11pt italic
│  Description paragraph...            │  ← 10pt regular
│                                      │
│  Company Name          Duration      │
│  ...                                 │
├──────────────────────────────────────┤
│  SKILLS                              │
│  ─────────────────────               │
│  Skill1 • Skill2 • Skill3 • ...     │  ← 11pt, bullet-separated
├──────────────────────────────────────┤
│  CERTIFICATES                        │
│  ─────────────────────               │
│  Certificate Name — Issuer (Year)    │  ← 11pt
│  Certificate Name — Issuer           │
└──────────────────────────────────────┘
```

### Section Rendering Order
1. Header (name, contact, links)
2. Professional Summary
3. Work Experience
4. Skills
5. Certificates (if present)

### Page Break Handling
- PDFKit auto-paginates when content exceeds page height
- Before each major section, check remaining space; if < 100pt, force new page
- Work experience entries: check if entry fits; if not, start on new page (avoid orphaned headers)

---

## 3. Implementation Architecture

### Module: `lib/pdf-generator.ts`

```typescript
// Exports a single function:
export async function generateResumePDF(data: ResumeData): Promise<Buffer>
```

**Internal structure:**
- `renderHeader(doc, data)` — Name, contact info, links
- `renderSummary(doc, summary)` — Professional summary section
- `renderExperience(doc, experience[])` — Work history entries
- `renderSkills(doc, skills[])` — Skills list
- `renderCertificates(doc, certificates[])` — Certificate entries
- `renderSectionTitle(doc, title)` — Reusable section header with divider

### Buffer Generation Pattern

```typescript
import PDFDocument from 'pdfkit';

export async function generateResumePDF(data: ResumeData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Render sections...
    renderHeader(doc, data);
    renderSummary(doc, data.summary);
    // ... etc

    doc.end();
  });
}
```

### API Route Integration: `app/api/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { resumeSchema } from '@/lib/schema';
import { generateResumePDF } from '@/lib/pdf-generator';
import { sanitizeResumeData } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
  // 1. Parse body
  const body = await request.json();

  // 2. Validate
  const result = resumeSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { errors: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // 3. Sanitize
  const sanitized = sanitizeResumeData(result.data);

  // 4. Generate PDF
  const pdfBuffer = await generateResumePDF(sanitized);

  // 5. Return with headers
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="resume.pdf"',
      'Content-Length': String(pdfBuffer.length),
    },
  });
}
```

---

## 4. Font Strategy

### MVP: Built-in Fonts
PDFKit includes 14 standard PDF fonts without any file embedding:
- **Helvetica** (regular, bold, oblique, bold-oblique)
- Times-Roman, Courier (same variants)

For the MVP, Helvetica provides a clean, professional appearance suitable for resumes.

### Future: Custom Fonts
If custom fonts are needed later:
1. Place `.ttf` files in `public/fonts/`
2. Register with `doc.registerFont('FontName', 'path/to/font.ttf')`
3. Use `doc.font('FontName')`

---

## 5. Memory & Performance

### Per-Request Memory
- PDFDocument instance: ~1–2MB
- Buffer accumulation: ~50–200KB for a typical resume (1-3 pages)
- Total per request: ~5–15MB peak
- Buffer freed after response completes (garbage collected)

### Throughput
- PDF generation time: 20–80ms for a typical resume
- No file I/O (all in-memory)
- No blocking operations
- Node.js event loop handles concurrent requests

### DoS Mitigation
- Max request body: 500KB
- Max array sizes enforced by Zod schema
- Max string lengths enforced by Zod schema
- No recursive or unbounded operations in PDF generation

---

## 6. Error Handling

| Scenario              | Response                                      |
|-----------------------|-----------------------------------------------|
| Invalid JSON body     | 400 — `{ error: "Invalid request body" }`     |
| Validation failure    | 400 — `{ errors: { field: ["message"] } }`    |
| PDF generation crash  | 500 — `{ error: "Failed to generate PDF" }`   |
| Body too large        | 413 — `{ error: "Request too large" }`        |

- All errors return JSON (never expose stack traces)
- PDF generation wrapped in try/catch
- No PII in error logs

---

## 7. Testing Strategy

| Test Type      | Scope                                            |
|----------------|--------------------------------------------------|
| Unit           | Zod schema validation (valid + invalid inputs)   |
| Unit           | Sanitization functions                           |
| Integration    | API route: valid input → PDF response            |
| Integration    | API route: invalid input → 400 response          |
| Manual         | Visual PDF inspection for layout correctness     |

---

## Status

- **What was completed:** Full PDF generation strategy, library selection, layout design, implementation architecture
- **What remains:** Nothing — Phase 0 is complete
- **Next concrete action:** Proceed to parallel execution (project init, UX, frontend, backend)
- **Status:** Completed
