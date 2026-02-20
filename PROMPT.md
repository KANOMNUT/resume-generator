# PROMPT.md — Resume Generator System

## Agents Available (Parallel Execution Enabled)
- UX/UI Designer
- Frontend Engineer
- Backend Engineer
- DevOps Engineer
- Solution Architect (you)
- Tech Lead

---

## Project Context

This project is a **Resume Generator System** that:

- Allows users to fill in resume information
- Generates a downloadable PDF file
- Does NOT store any data
- Runs entirely without a database
- Focuses on simplicity, privacy, and performance

The system must:
- Be stateless
- Not persist user data
- Generate the PDF on demand
- Be secure and reliable

---

## Core Functional Requirements

### Resume Form

The application must collect:

### Personal Information
- First Name (required)
- Last Name (required)
- Nickname (optional)
- Email (required)
- Phone Number (required)

### Professional Links (Multiple Entries, Optional)
- Git Repository
- Portfolio
- LinkedIn
- Other custom link
- Must support dynamic add/remove fields

### Career Summary
- Short professional summary (required)

### Work Experience (Multiple Entries)
- Company name
- Position
- Duration
- Description

### Skills
- Multiple entries
- Free text list

### Certificates (Optional, Multiple Entries)
- Certificate name
- Issuer
- Year (optional)

---

## PDF Generation Requirements

- Generate PDF on button click
- No database
- No persistent storage
- PDF generated dynamically on server
- Stream file directly to user
- File must not be stored on disk
- Return proper download headers

---

## Mandatory Technical Constraints

1. Framework: **Next.js (App Router)**
2. Language: **TypeScript**
3. Styling: **Tailwind CSS only**
4. No database usage
5. No persistent storage
6. No external PDF SaaS services
7. PDF must be generated server-side

---

## Architecture Principles

- Stateless architecture
- No session storage
- No cookies storing resume data
- All form data submitted in single request
- PDF generated in API route or server action
- Stream response as `application/pdf`
- No logging of personal data

---

## Parallel Execution Rules

- Agents may work in parallel
- No agent may change architecture without Solution Architect approval
- Shared artifacts become read-only after approval
- Tech Lead resolves conflicts

---

## Continuation & Token Recovery Rules (MANDATORY)

- Agents must assume interruptions
- All significant outputs must be written to files
- Chat history is NOT a source of truth

Each output must include:
- What was completed
- What remains
- Next concrete action
- Status: Completed / In progress / Blocked

---

# Phase 0 — Architecture Definition (Blocking Phase)

Only the Solution Architect works in this phase.

Must define:
- Form state management approach
- Validation strategy
- PDF rendering strategy (library decision)
- API route design
- Download response flow
- Security considerations

Outputs:
- `/docs/architecture/OVERVIEW.md`
- `/docs/architecture/PDF_STRATEGY.md`

Phase 0 outputs are authoritative and read-only.

---

# Parallel Execution Plan (After Phase 0)

---

## UX/UI Designer

Tasks:
- Design clean resume form layout
- Design dynamic repeatable sections
- Define validation feedback UX
- Define loading state during PDF generation
- Define disabled state during processing

Output:
- UX flow
- Wireframe description
- Page structure

Status section required.

---

## Frontend Engineer

Depends on: Phase 0

Tasks:
- Implement App Router structure
- Build reusable form components
- Implement dynamic add/remove sections
- Implement client-side validation
- Connect form to backend PDF endpoint
- Handle loading and file download flow
- Prevent double submission

Output:
- Folder structure
- Component tree
- Form implementation

Status section required.

---

## Backend Engineer (Includes PDF Generation)

Depends on: Phase 0

Tasks:
- Implement server-side validation
- Implement PDF generation logic
- Select and integrate PDF library
- Format resume layout in PDF
- Handle multi-page rendering
- Stream PDF as response
- Set proper headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment`
- Ensure no file is stored
- Ensure no personal data is logged

Output:
- `/app/api/generate/route.ts`
- `/lib/pdf-generator.ts`
- Validation module

Status section required.

---

## DevOps Engineer

Tasks:
- Create production-grade Dockerfile
- Ensure build supports PDF library dependencies
- Ensure no debug logging in production
- Validate memory usage for PDF generation

Status section required.

---

## Tech Lead

Tasks:
- Ensure frontend and PDF layout consistency
- Ensure no persistence introduced
- Review performance and memory impact
- Approve merge readiness

Status section required.

---

# Security & Privacy Rules

- Never store resume data
- Never log personal information
- Sanitize user input before rendering to PDF
- Validate maximum input length
- Prevent injection attacks
- Handle malformed requests safely

---

# Required MVP Features

- Resume form
- Dynamic sections
- Client-side validation
- Server-side validation
- Generate PDF button
- Immediate file download
- Stateless architecture

---

# Definition of Done

- PDF downloads successfully
- No data persistence anywhere
- All required fields validated
- Optional fields handled properly
- Multi-entry sections function correctly
- Proper HTTP headers set
- No memory leaks
- Fully resumable after interruption

---

# Checkpoint & Resume Protocol (MANDATORY)

Each agent must maintain a checkpoint file:

- `/docs/ux/STATUS.md`
- `/docs/frontend/STATUS.md`
- `/docs/backend/STATUS.md`
- `/docs/devops/STATUS.md`
- `/docs/tech-lead/STATUS.md`

On resume:
1. Read PROMPT.md
2. Read RECOVERY.md
3. Read your STATUS.md
4. Resume from Next Concrete Action

---

# Final Instruction

Build a secure, stateless, production-ready Resume Generator system.

Optimize for:
- Simplicity
- Privacy
- Performance
- Clean architecture
- Resume-safe multi-agent execution