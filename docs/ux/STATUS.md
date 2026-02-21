# Resume Generator - UX Design Specification

## Project Overview

A single-page Next.js application that collects resume data through a structured form and generates a downloadable PDF. The application is stateless with no database persistence, optimized for quick resume creation and immediate download.

## Design Goals

1. **Clarity**: Users should understand exactly what information is needed at each step
2. **Efficiency**: Minimize friction between data entry and PDF generation
3. **Flexibility**: Support variable amounts of experience, skills, and credentials
4. **Reliability**: Provide clear feedback during all system states
5. **Accessibility**: WCAG 2.1 AA compliant for keyboard navigation and screen readers

---

## Form Layout Specification

### Overall Structure

```
┌─────────────────────────────────────────────────────┐
│  Browser Viewport (bg-gray-50)                      │
│  ┌───────────────────────────────────────────────┐  │
│  │ Main Container (max-w-3xl, mx-auto, py-8)     │  │
│  │                                               │  │
│  │ ┌───────────────────────────────────────────┐ │  │
│  │ │ Error Banner (if error exists)            │ │  │
│  │ └───────────────────────────────────────────┘ │  │
│  │                                               │  │
│  │ ┌───────────────────────────────────────────┐ │  │
│  │ │ Form Card (bg-white, rounded-lg, shadow)  │ │  │
│  │ │ Padding: p-8 (desktop), p-6 (mobile)      │ │  │
│  │ │                                           │ │  │
│  │ │ [H1] Resume Generator                     │ │  │
│  │ │ [Description text]                        │ │  │
│  │ │                                           │ │  │
│  │ │ ─────────────────────────────────────     │ │  │
│  │ │                                           │ │  │
│  │ │ [Section 1: Personal Information]        │ │  │
│  │ │ [Section 2: Professional Links]          │ │  │
│  │ │ [Section 3: Career Summary]              │ │  │
│  │ │ [Section 4: Work Experience]             │ │  │
│  │ │ [Section 5: Skills]                      │ │  │
│  │ │ [Section 6: Certificates]                │ │  │
│  │ │                                           │ │  │
│  │ │ ─────────────────────────────────────     │ │  │
│  │ │                                           │ │  │
│  │ │ [Generate PDF Button - Full Width]       │ │  │
│  │ │                                           │ │  │
│  │ └───────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Section Order and Purpose

1. **Personal Information** - Core identity data
2. **Professional Links** - Portfolio, LinkedIn, GitHub, etc.
3. **Career Summary** - Brief professional overview
4. **Work Experience** - Employment history with descriptions
5. **Skills** - Technical and professional competencies
6. **Certificates** - Credentials and certifications

---

## Detailed Component Specifications

### 1. Page Header

**Layout:**
```
┌─────────────────────────────────────┐
│  Resume Generator                   │  <- H1, text-3xl, font-bold, text-gray-900
│  Fill out the form below to create  │  <- p, text-gray-600, mt-2
│  your professional resume           │
└─────────────────────────────────────┘
```

**Spacing:**
- Bottom margin: mb-8
- Text hierarchy: H1 (30px/2rem), body (16px/1rem)

---

### 2. Error Banner

**Visibility:** Conditional - only shown when an error occurs during PDF generation

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [!] Error Message Text                        [X]  │
│  bg-red-50, border-l-4 border-red-500               │
│  text-red-800, p-4, rounded, mb-6                   │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Appears at top of form card
- Dismissible via X button
- Auto-scrolls to top when error occurs
- Example message: "Failed to generate PDF. Please try again."

**Accessibility:**
- `role="alert"`
- `aria-live="assertive"`
- Focus moves to close button when banner appears

---

### 3. Section: Personal Information

**Purpose:** Collect identifying information and contact details

**Field Layout - Desktop (md and above):**
```
┌─────────────────────────────────────────────────────┐
│  Personal Information               <- H2, text-xl  │
│  ─────────────────────────────────────────────      │
│                                                     │
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ Full Name*         │  │ Email*             │    │
│  │ [input........... ]│  │ [input........... ]│    │
│  └────────────────────┘  └────────────────────┘    │
│                                                     │
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ Phone Number       │  │ Location           │    │
│  │ [input........... ]│  │ [input........... ]│    │
│  └────────────────────┘  └────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Field Layout - Mobile (< md):**
- Single column, full width
- Same vertical order: Full Name, Email, Phone Number, Location

