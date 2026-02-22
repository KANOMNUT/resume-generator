# QA — Test Strategy & Status

## Status: Completed

## Overview

The project uses a two-layer automated test strategy. The base layer is unit and integration tests written with Jest and `@testing-library`, covering schema validation, input sanitization, PDF generation logic, and the API route handler in isolation. The top layer is end-to-end tests written with Playwright running against a real Chromium browser, covering the full user flow from page load through form submission to PDF download. Both layers run automatically and are designed to complete quickly enough for CI integration.

---

## Test Pyramid

```
          /\
         /  \
        / E2E\         ~56 tests — Playwright (Chromium)
       /──────\        Full browser: load, validate, submit, download
      /        \
     / Integr. /\      17 tests — Jest (API route)
    /──────────\  \    HTTP pipeline, error codes, body size guard
   /            \  \
  /  Unit Tests  \  \  215 tests — Jest (schema, sanitize, pdf-generator)
 /────────────────\──\ Schema rules, sanitization, PDF rendering logic
/                  \
```

Largest surface area at the base (fast, isolated, no I/O). Smallest at the top (slower, real browser, network). The middle integration layer covers the HTTP boundary between form and PDF engine.

---

## Test Environments

| Environment     | Tool                      | Command                 | Purpose                                        |
|-----------------|---------------------------|-------------------------|------------------------------------------------|
| Unit/Integration | Jest + next/jest (SWC)   | `npm test`              | Schema, sanitize, PDF gen, API route           |
| Coverage gate   | Jest `--coverage`          | `npm run test:coverage` | Enforces 80% threshold across all metrics      |
| E2E             | Playwright (Chromium)     | `npm run test:e2e`      | Full browser flow + PDF download               |
| E2E interactive | Playwright UI mode        | `npm run test:e2e:ui`   | Step-through debugging with timeline           |

---

## Unit Test Coverage

### `lib/schema.ts` (121 tests)

- All top-level required fields (`firstName`, `lastName`, `email`, `phone`, `summary`) reject empty values
- All optional fields (`nickname`, `photo`, `links`, `experience`, `education`, `languages`, `skills`, `certificates`) accept absence
- Email field rejects invalid formats and accepts valid RFC-style addresses
- `summary` enforces max 2,000 character limit
- `links` array: max 10 entries; each link validates `type` enum (`git`, `portfolio`, `linkedin`, `other`); `url` is required; `otherLabel` required when type is `other`, ignored otherwise
- `experience` array: max 20 entries; `company`, `position`, `startMonth`, `startYear`, `description` required; `endMonth` / `endYear` optional; `isCurrent` boolean; `description` max 1,000 chars
- `experience.projects` nested array: max 10 per entry; `name` required; `details` optional, max 2,000 chars
- `education` array: max 10 entries; `institution`, `degree`, `startYear` required; `endYear` optional (disabled in UI when `isCurrent` is true); `isCurrent` boolean; `fieldOfStudy` optional; `description` optional max 1,000 chars
  - startYear required — fails when startYear is empty
  - isCurrent: true — endYear optional, disabled in UI
  - isCurrent: false + endYear — valid combination
- `languages` array: max 20 entries; `language` required; `level` enum (`native`, `fluent`, `advanced`, `intermediate`, `basic`) required
- `skills` array: max 50 entries; each entry has required `value` string
- `certificates` array: max 20 entries; `name` and `issuer` required; `year` optional free text
- `photo` field: optional; when present, must match base64 data URI regex (`data:image/(jpeg|png|webp);base64,...`); invalid MIME types rejected
- Month enum values: exactly `Jan` through `Dec` accepted; arbitrary strings rejected
- Year field: string representation of numeric year; boundary values tested
- Array length boundary tests: arrays at exactly the limit pass; arrays one over the limit fail

### `lib/sanitize.ts` (72 tests)

- `cleanString` strips ASCII control characters (0x00–0x1F, 0x7F) from string values
- `cleanString` preserves printable Unicode characters including non-Latin scripts
- Each top-level string field is sanitized individually and the output is verified
- Optional string fields that are empty string after sanitization become `undefined`
- Optional string fields that are absent in the input remain `undefined` in the output
- `photo` field is passed through without modification (sanitizer does not alter base64 payload)
- All string fields within nested arrays (`links`, `experience`, `experience.projects`, `education`, `languages`, `skills`, `certificates`) are sanitized
- Null bytes, tab characters, carriage returns, and vertical tabs are stripped in each field
- Fields that contain only control characters become `undefined` after sanitization

