# Resume Generator

A stateless, privacy-focused web application that generates a professional PDF resume on demand — fill in the form, click generate, download your resume instantly. No data is ever stored.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## Overview

Resume Generator is a single-page application built with Next.js 16 (App Router). The user fills in a structured form, submits it, and the server validates the payload, generates a PDF in memory using PDFKit, and streams it back as a file download. There is no database, no session state, no file system writes, and no analytics of any kind.

---

## Features

- Single-page form with dynamic, repeatable sections (experience, education, links, skills, certificates)
- Instant PDF generation server-side using PDFKit — A4 layout with photo support
- Shared Zod 4 schema for client-side and server-side validation
- Input sanitization — control characters stripped from all string fields
- Zero data persistence — no database, no cookies, no sessions, no disk writes
- Responsive, mobile-first UI built with Tailwind CSS 4
- Double-submission prevention with loading states
- Production-ready Docker image via three-stage build

---

## Tech Stack

| Layer         | Technology                                |
|---------------|-------------------------------------------|
| Framework     | Next.js 16 (App Router)                   |
| Language      | TypeScript 5.9 (strict mode)              |
| Styling       | Tailwind CSS 4                            |
| Form Library  | React Hook Form 7 + @hookform/resolvers   |
| Validation    | Zod 4 (shared client + server)            |
| PDF Engine    | PDFKit 0.17                               |
| Runtime       | Node.js 20+                               |

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm

### Installation

```bash
git clone <repository-url>
cd resume-generate
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The development server includes hot reload.

### Production Build

```bash
npm run build
npm start
```

### Scripts

| Command           | Description                  |
|-------------------|------------------------------|
| `npm run dev`     | Start development server     |
| `npm run build`   | Create production build      |
| `npm start`       | Start production server      |
| `npm run lint`    | Run ESLint                   |

---

## Docker

The Dockerfile uses a three-stage build targeting Node.js 20 Alpine to produce a minimal, secure production image.

| Stage      | Base              | Purpose                                          |
|------------|-------------------|--------------------------------------------------|
| `deps`     | node:20-alpine    | Install production dependencies only            |
| `builder`  | node:20-alpine    | Full install + `npm run build` (standalone output)|
| `runner`   | node:20-alpine    | Copy standalone output, run as non-root `nextjs` |

The runner stage copies only the `.next/standalone` output and static assets, so the final image contains no source files or dev dependencies.

```bash
docker build -t resume-generator .
docker run -p 3000:3000 resume-generator
```

The container runs on port 3000 as a non-root system user (`nextjs`, UID 1001).

---

## Project Structure

```
resume-generate/
├── app/
│   ├── layout.tsx                  # Root layout with metadata
│   ├── page.tsx                    # Main page — renders the form
│   ├── globals.css                 # Tailwind CSS import
│   └── api/
│       └── generate/
│           └── route.ts            # POST /api/generate — validates + generates PDF
├── components/
│   ├── ResumeForm.tsx              # Form orchestrator (client component)
│   ├── PersonalInfoSection.tsx     # Name, nickname, email, phone, photo
│   ├── LinksSection.tsx            # Dynamic professional links (add/remove)
│   ├── SummarySection.tsx          # Professional summary textarea
│   ├── ExperienceSection.tsx       # Dynamic work experience with nested projects
│   ├── EducationSection.tsx        # Dynamic education entries
│   ├── SkillsSection.tsx           # Dynamic skills list
│   └── CertificatesSection.tsx     # Dynamic certificate entries
├── lib/
│   ├── schema.ts                   # Zod validation schema (shared client + server)
│   ├── sanitize.ts                 # Input sanitization utilities
│   └── pdf-generator.ts            # PDFKit resume renderer
├── docs/
│   └── architecture/
│       ├── OVERVIEW.md             # System architecture and tech decisions
│       └── PDF_STRATEGY.md         # PDF library selection and layout design
├── Dockerfile                      # Multi-stage production build
├── next.config.ts                  # Standalone output + serverExternalPackages
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

---