**Fields:**

| Field        | Type  | Required | Validation                      |
|--------------|-------|----------|---------------------------------|
| Full Name    | text  | Yes      | Min 2 characters                |
| Email        | email | Yes      | Valid email format              |
| Phone Number | tel   | No       | -                               |
| Location     | text  | No       | e.g., "San Francisco, CA"       |

**Spacing:**
- Gap between fields: gap-4 (16px)
- Section bottom margin: mb-8 (32px)

**Validation Display:**
```
┌────────────────────┐
│ Email*             │
│ [invalid-email]    │
│ Please enter a valid email address  <- text-red-600, text-sm, mt-1
└────────────────────┘
```

---

### 4. Section: Professional Links (Dynamic)

**Purpose:** Collect URLs to online profiles and portfolios

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Professional Links                 <- H2, text-xl  │
│  ─────────────────────────────────────────────      │
│                                                     │
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ Label              │  │ URL                │ [X]│
│  │ [input........... ]│  │ [input........... ]│    │
│  └────────────────────┘  └────────────────────┘    │
│                                                     │
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ Label              │  │ URL                │ [X]│
│  │ [input........... ]│  │ [input........... ]│    │
│  └────────────────────┘  └────────────────────┘    │
│                                                     │
│  [+ Add Link]               <- Secondary button    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Initial State:** 0 entries shown, only "Add Link" button visible

**Desktop Layout:**
- 2-column grid: Label (30%), URL (65%), Remove button (5%)
- Gap: gap-4 between columns

**Mobile Layout:**
- Single column
- Label field full width
- URL field full width below label
- Remove button aligned right, above the pair

**Add Button:**
- Style: `border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50`
- Icon: Plus icon (optional)
- Position: Left-aligned below all entries

**Remove Button:**
- Style: Small icon button, text-red-600
- Icon: X or trash icon
- Size: 24x24px touch target minimum
- Position: Right-aligned next to entry
- Accessibility: `aria-label="Remove link"`

**Behavior:**
- Clicking "Add Link" adds a new Label/URL pair
- Minimum entries: 0
- Maximum entries: No hard limit (reasonable: 10)
- Remove button removes specific entry

---

### 5. Section: Career Summary

**Purpose:** Collect a brief professional overview

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Career Summary                     <- H2, text-xl  │
│  ─────────────────────────────────────────────      │
│                                                     │
│  Brief professional summary (optional)              │
│  ┌─────────────────────────────────────────────┐   │
│  │ [textarea........................        ] │   │
│  │ [................................        ] │   │
│  │ [................................        ] │   │
│  └─────────────────────────────────────────────┘   │
│  0 / 500 characters          <- text-sm, text-gray-500
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Field Specification:**
- Type: `textarea`
- Rows: 4
- Max length: 500 characters
- Required: No
- Character counter updates on input

---

### 6. Section: Work Experience (Dynamic)

**Purpose:** Collect employment history with descriptions