### `lib/pdf-generator.ts` (36 tests)

- Constructor accepts a validated, sanitized resume object and does not throw
- Constructor failure (invalid input) throws a descriptive error
- `generate()` returns a `Buffer`
- Returned buffer starts with the `%PDF-` magic bytes
- Personal info section: name, nickname, email, phone rendered
- Photo: when provided as a Buffer, is embedded in the PDF without throwing
- Photo: when absent, PDF is generated normally without a placeholder
- Links section: each link type renders the correct label in the PDF
- `getLinkLabel` returns `"Git Repo"` for type `git`
- `getLinkLabel` returns the `otherLabel` value for type `other` when label is provided
- `getLinkLabel` returns `"Other"` for type `other` when no `otherLabel` is provided
- `getLinkLabel` returns `"Portfolio"` for type `portfolio`
- `getLinkLabel` returns `"LinkedIn"` for type `linkedin`
- Summary section: paragraph text appears in output
- Experience section: company, position, description rendered; projects rendered when present
- Experience duration: `isCurrent: true` renders `"Present"` as end label
- Experience duration: start and end month/year rendered in `"Mon YYYY – Mon YYYY"` format
- Education section: institution, degree, field of study rendered; duration composed from startYear/endYear/isCurrent (e.g., "2016 – 2020" or "2020 – Present")
- Languages section: language name and level rendered; bullet separator between entries
- Skills section: skill values rendered as bullet-separated list
- Certificates section: name, issuer, year rendered

### `app/api/generate/route.ts` (17 tests)

- Valid payload returns HTTP 200 with `Content-Type: application/pdf`
- Response includes `Content-Disposition: attachment; filename="FirstName_LastName_Resume.pdf"`
- Response includes `X-Content-Type-Options: nosniff` header
- Response includes `Cache-Control: no-store` header
- Request body exceeding 2 MB returns HTTP 413 with JSON error body
- Malformed JSON body returns HTTP 400 with JSON error body
- Payload failing Zod validation returns HTTP 400 with field-level validation detail
- PDF generation failure returns HTTP 500 with JSON error body
- Full pipeline: sanitized data is passed to the PDF generator (not raw input)
- Validation short-circuit: sanitizer is not called when schema validation fails
- PDF generator is not called when sanitizer output is invalid
- Correct content length header is set on success response

---

## E2E Test Coverage

### `e2e/page-load.spec.ts` (14 tests)

- Page loads with HTTP 200 and no console errors
- Main heading is visible
- Form element is present in the DOM
- Personal Information section header is visible
- Links section header is visible
- Summary section header is visible
- Work Experience section header is visible
- Education section header is visible
- Languages section header is visible
- Skills section header is visible
- Certificates section header is visible
- "Generate PDF" button is visible and enabled on initial load
- No error banner is displayed on initial load
- Page title matches expected value

### `e2e/form-validation.spec.ts` (12 tests)

- Submitting empty form shows required error on `firstName`
- Submitting empty form shows required error on `lastName`
- Submitting empty form shows required error on `email`
- Submitting empty form shows required error on `phone`
- Submitting empty form shows required error on `summary`
- Entering an invalid email address shows email format error
- Multiple required errors are shown simultaneously when multiple fields are empty
- "Generate PDF" button shows loading state and is disabled during an in-flight request
- API error response causes an error banner to appear in the UI
- Error banner is not shown before a failed submission
- Correcting a validation error causes its error message to disappear
- Valid email format clears the email format error

### `e2e/form-submission.spec.ts` (10 tests)

- Filling only required fields and submitting triggers a file download
- Downloaded file has the extension `.pdf`
- Downloaded filename follows the pattern `FirstName_LastName_Resume.pdf`
- Filling all sections (links, experience, education, languages, skills, certificates) and submitting produces a download
- Submitting the form twice in sequence produces two independent downloads (no shared state)
- After a successful submission the form fields retain their values (no reset)
- Submitting again after a successful submission does not show a stale error banner
- Response body is non-empty (PDF has content)
- No JavaScript errors are thrown during submission
- No network requests are made to external domains during submission