## Form Fields

### Personal Information

| Field         | Required | Notes                                              |
|---------------|----------|----------------------------------------------------|
| First Name    | Yes      |                                                    |
| Last Name     | Yes      |                                                    |
| Nickname      | No       | Displayed in parentheses next to full name in PDF  |
| Email         | Yes      |                                                    |
| Phone         | Yes      |                                                    |
| Profile Photo | No       | JPEG, PNG, or WebP; max 2 MB; rendered at 110 × 110 pt in PDF top-right corner |

### Professional Links (dynamic, max 10)

| Field | Required | Notes                                     |
|-------|----------|-------------------------------------------|
| Type  | Yes      | One of: `git`, `portfolio`, `linkedin`, `other` |
| URL   | Yes      |                                           |

### Professional Summary

| Field   | Required | Max Length |
|---------|----------|------------|
| Summary | Yes      | 2,000 chars |

Rendered in the PDF with a paragraph indent.

### Work Experience (dynamic, max 20 entries)

| Field       | Required | Max Length  |
|-------------|----------|-------------|
| Company     | Yes      |             |
| Position    | Yes      |             |
| Duration    | Yes      |             |
| Description | Yes      | 1,000 chars |

Each experience entry supports nested **Projects** (dynamic, max 10 per entry):

| Field                    | Required | Max Length  |
|--------------------------|----------|-------------|
| Project Name             | Yes      |             |
| Details / Technologies   | No       | 2,000 chars |

### Education (dynamic, max 10 entries)

| Field                  | Required | Max Length  |
|------------------------|----------|-------------|
| Institution            | Yes      |             |
| Degree                 | Yes      |             |
| Field of Study         | No       |             |
| Duration               | Yes      |             |
| Description / Activities | No     | 1,000 chars |

### Skills (dynamic, max 50)

Free-text entries rendered as a bullet-separated list in the PDF.

### Certificates (dynamic, max 20 entries)

| Field            | Required | Notes              |
|------------------|----------|--------------------|
| Certificate Name | Yes      |                    |
| Issuer           | Yes      |                    |
| Year             | No       | Free text (e.g. 2024) |

---

## API Reference

### `POST /api/generate`

Accepts a JSON payload representing a complete resume, validates it, generates a PDF in memory, and streams it as a file download.

**Request**

```
Content-Type: application/json
```