**Layout (per entry):**
```
┌─────────────────────────────────────────────────────┐
│  Work Experience                    <- H2, text-xl  │
│  ─────────────────────────────────────────────      │
│                                                     │
│  Entry 1                       [Remove]  <- text-sm │
│  ┌───────────────────────────────────────────────┐ │
│  │ Job Title*                                    │ │
│  │ [input.............................         ] │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Company Name*                                 │ │
│  │ [input.............................         ] │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ Start Date*        │  │ End Date           │    │
│  │ [input........... ]│  │ [input........... ]│    │
│  └────────────────────┘  └────────────────────┘    │
│  [ ] Currently work here                           │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Description                                   │ │
│  │ [textarea........................          ] │ │
│  │ [................................          ] │ │
│  └───────────────────────────────────────────────┘ │
│  ─────────────────────────────────────────────      │
│                                                     │
│  Entry 2                       [Remove]             │
│  [... same structure ...]                          │
│                                                     │
│  [+ Add Work Experience]                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Initial State:** 0 entries, only "Add Work Experience" button visible

**Fields per Entry:**

| Field              | Type     | Required | Validation          |
|--------------------|----------|----------|---------------------|
| Job Title          | text     | Yes      | Min 2 characters    |
| Company Name       | text     | Yes      | Min 2 characters    |
| Start Date         | text     | Yes      | Format: MM/YYYY     |
| End Date           | text     | No       | Format: MM/YYYY     |
| Currently work here| checkbox | No       | -                   |
| Description        | textarea | No       | Max 1000 characters |

**Behavior:**
- When "Currently work here" is checked, End Date is disabled and cleared
- Entries separated by horizontal divider (border-t border-gray-200)
- Remove button appears as "Remove" text link in top-right of each entry
- Add button same style as Professional Links section

---

### 7. Section: Skills (Dynamic)

**Purpose:** Collect technical and professional skills

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Skills                             <- H2, text-xl  │
│  ─────────────────────────────────────────────      │
│                                                     │
│  ┌────────────────────────────────────────────┐ [X]│
│  │ Skill name                                 │    │
│  │ [input...............................     ]│    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  ┌────────────────────────────────────────────┐ [X]│
│  │ Skill name                                 │    │
│  │ [input...............................     ]│    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  [+ Add Skill]                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Initial State:** 0 entries, only "Add Skill" button visible

**Field per Entry:**
- Type: text
- Required: No (but if present, must not be empty)
- Placeholder: "e.g., JavaScript, Project Management"
- Layout: Single column, full width
- Remove button: Same pattern as Professional Links

**Behavior:**
- Each entry is a single text input
- Gap between entries: gap-3 (12px)
- Maximum recommended: 20 skills

---

### 8. Section: Certificates (Dynamic)

**Purpose:** Collect professional certifications and credentials

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Certificates                       <- H2, text-xl  │
│  ─────────────────────────────────────────────      │
│                                                     │
│  Entry 1                       [Remove]             │
│  ┌───────────────────────────────────────────────┐ │
│  │ Certificate Name                              │ │
│  │ [input.............................         ] │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ Issuing Organization│  │ Date Issued        │    │
│  │ [input........... ]│  │ [input........... ]│    │
│  └────────────────────┘  └────────────────────┘    │
│  ─────────────────────────────────────────────      │
│                                                     │
│  [+ Add Certificate]                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Initial State:** 0 entries, only "Add Certificate" button visible

**Fields per Entry:**

| Field                  | Type | Required | Validation       |
|------------------------|------|----------|------------------|
| Certificate Name       | text | No       | Min 2 if present |
| Issuing Organization   | text | No       | -                |
| Date Issued            | text | No       | Format: MM/YYYY  |

**Desktop Layout:**
- Certificate Name: Full width
- Issuing Organization and Date Issued: 2-column grid (50/50)

**Mobile Layout:**
- All fields stacked vertically, full width

---

### 9. Generate PDF Button

**Default State:**
```
┌─────────────────────────────────────────────────────┐
│                  Generate PDF                       │
│  bg-blue-600, text-white, py-3, rounded            │
│  hover:bg-blue-700, w-full, text-lg, font-semibold │
└─────────────────────────────────────────────────────┘
```

**Loading State:**
```
┌─────────────────────────────────────────────────────┐
│  [spinner icon] Generating...                      │
│  bg-blue-600, text-white, opacity-75, cursor-wait  │
│  disabled, w-full                                  │
└─────────────────────────────────────────────────────┘
```

**Specifications:**
- Height: 48px minimum (py-3)
- Font size: text-lg (18px)
- Margin top: mt-8 (32px) from last section
- Hover state: Darker blue background
- Focus state: Ring outline (ring-2 ring-offset-2 ring-blue-500)

**Behavior:**
1. On click, validate all required fields
2. If validation fails, show inline errors and prevent submission
3. If valid, transition to loading state
4. Disable all form inputs and buttons during generation
5. On success, browser download dialog appears automatically
6. Return button and form to normal state
7. On error, show error banner and return to normal state

**Accessibility:**
- `aria-label="Generate and download PDF resume"`
- `aria-busy="true"` during loading
- `disabled` attribute during loading

---

## Visual Design System

### Typography

| Element           | Font Size | Weight    | Color       | Line Height |
|-------------------|-----------|-----------|-------------|-------------|
| H1 (Page Title)   | text-3xl  | font-bold | text-gray-900 | leading-tight |
| H2 (Section)      | text-xl   | font-semibold | text-gray-900 | leading-normal |
| Body Text         | text-base | font-normal | text-gray-700 | leading-normal |
| Label             | text-sm   | font-medium | text-gray-700 | leading-normal |
| Helper Text       | text-sm   | font-normal | text-gray-500 | leading-normal |
| Error Text        | text-sm   | font-normal | text-red-600 | leading-normal |

### Color Palette

**Primary (Blue):**
- Primary: `bg-blue-600` (#2563EB)
- Hover: `bg-blue-700` (#1D4ED8)
- Focus ring: `ring-blue-500`

**Neutral:**
- Background: `bg-gray-50` (#F9FAFB)
- Card: `bg-white` (#FFFFFF)
- Border: `border-gray-300` (#D1D5DB)
- Text primary: `text-gray-900` (#111827)
- Text secondary: `text-gray-600` (#4B5563)
- Text helper: `text-gray-500` (#6B7280)

**Semantic:**
- Error background: `bg-red-50` (#FEF2F2)
- Error border: `border-red-500` (#EF4444)
- Error text: `text-red-600` (#DC2626)

### Spacing Scale

- xs: 4px (space-1)
- sm: 8px (space-2)
- md: 12px (space-3)
- base: 16px (space-4)
- lg: 24px (space-6)
- xl: 32px (space-8)
- 2xl: 48px (space-12)

### Border Radius

- Inputs: `rounded` (4px)
- Buttons: `rounded` (4px)
- Card: `rounded-lg` (8px)

### Shadows

- Card: `shadow` (0 1px 3px rgba(0,0,0,0.1))
- Button hover: None
- Focus: `ring-2 ring-offset-2`

---

## Input Field Specifications

### Text Input (Default)

```html
<div class="space-y-1">
  <label class="block text-sm font-medium text-gray-700">
    Label Text*
  </label>
  <input
    type="text"
    class="block w-full px-3 py-2 border border-gray-300 rounded
           focus:outline-none focus:ring-2 focus:ring-blue-500
           focus:border-transparent"
    placeholder="Placeholder text"
  />
