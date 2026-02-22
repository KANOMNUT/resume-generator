# Frontend Status

## What was completed
- App Router structure: layout.tsx, page.tsx
- ResumeForm orchestrator with React Hook Form + Zod resolver
- PersonalInfoSection: responsive grid, all fields with validation, profile photo upload
- LinksSection: dynamic add/remove with useFieldArray, type select + URL input
  - "GitHub" label renamed to "Git Repo"
  - Custom label input shown when type is "Other"
- SummarySection: textarea with character limit
- ExperienceSection: dynamic cards with company, position, description, nested projects
  - Duration replaced with Start Month/Year + End Month/Year dropdowns
  - "Currently work here" checkbox disables end date and shows "Present" in PDF
- EducationSection: dynamic cards with institution, degree, field of study, description, and structured year fields:
  - `startYear` — required year dropdown (current year – 1960)
  - `endYear` — optional year dropdown (current year – 1960); disabled when isCurrent is checked
  - `isCurrent` — boolean checkbox "Currently studying here"; disables and clears End Year when checked
- LanguagesSection: dynamic add/remove with language text input + proficiency level dropdown (Native/Fluent/Advanced/Intermediate/Basic)
- SkillsSection: dynamic list with useFieldArray (object-based: { value: string })
- CertificatesSection: dynamic cards with name, issuer, optional year
- Loading spinner + disabled state during PDF generation
- Error banner for failed submissions
- Download flow: fetch → blob → object URL → auto-download
- Double submission prevention via isGenerating flag

## What remains
- Nothing — frontend complete

## Next concrete action
- None (ready for Tech Lead review)

## Status: Completed