Maximum request body size: 2 MB.

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "nickname": "JS",
  "email": "jane@example.com",
  "phone": "+1 555-000-1234",
  "photo": "<base64-encoded-image-optional>",
  "links": [
    { "type": "linkedin", "url": "https://linkedin.com/in/janesmith" },
    { "type": "git",      "url": "https://github.com/janesmith" }
  ],
  "summary": "Experienced software engineer specialising in...",
  "experience": [
    {
      "company": "Acme Corp",
      "position": "Senior Engineer",
      "duration": "Jan 2021 – Present",
      "description": "Led development of...",
      "projects": [
        {
          "name": "Payments Platform",
          "details": "Node.js, PostgreSQL, Stripe API"
        }
      ]
    }
  ],
  "education": [
    {
      "institution": "State University",
      "degree": "B.Sc.",
      "fieldOfStudy": "Computer Science",
      "duration": "2016 – 2020",
      "description": "Dean's List, ACM Club"
    }
  ],
  "skills": [
    { "value": "TypeScript" },
    { "value": "React" }
  ],
  "certificates": [
    { "name": "AWS Solutions Architect", "issuer": "Amazon", "year": "2023" }
  ]
}
```

**Responses**

| Status | Content-Type       | Description                                                |
|--------|--------------------|------------------------------------------------------------|
| 200    | `application/pdf`  | PDF file; `Content-Disposition: attachment; filename="resume.pdf"` |
| 400    | `application/json` | Zod validation error with field-level detail               |
| 500    | `application/json` | PDF generation failed                                      |

---

## PDF Layout

Page size: A4 (595 × 842 pt). Margins: 50 pt all sides. Font: Helvetica (built-in).

```
┌──────────────────────────────────────┬──────────┐
│  FULL NAME (Nickname)                │  [photo] │
│  email | phone                       │  110×110 │
│  Git: url | Portfolio: url           │          │
├──────────────────────────────────────┴──────────┤
│  PROFESSIONAL SUMMARY                           │
│  ─────────────────────────────────────────────  │
│      Indented summary paragraph...              │
├─────────────────────────────────────────────────┤
│  WORK EXPERIENCE                                │
│  ─────────────────────────────────────────────  │
│  Company Name                      Duration     │
│  Position (italic)                              │
│  Description...                                 │
│  Projects:                                      │
│    • Project Name                               │
│      Detail / technologies...                   │
├─────────────────────────────────────────────────┤
│  EDUCATION                                      │
│  ─────────────────────────────────────────────  │
│  Institution                       Duration     │
│  Degree — Field of Study (italic)               │
│  Activities description...                      │
├─────────────────────────────────────────────────┤
│  SKILLS                                         │
│  ─────────────────────────────────────────────  │
│  Skill1 • Skill2 • Skill3 • ...                 │
├─────────────────────────────────────────────────┤
│  CERTIFICATES                                   │
│  ─────────────────────────────────────────────  │
│  Certificate — Issuer (Year)                    │
└─────────────────────────────────────────────────┘
```

Automatic page breaks are inserted between sections with orphan prevention to avoid a section heading appearing at the bottom of a page without content below it.

---

## Architecture

### Standalone Output

`next.config.ts` sets `output: "standalone"`. The build emits a self-contained `server.js` with only the files needed at runtime, which is what the Docker `runner` stage copies.

### PDFKit as a Server-Only Package

PDFKit is declared in `serverExternalPackages` in `next.config.ts`. This prevents Next.js from bundling it into the client bundle and ensures it is resolved at runtime on the server only.

```ts
// next.config.ts
const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdfkit"],
};
```

### Dynamic Form Sections

All dynamic (repeatable) sections — links, experience, education, skills, and certificates — are managed with `useFieldArray` from React Hook Form. The nested projects sub-section within each experience entry uses a second, nested `useFieldArray` keyed to the parent entry's index.

### Photo Handling

The profile photo is read client-side using the FileReader API and converted to a base64-encoded data URI. This string is included in the JSON payload sent to `/api/generate`. The server decodes it back to a `Buffer` and passes it to PDFKit for embedding. The photo is never written to disk at any point.

### Validation Strategy

A single Zod schema defined in `lib/schema.ts` is imported by both the client (React Hook Form resolver) and the server (API route handler). This eliminates schema drift and ensures the same rules are enforced at both layers. Field-level length limits double as DoS mitigations.

### Validation Limits

| Section          | Max entries |
|------------------|-------------|
| Links            | 10          |
| Work Experience  | 20          |
| Projects per exp.| 10          |
| Education        | 10          |
| Skills           | 50          |
| Certificates     | 20          |
| Request body     | 2 MB        |

---

## Security & Privacy

| Concern              | Mitigation                                                              |
|----------------------|-------------------------------------------------------------------------|
| Data persistence     | No database, no session, no disk writes — zero storage                  |
| Input validation     | Zod schema enforced on client and server independently                  |
| Input sanitization   | Control characters stripped from all string fields in `lib/sanitize.ts` |
| PDF generation       | Generated in memory; streamed directly to response; never saved to disk |
| Request size         | Body limited to 2 MB to prevent DoS via large payloads                  |
| Logging              | No personal data written to logs                                        |
| Cookies / sessions   | None used                                                               |
| Analytics            | None                                                                    |
| Container security   | Docker container runs as non-root system user `nextjs` (UID 1001)       |

---

## Architecture Documentation

Extended design documentation is available in the `docs/` directory:

- `docs/architecture/OVERVIEW.md` — System architecture, tech decisions, validation strategy
- `docs/architecture/PDF_STRATEGY.md` — PDF library selection, layout design, implementation patterns

---

## License

MIT