</div>
```

**States:**
- Default: `border-gray-300`
- Focus: `ring-2 ring-blue-500 border-transparent`
- Error: `border-red-500`
- Disabled: `bg-gray-100 cursor-not-allowed opacity-60`

**Sizing:**
- Height: 40px (py-2 + border)
- Padding: px-3 py-2

### Text Input (Error State)

```html
<div class="space-y-1">
  <label class="block text-sm font-medium text-gray-700">
    Email*
  </label>
  <input
    type="email"
    class="block w-full px-3 py-2 border border-red-500 rounded
           focus:outline-none focus:ring-2 focus:ring-red-500"
    value="invalid"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <p id="email-error" class="text-sm text-red-600">
    Please enter a valid email address
  </p>
</div>
```

### Textarea

```html
<div class="space-y-1">
  <label class="block text-sm font-medium text-gray-700">
    Description
  </label>
  <textarea
    rows="4"
    class="block w-full px-3 py-2 border border-gray-300 rounded
           focus:outline-none focus:ring-2 focus:ring-blue-500
           focus:border-transparent resize-none"
    placeholder="Describe your responsibilities..."
  ></textarea>
</div>
```

**Behavior:**
- Resize: Disabled (`resize-none`)
- Min height: 4 rows
- Same focus/error states as text input

### Checkbox

```html
<div class="flex items-center space-x-2">
  <input
    type="checkbox"
    id="current"
    class="h-4 w-4 text-blue-600 border-gray-300 rounded
           focus:ring-2 focus:ring-blue-500"
  />
  <label for="current" class="text-sm text-gray-700">
    Currently work here
  </label>
