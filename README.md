# Resume Generator

A stateless, privacy-focused web application that generates professional PDF resumes on demand. Fill in a form, click generate, and download your resume instantly. No data is stored anywhere.

## Features

- **Single-page form** with dynamic, repeatable sections
- **Instant PDF generation** powered by PDFKit (server-side)
- **Client + server validation** using a shared Zod schema
- **Zero data persistence** — no database, no cookies, no sessions, no files on disk
- **Input sanitization** to prevent injection attacks
- **Responsive design** — mobile-first with Tailwind CSS
- **Double-submission prevention** with loading states
- **Production-ready Docker image** via multi-stage build

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 16 (App Router)             |
| Language    | TypeScript (strict mode)            |
| Styling     | Tailwind CSS 4                      |
| Form        | React Hook Form + @hookform/resolvers |
| Validation  | Zod 4                               |
| PDF Engine  | PDFKit                              |
| Runtime     | Node.js 20+                         |

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t resume-generator .
docker run -p 3000:3000 resume-generator
```

## Project Structure

```
resume-generate/
├── app/
│   ├── layout.tsx                  # Root layout with metadata
│   ├── page.tsx                    # Main page — renders the form
│   ├── globals.css                 # Tailwind CSS import
│   └── api/
│       └── generate/
│           └── route.ts            # POST endpoint — validates + generates PDF
├── components/
│   ├── ResumeForm.tsx              # Form orchestrator (client component)
│   ├── PersonalInfoSection.tsx     # First name, last name, nickname, email, phone
│   ├── LinksSection.tsx            # Dynamic professional links (add/remove)
│   ├── SummarySection.tsx          # Career summary textarea
│   ├── ExperienceSection.tsx       # Dynamic work experience entries
│   ├── SkillsSection.tsx           # Dynamic skills list
│   └── CertificatesSection.tsx     # Dynamic certificate entries
├── lib/
│   ├── schema.ts                   # Zod validation schema (shared client + server)
│   ├── sanitize.ts                 # Input sanitization utilities
│   └── pdf-generator.ts            # PDFKit resume renderer
├── docs/                           # Architecture & status documents
├── Dockerfile                      # Multi-stage production build
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

## Resume Form Fields

### Required

| Field     | Max Length |
|-----------|-----------|
| First Name | 100 chars |
| Last Name  | 100 chars |
| Email      | 254 chars |
| Phone      | 30 chars  |
| Summary    | 2,000 chars |

### Optional / Dynamic

| Section       | Max Entries | Fields per Entry                          |
|---------------|-------------|-------------------------------------------|
| Nickname      | —           | Single text field (50 chars)              |
| Links         | 10          | Type (git/portfolio/linkedin/other) + URL |
| Experience    | 20          | Company, Position, Duration, Description  |
| Skills        | 50          | Skill name                                |
| Certificates  | 20          | Name, Issuer, Year (optional)             |

## API Reference

### `POST /api/generate`

Generates a PDF resume from the submitted form data.

**Request**

```
Content-Type: application/json
```

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "nickname": "",
  "email": "john@example.com",
  "phone": "+1 555-123-4567",
  "links": [
    { "type": "linkedin", "url": "https://linkedin.com/in/johndoe" }
  ],
  "summary": "Experienced software engineer...",
  "experience": [
    {
      "company": "Acme Corp",
      "position": "Senior Engineer",
      "duration": "Jan 2020 - Present",
      "description": "Led development of..."
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

| Status | Description                  | Content-Type       |
|--------|------------------------------|--------------------|
| 200    | PDF file                     | application/pdf    |
| 400    | Validation error (JSON body) | application/json   |
| 413    | Request body too large       | application/json   |
| 500    | PDF generation failed        | application/json   |

## PDF Output

- **Page size:** A4 (595 x 842 points)
- **Margins:** 50pt all sides
- **Font:** Helvetica (built-in, no custom fonts required)
- **Layout:** Name header, contact info, links, then sections for Summary, Experience, Skills, and Certificates
- **Multi-page:** Automatic page breaks with orphan prevention

## Security

- All user input validated with Zod on both client and server
- Control characters stripped from all string fields
- Max field lengths enforced at the schema level
- Request body limited to 512KB
- No personal data logged
- No data written to disk — PDF generated in-memory and streamed
- `X-Content-Type-Options: nosniff` and `Cache-Control: no-store` headers on PDF responses
- Non-root user in Docker container

## Architecture Documentation

Detailed architecture documents are available in the `docs/` directory:

- `docs/architecture/OVERVIEW.md` — System architecture, tech decisions, validation strategy
- `docs/architecture/PDF_STRATEGY.md` — PDF library selection, layout design, implementation patterns
- `docs/ux/STATUS.md` — UX design spec, wireframes, interaction states

## Scripts

| Command         | Description                    |
|-----------------|--------------------------------|
| `npm run dev`   | Start development server       |
| `npm run build` | Create production build        |
| `npm start`     | Start production server        |
| `npm run lint`  | Run ESLint                     |

## License

ISC