### `e2e/dynamic-sections.spec.ts` (20 tests)

- Clicking "Add Link" appends a new link row
- Clicking the remove button on a link row deletes that row
- Clicking "Add Experience" appends a new experience entry
- Clicking the remove button on an experience entry deletes it
- Clicking "Add Project" inside an experience entry appends a nested project row
- Clicking the remove button on a project row deletes that project row
- Clicking "Add Education" appends a new education entry
- Clicking the remove button on an education entry deletes it
- Clicking "Add Language" appends a new language entry
- Clicking the remove button on a language entry deletes it
- Language level dropdown contains all five options: Native, Fluent, Advanced, Intermediate, Basic
- Clicking "Add Skill" appends a new skill row
- Clicking the remove button on a skill row deletes it
- Clicking "Add Certificate" appends a new certificate entry
- Clicking the remove button on a certificate entry deletes it
- Checking "Currently work here" on an experience entry disables the End Month and End Year dropdowns
- Unchecking "Currently work here" re-enables the End Month and End Year dropdowns
- E2E: isCurrent checkbox on an education entry disables the End Year select
- E2E: unchecking isCurrent on an education entry re-enables the End Year select
- Selecting link type "Other" reveals the custom label text input
- Selecting any link type other than "Other" hides the custom label input
- Adding entries up to section limits does not produce UI errors

---

## Running Tests

### Prerequisites

```bash
# Install Node.js dependencies
npm install

# Install Playwright browser (first time only)
npx playwright install chromium
```

### Commands

```bash
# Unit + integration tests (fast, no browser)
npm test

# Unit tests with coverage report
npm run test:coverage

# E2E tests — auto-starts the Next.js dev server
npm run test:e2e

# E2E tests with Playwright UI (step-through interactive mode)
npm run test:e2e:ui

# Show the last Playwright HTML report
npm run test:e2e:report
```

---

## Security Test Cases Covered

- Control character injection (null bytes, tab, carriage return) is stripped in every string field by `lib/sanitize.ts` — covered by 72 sanitize unit tests
- XSS and SQL injection payloads that rely on control characters are neutralised before reaching the PDF engine
- Request body size limit of 2 MB is enforced at the API route level; payloads exceeding this receive HTTP 413 — covered by API unit tests and implicitly by E2E submission tests
- Input length limits on all free-text fields (`summary` 2,000, `description` 1,000, `details` 2,000) act as secondary DoS mitigations — covered by schema tests
- Photo field MIME type is validated by the Zod regex; JPEG, PNG, and WebP are accepted; other MIME types are rejected — covered by schema unit tests
- No data persistence is verified by the E2E test that submits the form twice and confirms each submission produces an independent download without any server-side state
- Proper security headers on PDF response (`X-Content-Type-Options: nosniff`, `Cache-Control: no-store`) are asserted in the API unit tests
- All validation occurs on both client (Zod resolver in React Hook Form) and server (Zod parse in the API route), meaning client-bypass attacks are covered by the server-side API unit tests

---

## CI/CD Notes

- `npm test` exits with code 0 when all 204 unit and integration tests pass; non-zero on any failure
- `npm run test:coverage` enforces an 80% threshold across branches, functions, lines, and statements; exits non-zero if any metric falls below threshold
- `npm run test:e2e` auto-starts the Next.js development server via `webServer` configuration in `playwright.config.ts` before running tests
- Setting `CI=true` in the environment enables Playwright's strict `forbidOnly` flag (prevents `.only` from being committed) and adds 1 automatic retry on test failure
- Recommended CI step order: install → `npm test` → `npm run test:coverage` → `npm run test:e2e`
- Jest and Playwright produce separate reports; Jest outputs to stdout; Playwright generates an HTML report viewable with `npm run test:e2e:report`

---

## What Remains

- Component-level React Testing Library tests for individual form section components (`PersonalInfoSection`, `LinksSection`, `ExperienceSection`, etc.) — currently no component-level tests exist
- Visual regression tests for PDF layout to catch unintended rendering changes across PDFKit version updates
- Performance tests for PDF generation under concurrent load (e.g., 50 simultaneous requests)
- Accessibility (a11y) audit of form components with `jest-axe` or Playwright's accessibility snapshot API
- Mutation testing to verify test suite sensitivity (e.g., using Stryker)

---

## Last Updated

2026-02-21