</div>
```

**Touch Target:**
- Minimum: 24x24px clickable area (including label)
- Visual size: 16x16px

---

## Responsive Breakpoints

### Mobile (< 768px)

- Container padding: px-4 py-6
- Card padding: p-6
- All grids: Single column
- Button: Full width
- Font sizes: Same as desktop (legibility priority)

### Desktop (>= 768px)

- Container padding: px-6 py-8
- Card padding: p-8
- Two-column grids: Where specified
- Max width: `max-w-3xl` (768px)

### Responsive Grid Example

```css
/* Mobile first */
.field-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Desktop */
@media (min-width: 768px) {
  .field-grid {
    grid-template-columns: 1fr 1fr;
  }
}
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text on white: Minimum 4.5:1 ratio
- Large text (18px+): Minimum 3:1 ratio
- UI components: Minimum 3:1 ratio
- Error states: Must not rely on color alone

**Keyboard Navigation:**
- Tab order: Logical top-to-bottom, left-to-right
- Focus indicators: Visible 2px ring on all interactive elements
- Skip to content: Not needed (single page form)
- Escape key: Dismisses error banner

**Screen Reader Support:**

Required ARIA attributes:
- `aria-label` on icon-only buttons
- `aria-invalid="true"` on fields with errors
- `aria-describedby` linking errors to fields
- `aria-live="assertive"` on error banner
- `aria-busy="true"` during PDF generation
- `aria-required="true"` on required fields

**Form Labels:**
- All inputs must have associated `<label>` elements
- Labels linked via `for` attribute and matching `id`
- Required fields marked with asterisk (*) in label

**Touch Targets:**
- Minimum size: 44x44px for all interactive elements
- Spacing between targets: Minimum 8px

---

## State Management & Validation

### Validation Timing

1. **On Blur:** Validate individual field when user leaves it
2. **On Submit:** Validate entire form when Generate PDF is clicked
3. **Real-time (specific cases):**
   - Character counters (Career Summary)
   - Email format indication (optional enhancement)

### Validation Rules

**Required Field Validation:**
- Full Name: Not empty, min 2 characters
- Email: Not empty, valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Job Title (if experience added): Not empty
- Company Name (if experience added): Not empty
- Start Date (if experience added): Not empty, format MM/YYYY

**Optional Field Validation:**
- If field has content, must meet format requirements
- Empty optional fields are valid

### Error Messages

| Validation Error      | Message                                    |
|-----------------------|--------------------------------------------|
| Empty required field  | "This field is required"                   |
| Invalid email         | "Please enter a valid email address"       |
| Invalid date format   | "Please use MM/YYYY format (e.g., 01/2024)"|
| Min length not met    | "Must be at least X characters"            |
| Max length exceeded   | "Maximum X characters allowed"             |

---

## Loading & Success States

### During PDF Generation

**Form State:**
- All input fields: `disabled`, reduced opacity (60%)
- All buttons: `disabled`
- Generate PDF button: Shows spinner + "Generating..." text
- Cursor: `cursor-wait` on entire form
- Scroll: Prevented (optional)

**Visual Feedback:**
```
[Spinner Icon] Generating...
```
- Spinner: Rotating circle icon, 20x20px
- Animation: Continuous rotation
- Position: Inline with button text

**Duration:**
- Expected: 2-5 seconds
- Timeout: 30 seconds (show error if exceeded)

### Success State

**Behavior:**
1. Browser's native download dialog appears
2. Button returns to "Generate PDF" text
3. Form remains filled (allows regeneration)
4. All fields re-enabled
5. Optional: Brief success toast "PDF downloaded successfully" (enhancement)

