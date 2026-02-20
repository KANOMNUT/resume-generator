# Architecture Overview — Resume Generator System

> Phase 0 Output | Authoritative & Read-Only after approval

---

## 1. System Summary

A stateless, single-page web application that collects resume data via a form and generates a downloadable PDF on demand. No data is persisted. No database. No cookies. No sessions.

---

## 2. Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Framework    | Next.js 15 (App Router)        |
| Language     | TypeScript                     |
| Styling      | Tailwind CSS                   |
| Form Library | React Hook Form                |
| Validation   | Zod (shared client + server)   |
| PDF Engine   | PDFKit                         |
| Runtime      | Node.js 20+                    |

---

## 3. Application Structure

```
resume-generate/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main page — renders ResumeForm
│   └── api/
│       └── generate/
│           └── route.ts        # POST endpoint — validates + generates PDF
├── components/
│   ├── ResumeForm.tsx          # Top-level form orchestrator
│   ├── PersonalInfoSection.tsx # First/Last/Nickname/Email/Phone
│   ├── LinksSection.tsx        # Dynamic professional links
│   ├── SummarySection.tsx      # Career summary textarea
│   ├── ExperienceSection.tsx   # Dynamic work experience entries
│   ├── SkillsSection.tsx       # Dynamic skills list
│   ├── CertificatesSection.tsx # Dynamic certificates entries
│   └── ui/                     # Shared UI primitives (Button, Input, etc.)
├── lib/
│   ├── schema.ts               # Zod validation schema (shared)
│   ├── pdf-generator.ts        # PDFKit resume renderer
│   └── sanitize.ts             # Input sanitization utilities
├── types/
│   └── resume.ts               # TypeScript types (inferred from Zod)
├── docs/                       # Architecture & status documents
├── public/
│   └── fonts/                  # Custom fonts for PDF rendering
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Form State Management

**Library:** React Hook Form

**Rationale:**
- Minimal re-renders (uncontrolled inputs by default)
- Built-in `useFieldArray` for dynamic sections (links, experience, skills, certificates)
- Native Zod integration via `@hookform/resolvers`
- Zero external state management needed (no Redux, Zustand, Context)

**Approach:**
- Single `useForm<ResumeData>()` at the top-level `ResumeForm` component
- `register` and `control` passed down to section components via props
- `useFieldArray` used in each dynamic section
- `handleSubmit` triggers POST to `/api/generate`

---

## 5. Validation Strategy

**Library:** Zod

**Shared Schema:** `lib/schema.ts` defines the single source of truth for validation.

### Client-Side
- React Hook Form + `zodResolver(resumeSchema)`
- Inline validation errors displayed per field
- Validation runs on blur and on submit

### Server-Side
- Same `resumeSchema.safeParse(body)` in the API route
- Returns 400 with structured error messages on failure
- Never trusts client-side validation alone

### Validation Rules
| Field             | Rule                                      |
|-------------------|-------------------------------------------|
| firstName         | Required, max 100 chars, trimmed          |
| lastName          | Required, max 100 chars, trimmed          |
| nickname          | Optional, max 50 chars                    |
| email             | Required, valid email format, max 254     |
| phone             | Required, max 30 chars                    |
| links[]           | Optional array, each: type + valid URL    |
| summary           | Required, max 2000 chars                  |
| experience[]      | Min 0, each: company, position, duration, description (max 1000 chars each) |
| skills[]          | Min 0, each: max 100 chars               |
| certificates[]    | Optional, each: name, issuer, optional year |

### Max Limits (DoS Prevention)
- Max 10 links
- Max 20 experience entries
- Max 50 skills
- Max 20 certificates
- Total request body: max 500KB

---

## 6. API Route Design

### Endpoint

```
POST /api/generate
Content-Type: application/json
```

### Request Body
```typescript
{
  firstName: string;
  lastName: string;
  nickname?: string;
  email: string;
  phone: string;
  links?: { type: string; url: string }[];
  summary: string;
  experience?: { company: string; position: string; duration: string; description: string }[];
  skills?: string[];
  certificates?: { name: string; issuer: string; year?: string }[];
}
```

### Response (Success)
```
HTTP 200
Content-Type: application/pdf
Content-Disposition: attachment; filename="resume.pdf"
```
Body: Raw PDF binary stream

### Response (Validation Error)
```
HTTP 400
Content-Type: application/json
{ "errors": { "fieldName": ["error message"] } }
```

### Response (Server Error)
```
HTTP 500
Content-Type: application/json
{ "error": "Failed to generate PDF" }
```

### Flow
1. Parse JSON body
2. Validate with Zod schema
3. Sanitize all string fields (strip control chars, trim)
4. Pass sanitized data to `generateResumePDF(data)`
5. Return PDF buffer with proper headers

---

## 7. Download Response Flow

```
[User fills form]
    → [Client validates with Zod]
    → [Submit button triggers POST /api/generate]
    → [Show loading spinner, disable button]
    → [Server validates + sanitizes]
    → [PDFKit generates PDF buffer in memory]
    → [Response streamed with Content-Disposition: attachment]
    → [Browser triggers download dialog]
    → [Hide spinner, re-enable button]
```

**Client-side download handling:**
- Use `fetch()` to POST form data as JSON
- On success: create a Blob from the response, create an object URL, trigger download via a hidden `<a>` element
- On error: display error message from response body
- On network failure: display generic error

---

## 8. Security Considerations

### Input Sanitization
- Trim all strings
- Strip control characters (U+0000–U+001F except newlines in description fields)
- Enforce max length on every field
- Reject unexpected fields (Zod strict mode)

### PDF Injection Prevention
- PDFKit renders text programmatically — no HTML/CSS parsing, no injection vector
- All user text passed through sanitization before rendering

### Request Protection
- Max body size enforced (500KB)
- Rate limiting recommended in production (not in MVP scope, but Dockerfile-ready)
- No CORS for same-origin (default Next.js behavior)

### Privacy
- No logging of request bodies or PII
- No cookies, sessions, or storage
- PDF generated in memory and streamed — never written to disk
- No analytics or tracking of form data

---

## 9. Performance Considerations

- PDFKit is lightweight (~2MB) with no native binary dependencies
- PDF generation for a typical resume: <100ms
- Memory usage per request: ~5–15MB (buffer freed after response)
- No concurrent request state — fully stateless
- Next.js API routes handle concurrent requests via Node.js event loop

---

## Status

- **What was completed:** Full architecture definition
- **What remains:** Phase 0 peer document (PDF_STRATEGY.md)
- **Next concrete action:** Write PDF_STRATEGY.md
- **Status:** Completed