**No Data Reset:** User can immediately regenerate or modify and regenerate

---

## Error Handling

### Error Banner Display

**Trigger Conditions:**
- Network failure during PDF generation
- Server error (5xx response)
- Timeout (>30 seconds)
- Unexpected client-side error

**Banner Content:**
```
┌─────────────────────────────────────────────────────┐
│  [!] Failed to generate PDF. Please try again.  [X] │
│  bg-red-50, border-l-4 border-red-500, p-4         │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Appears at top of form card
- Auto-scroll to top
- Dismissible via X button
- Persists until dismissed or successful generation
- Only one error banner shown at a time

### Field-Level Errors

**Display:**
- Red border on input: `border-red-500`
- Error message below input: `text-red-600 text-sm mt-1`
- Icon (optional): Small warning icon before text

**Clearing:**
- Error clears when user starts typing in field
- Error clears when field passes validation on blur

---

## Edge Cases & Handling

### Empty Dynamic Sections

**Scenario:** User submits without adding any Professional Links, Skills, or Certificates

**Handling:** Valid - these sections are optional. PDF generated without these sections.

### No Work Experience

**Scenario:** User submits without adding work experience

**Handling:** Valid - work experience optional. Entry-level resume support.

### Maximum Entries

**Scenario:** User adds excessive entries (e.g., 50 skills)

**Handling:**
- No hard limit enforced in UI
- PDF generation handles pagination
- Performance consideration: Forms with >100 total dynamic entries may lag

### Very Long Text

**Scenario:** User enters extremely long descriptions

**Handling:**
- Character limits enforced (500 for summary, 1000 for job descriptions)
- Remaining character count shown
- Input prevented beyond limit

### Network Interruption

**Scenario:** Network fails during PDF generation

**Handling:**
- Timeout after 30 seconds
- Error banner: "Network error. Please check your connection and try again."
- Form returns to enabled state

### Browser Compatibility

**Scenario:** User on unsupported browser

**Handling:**
- Graceful degradation for older browsers
- Core functionality works without advanced CSS
- Tested on: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Keyboard-Only Navigation

**Scenario:** User navigates entire form with keyboard

**Handling:**
- Tab order matches visual order
- All buttons accessible via Tab
- Enter key submits form (Generate PDF)
- Escape dismisses error banner
- Focus visible on all elements

### Screen Reader Usage

**Scenario:** Blind user completes form

**Handling:**
- All labels properly associated
- Required fields announced
- Error messages announced when they appear
- Button states announced (busy during generation)
- Dynamic content additions announced

---

## Implementation Notes

### Technology Stack
- **Framework:** Next.js 13+ (App Router or Pages Router)
- **Styling:** Tailwind CSS 3.x
- **Form Handling:** Controlled components (React useState)
- **PDF Generation:** Server-side endpoint (API route)
- **Validation:** Client-side (pre-submit) + server-side

### Component Structure Recommendation

```
/app or /pages
  /page.tsx or index.tsx (main form)
  /api
    /generate-pdf
      /route.ts (PDF generation endpoint)

/components
  /form
    /FormSection.tsx (reusable section wrapper)
    /TextInput.tsx (input with label and error)
    /Textarea.tsx
    /DynamicList.tsx (reusable add/remove list)
    /ErrorBanner.tsx
    /GenerateButton.tsx

/lib
  /validation.ts (validation functions)
  /types.ts (TypeScript interfaces)
```

### State Management

**Recommended Approach:**
- Single form state object with nested structure
- Controlled inputs updating state via onChange
- Validation state separate from form data state

**Example Structure:**
```typescript
interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
  links: Array<{ label: string; url: string }>;
  summary: string;
  experience: Array<{
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  skills: string[];
  certificates: Array<{
    name: string;
    organization: string;
    date: string;
  }>;
}
```

### Performance Considerations

- Debounce character counters (300ms)
- Optimize re-renders for dynamic lists (React.memo, useCallback)
- Lazy load PDF generation library
- Consider virtual scrolling if >50 dynamic entries expected

### Testing Checklist

- [ ] All required field validations work
- [ ] Optional field validations work when filled
- [ ] Add/Remove buttons for all dynamic sections
- [ ] Form submits with valid data
- [ ] Form blocks submission with invalid data
- [ ] Error banner appears and dismisses
- [ ] Loading state disables form
- [ ] PDF downloads successfully
- [ ] Keyboard navigation works completely
- [ ] Screen reader announces all changes
- [ ] Mobile layout responsive at all breakpoints
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets minimum 44x44px

---

## Open Questions for Stakeholders

1. **PDF Styling:** Should PDF match form styling, or use a traditional resume template style?
2. **Data Persistence:** Should we add "Save Draft" functionality using localStorage?
3. **Multiple Resume Support:** Future feature to save multiple resume versions?
4. **Template Selection:** Single PDF template, or multiple layouts to choose from?
5. **Export Formats:** PDF only, or also DOCX/plain text?
6. **Analytics:** Should we track completion rates, abandoned sections, or time to complete?

---

## Status

### Completed
- Comprehensive UX design specification for single-page resume generator
- Complete layout specifications for all 6 sections
- Detailed component specifications with states and behaviors
- Responsive design strategy (mobile-first, md breakpoint)
- Accessibility requirements (WCAG 2.1 AA compliant)
- Visual design system (typography, colors, spacing)
- Input field specifications with all states
- Validation rules and error handling strategy
- Loading and success state definitions
- Edge case documentation
- Implementation guidance for developers

### Remaining
- High-fidelity mockups or prototypes (optional, beyond document scope)
- User testing to validate design assumptions
- PDF template design specification
- Backend API contract definition
- Actual implementation of components

### Next Concrete Action
Developers can begin implementation using this specification. Recommended first steps:
1. Set up Next.js project with Tailwind CSS
2. Create base layout and form container
3. Implement Personal Information section as reference component
4. Build reusable input components
5. Implement validation logic
6. Create dynamic list component pattern
7. Integrate PDF generation endpoint

### Status: Completed

This UX design specification is complete and ready for development handoff.

---

**Document Version:** 1.0
**Last Updated:** 2026-02-20
**Author:** UX/UI Design Team
**Stakeholder Review:** Pending

---

## Update — 2026-02-21

### New Features Specified

#### Feature: Link Label Rename + Custom "Other" Label
- "GitHub" option renamed to "Git Repo" in the link type dropdown
- When "Other" is selected, a text input appears for a custom label
- Layout: `[type dropdown] [custom label input (if other)] [URL input] [Remove]`

#### Feature: Languages Section
**Position:** After Education, before Skills

**Layout per entry:**
```
┌─────────────────────────────────────────────────────┐
│  Language 1                          [Remove]       │
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ Language *         │  │ Level *            │    │
│  │ [text input]       │  │ [select dropdown]  │    │
│  └────────────────────┘  └────────────────────┘    │
│                                                     │
│  [+ Add Language]                                   │
└─────────────────────────────────────────────────────┘
```

**Level options:** Native, Fluent, Advanced, Intermediate, Basic

#### Feature: Work Experience Duration — Structured Date Pickers + Checkbox
**Replaces:** Single duration text input
**New layout per entry (date row):**
```
┌─────────────────────────────────────────────────────┐
│  Start Date *                                       │
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ [Month dropdown]   │  │ [Year dropdown]    │    │
│  └────────────────────┘  └────────────────────┘    │
│                                                     │
│  End Date                                           │
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ [Month dropdown]   │  │ [Year dropdown]    │    │
│  │  (disabled if ✓)   │  │  (disabled if ✓)   │    │
│  └────────────────────┘  └────────────────────┘    │
│                                                     │
│  [✓] Currently work here                           │
└─────────────────────────────────────────────────────┘
```
**Behavior:** Checking "Currently work here" clears end date fields and disables them; PDF renders "Present" for end date.

### Status: Completed
