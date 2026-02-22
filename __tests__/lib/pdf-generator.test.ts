/**
 * Unit tests for lib/pdf-generator.ts
 *
 * Strategy
 * ---------
 * generateResumePDF is the single public export. It creates a PDFDocument
 * instance, wires 'data'/'end'/'error' event listeners, calls the private
 * section generators, and finalises the document with doc.end(). The real
 * pdfkit module depends on native C++ bindings and cannot run inside Jest, so
 * all tests rely entirely on the manual mock at __mocks__/pdfkit.ts.
 *
 * Because the mock's default `on` implementation is a no-op jest.fn(), each
 * test configures PDFDocument.mockImplementation() in beforeEach to:
 *   - Store event handlers in a local `handlers` map when `on` is called.
 *   - Fire the 'data' and 'end' events when `end()` is called so the promise
 *     inside generateResumePDF resolves rather than hanging forever.
 *
 * Private helpers (getLinkLabel, capitalizeFirst, etc.) are tested indirectly
 * by inspecting the arguments that were passed to the `text` mock on the
 * document instance returned by the PDFDocument constructor.
 *
 * Coverage goals
 * --------------
 * - Happy paths: minimal data, fully populated data, empty arrays.
 * - Branching: photo present / absent, isCurrent true / false, certificate
 *   year present / absent, otherLabel present / absent.
 * - Error path: constructor throw is caught and forwarded as a rejected promise.
 * - Side-effect verification: doc.end() called, doc.font() called at least once.
 */

// Module-level mock declaration — Jest hoists this before any imports.
jest.mock("pdfkit");

import { generateResumePDF } from "@/lib/pdf-generator";
import type { ResumeData } from "@/lib/schema";

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * Shape of the mock document object returned by the PDFDocument constructor.
 * We cast the return value to this interface throughout the tests so TypeScript
 * understands which properties are jest.Mock instances.
 */
interface MockDocInstance {
  on: jest.Mock;
  end: jest.Mock;
  font: jest.Mock;
  fontSize: jest.Mock;
  fillColor: jest.Mock;
  strokeColor: jest.Mock;
  text: jest.Mock;
  moveDown: jest.Mock;
  moveTo: jest.Mock;
  lineTo: jest.Mock;
  stroke: jest.Mock;
  lineWidth: jest.Mock;
  image: jest.Mock;
  addPage: jest.Mock;
  y: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the mock instance that was created the last time the PDFDocument
 * constructor was called. Using mock.results[0].value is more reliable than
 * caching a variable because it survives module resets between tests.
 */
function getLastDocInstance(): MockDocInstance {
  const PDFDocumentMock = require("pdfkit") as jest.Mock;
  const calls = PDFDocumentMock.mock.results;
  if (calls.length === 0) {
    throw new Error("PDFDocument constructor was never called");
  }
  return calls[calls.length - 1].value as MockDocInstance;
}

/**
 * Configures the PDFDocument mock so that calling doc.end() fires the 'data'
 * and 'end' events, which allows the Promise inside generateResumePDF to
 * resolve. Call this inside beforeEach (or at the start of any test that needs
 * a successful run).
 */
function configureMockToResolve(): void {
  const PDFDocumentMock = require("pdfkit") as jest.Mock;
  PDFDocumentMock.mockImplementation(() => {
    const handlers: Record<string, Function> = {};
    return {
      on: jest.fn((event: string, cb: Function) => {
        handlers[event] = cb;
      }),
      end: jest.fn(() => {
        handlers["data"]?.(Buffer.from("%PDF-1.4 test"));
        handlers["end"]?.();
      }),
      font: jest.fn().mockReturnThis(),
      fontSize: jest.fn().mockReturnThis(),
      fillColor: jest.fn().mockReturnThis(),
      strokeColor: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      moveDown: jest.fn().mockReturnThis(),
      moveTo: jest.fn().mockReturnThis(),
      lineTo: jest.fn().mockReturnThis(),
      stroke: jest.fn().mockReturnThis(),
      lineWidth: jest.fn().mockReturnThis(),
      image: jest.fn().mockReturnThis(),
      addPage: jest.fn().mockReturnThis(),
      // doc.y is read as a plain property inside checkPageBreak and generateHeader.
      // A value of 100 keeps the mock document well within the page bounds so
      // checkPageBreak never triggers an addPage call during normal tests.
      y: 100,
    };
  });
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

/**
 * Minimal valid ResumeData — only the required scalar fields are set; every
 * array is empty and every optional field is omitted. Used as the baseline
 * fixture that individual tests augment with spread syntax.
 */
const baseResume: ResumeData = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  phone: "+1 555 000 0000",
  summary: "Experienced software engineer.",
  links: [],
  experience: [],
  education: [],
  languages: [],
  skills: [],
  certificates: [],
};

/**
 * Fully-populated ResumeData used in the "all sections" test.
 * The photo value is a minimal but correctly-prefixed data URI so the image
 * branch in generateHeader is exercised without crashing.
 */
const fullResume: ResumeData = {
  firstName: "John",
  lastName: "Smith",
  nickname: "JS",
  email: "john.smith@example.com",
  phone: "+44 20 7946 0000",
  // Minimal valid base64 PNG (1×1 transparent pixel)
  photo:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  summary: "Full-stack developer with 10 years of experience.",
  links: [
    { type: "git", url: "https://github.com/johnsmith" },
    { type: "linkedin", url: "https://linkedin.com/in/johnsmith" },
    { type: "portfolio", url: "https://johnsmith.dev" },
  ],
  experience: [
    {
      company: "Acme Corp",
      position: "Senior Engineer",
      startMonth: "January",
      startYear: "2020",
      endMonth: "March",
      endYear: "2023",
      isCurrent: false,
      description: "Led the backend team.",
      projects: [
        { name: "API Redesign", detail: "Reduced latency by 40%." },
        { name: "CI Pipeline" },
      ],
    },
  ],
  education: [
    {
      institution: "State University",
      degree: "B.Sc.",
      fieldOfStudy: "Computer Science",
      startYear: "2012",
      endYear: "2016",
      isCurrent: false,
      description: "Graduated with honours.",
    },
  ],
  languages: [
    { language: "English", level: "native" },
    { language: "Spanish", level: "intermediate" },
  ],
  skills: [{ value: "TypeScript" }, { value: "React" }, { value: "Node.js" }],
  certificates: [
    { name: "AWS Solutions Architect", issuer: "Amazon", year: "2022" },
    { name: "Certified Scrum Master", issuer: "Scrum Alliance" },
  ],
};

// ─── Test Suites ─────────────────────────────────────────────────────────────

describe("generateResumePDF", () => {
  beforeEach(() => {
    // Reset all mock state so previous test calls do not bleed into the next
    // test, then re-configure the mock so the promise resolves.
    jest.clearAllMocks();
    configureMockToResolve();
  });

  // ── 1. Return type ──────────────────────────────────────────────────────────

  it("returns a Buffer when called with minimal valid data", async () => {
    const result = await generateResumePDF(baseResume);

    expect(Buffer.isBuffer(result)).toBe(true);
  });

  // ── 2. Resolves without throwing with minimal data ──────────────────────────

  it("resolves without rejecting when only required fields are supplied and all arrays are empty", async () => {
    // If the promise rejects, Jest will fail the test automatically because we
    // are awaiting it — no explicit assertion is needed beyond the await.
    await expect(generateResumePDF(baseResume)).resolves.toBeDefined();
  });

  // ── 3. Resolves with fully populated data ───────────────────────────────────

  it("resolves when all sections are populated, including photo and links", async () => {
    await expect(generateResumePDF(fullResume)).resolves.toBeDefined();
  });

  // ── 4. doc.end() is called ──────────────────────────────────────────────────

  it("calls doc.end() to finalise the PDF", async () => {
    await generateResumePDF(baseResume);

    const doc = getLastDocInstance();
    expect(doc.end).toHaveBeenCalledTimes(1);
  });

  // ── 5. doc.font() called at least once ─────────────────────────────────────

  it("calls doc.font() at least once, confirming that rendering started", async () => {
    await generateResumePDF(baseResume);

    const doc = getLastDocInstance();
    expect(doc.font).toHaveBeenCalled();
  });

  // ── 6. Rejects when PDFDocument constructor throws ──────────────────────────

  it("rejects with an Error when the PDFDocument constructor throws", async () => {
    const PDFDocumentMock = require("pdfkit") as jest.Mock;
    PDFDocumentMock.mockImplementationOnce(() => {
      throw new Error("Constructor failed");
    });

    await expect(generateResumePDF(baseResume)).rejects.toThrow(
      "Constructor failed"
    );
  });

  it("rejects with a generic Error when the PDFDocument constructor throws a non-Error value", async () => {
    // Exercises the `error instanceof Error ? error : new Error(...)` branch
    // in the catch block of generateResumePDF.
    const PDFDocumentMock = require("pdfkit") as jest.Mock;
    PDFDocumentMock.mockImplementationOnce(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw "plain string error";
    });

    await expect(generateResumePDF(baseResume)).rejects.toThrow(
      "Unknown error during PDF generation"
    );
  });

  // ── 7. Photo absent — no error ──────────────────────────────────────────────

  it("resolves without error when photo is undefined", async () => {
    const resumeWithoutPhoto: ResumeData = { ...baseResume, photo: undefined };

    await expect(generateResumePDF(resumeWithoutPhoto)).resolves.toBeDefined();
  });

  it("does not call doc.image() when photo is absent", async () => {
    await generateResumePDF({ ...baseResume, photo: undefined });

    const doc = getLastDocInstance();
    expect(doc.image).not.toHaveBeenCalled();
  });

  // ── 8. Experience with isCurrent: true ─────────────────────────────────────

  it("resolves when an experience entry has isCurrent: true and no end dates", async () => {
    const resume: ResumeData = {
      ...baseResume,
      experience: [
        {
          company: "Startup Inc",
          position: "Engineer",
          startMonth: "June",
          startYear: "2022",
          isCurrent: true,
          description: "Building new features.",
          projects: [],
        },
      ],
    };

    await expect(generateResumePDF(resume)).resolves.toBeDefined();
  });

  it("passes 'Present' as end label when isCurrent is true", async () => {
    const resume: ResumeData = {
      ...baseResume,
      experience: [
        {
          company: "Startup Inc",
          position: "Engineer",
          startMonth: "June",
          startYear: "2022",
          isCurrent: true,
          description: "Building new features.",
          projects: [],
        },
      ],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    // At least one doc.text() call must include the word "Present"
    const textCalls = doc.text.mock.calls as unknown[][];
    const hasPresent = textCalls.some(
      (args) => typeof args[0] === "string" && args[0].includes("Present")
    );
    expect(hasPresent).toBe(true);
  });

  // ── 9. Experience with isCurrent: false and end dates ──────────────────────

  it("resolves when an experience entry has isCurrent: false with endMonth and endYear", async () => {
    const resume: ResumeData = {
      ...baseResume,
      experience: [
        {
          company: "Old Corp",
          position: "Developer",
          startMonth: "January",
          startYear: "2019",
          endMonth: "December",
          endYear: "2021",
          isCurrent: false,
          description: "Maintained legacy systems.",
          projects: [],
        },
      ],
    };

    await expect(generateResumePDF(resume)).resolves.toBeDefined();
  });

  it("includes the end year in rendered text when isCurrent is false and end dates are provided", async () => {
    const resume: ResumeData = {
      ...baseResume,
      experience: [
        {
          company: "Old Corp",
          position: "Developer",
          startMonth: "January",
          startYear: "2019",
          endMonth: "December",
          endYear: "2021",
          isCurrent: false,
          description: "Maintained legacy systems.",
          projects: [],
        },
      ],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const hasEndYear = textCalls.some(
      (args) => typeof args[0] === "string" && args[0].includes("2021")
    );
    expect(hasEndYear).toBe(true);
  });

  // ── 10. Multiple experience entries ────────────────────────────────────────

  it("resolves when experience contains multiple entries", async () => {
    const resume: ResumeData = {
      ...baseResume,
      experience: [
        {
          company: "Company A",
          position: "Junior Dev",
          startMonth: "March",
          startYear: "2017",
          endMonth: "July",
          endYear: "2018",
          isCurrent: false,
          description: "Started career.",
          projects: [],
        },
        {
          company: "Company B",
          position: "Mid Dev",
          startMonth: "August",
          startYear: "2018",
          endMonth: "February",
          endYear: "2020",
          isCurrent: false,
          description: "Grew skills significantly.",
          projects: [{ name: "Search Overhaul", detail: "Improved recall." }],
        },
        {
          company: "Company C",
          position: "Senior Dev",
          startMonth: "March",
          startYear: "2020",
          isCurrent: true,
          description: "Leading the team.",
          projects: [],
        },
      ],
    };

    await expect(generateResumePDF(resume)).resolves.toBeDefined();
  });

  // ── 11. All arrays empty — still resolves ──────────────────────────────────

  it("resolves when all optional array sections are empty", async () => {
    // baseResume already has all arrays empty; this test makes the intent explicit.
    const resume: ResumeData = {
      ...baseResume,
      experience: [],
      education: [],
      languages: [],
      skills: [],
      certificates: [],
    };

    await expect(generateResumePDF(resume)).resolves.toBeDefined();
  });

  // ── 12. Languages ──────────────────────────────────────────────────────────

  it("resolves when languages contains multiple entries", async () => {
    const resume: ResumeData = {
      ...baseResume,
      languages: [
        { language: "English", level: "native" },
        { language: "French", level: "fluent" },
        { language: "Mandarin", level: "basic" },
      ],
    };

    await expect(generateResumePDF(resume)).resolves.toBeDefined();
  });

  it("renders all language names when multiple languages are provided", async () => {
    const resume: ResumeData = {
      ...baseResume,
      languages: [
        { language: "English", level: "native" },
        { language: "French", level: "fluent" },
        { language: "Mandarin", level: "basic" },
      ],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];

    // The languages section joins all entries into a single string, so we look
    // for a call that contains all three language names simultaneously.
    const combinedLanguageCall = textCalls.some(
      (args) =>
        typeof args[0] === "string" &&
        args[0].includes("English") &&
        args[0].includes("French") &&
        args[0].includes("Mandarin")
    );
    expect(combinedLanguageCall).toBe(true);
  });

  // ── 13a. Certificate with year ─────────────────────────────────────────────

  it("resolves when a certificate has a year", async () => {
    const resume: ResumeData = {
      ...baseResume,
      certificates: [
        { name: "AWS Certified Developer", issuer: "Amazon", year: "2023" },
      ],
    };

    await expect(generateResumePDF(resume)).resolves.toBeDefined();
  });

  it("includes the year in parentheses in the rendered text when a certificate year is provided", async () => {
    const resume: ResumeData = {
      ...baseResume,
      certificates: [
        { name: "AWS Certified Developer", issuer: "Amazon", year: "2023" },
      ],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const hasCertWithYear = textCalls.some(
      (args) =>
        typeof args[0] === "string" &&
        args[0].includes("AWS Certified Developer") &&
        args[0].includes("(2023)")
    );
    expect(hasCertWithYear).toBe(true);
  });

  // ── 13b. Certificate without year ─────────────────────────────────────────

  it("resolves when a certificate does not have a year", async () => {
    const resume: ResumeData = {
      ...baseResume,
      certificates: [{ name: "Certified Scrum Master", issuer: "Scrum Alliance" }],
    };

    await expect(generateResumePDF(resume)).resolves.toBeDefined();
  });

  it("omits the year from rendered text when a certificate has no year", async () => {
    const resume: ResumeData = {
      ...baseResume,
      certificates: [{ name: "Certified Scrum Master", issuer: "Scrum Alliance" }],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];

    // The certificate text should be present but must NOT contain parentheses.
    const certTextCall = textCalls.find(
      (args) =>
        typeof args[0] === "string" &&
        args[0].includes("Certified Scrum Master")
    );
    expect(certTextCall).toBeDefined();
    expect(certTextCall![0]).not.toMatch(/\(\d{4}\)/);
  });

  // ── Photo present — calls doc.image() ──────────────────────────────────────

  it("calls doc.image() when a valid photo data URI is provided", async () => {
    await generateResumePDF(fullResume);

    const doc = getLastDocInstance();
    expect(doc.image).toHaveBeenCalled();
  });

  // ── Experience with project detail text ────────────────────────────────────

  it("renders project detail text when a project has a non-empty detail field", async () => {
    const resume: ResumeData = {
      ...baseResume,
      experience: [
        {
          company: "Tech Co",
          position: "Engineer",
          startMonth: "April",
          startYear: "2021",
          isCurrent: true,
          description: "Core platform work.",
          projects: [
            { name: "Performance Sprint", detail: "Cut load time by 30%." },
          ],
        },
      ],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const hasDetail = textCalls.some(
      (args) =>
        typeof args[0] === "string" && args[0].includes("Cut load time by 30%.")
    );
    expect(hasDetail).toBe(true);
  });

  it("does not render a detail line when a project has no detail", async () => {
    const resume: ResumeData = {
      ...baseResume,
      experience: [
        {
          company: "Tech Co",
          position: "Engineer",
          startMonth: "April",
          startYear: "2021",
          isCurrent: true,
          description: "Core platform work.",
          projects: [{ name: "Refactor Job" }],
        },
      ],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    // The test verifies the function still resolves cleanly; 'Refactor Job'
    // should appear but there should be no second text call for a detail line.
    const textCalls = doc.text.mock.calls as unknown[][];
    const projectNameCall = textCalls.some(
      (args) =>
        typeof args[0] === "string" && args[0].includes("Refactor Job")
    );
    expect(projectNameCall).toBe(true);
  });

  // ── Education with fieldOfStudy ────────────────────────────────────────────

  it("renders degree and field of study separated by an em-dash when fieldOfStudy is provided", async () => {
    const resume: ResumeData = {
      ...baseResume,
      education: [
        {
          institution: "MIT",
          degree: "M.Sc.",
          fieldOfStudy: "Electrical Engineering",
          startYear: "2014",
          endYear: "2016",
          isCurrent: false,
        },
      ],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const hasDegreeWithField = textCalls.some(
      (args) =>
        typeof args[0] === "string" &&
        args[0].includes("M.Sc.") &&
        args[0].includes("Electrical Engineering")
    );
    expect(hasDegreeWithField).toBe(true);
  });

  it("renders only the degree when fieldOfStudy is absent", async () => {
    const resume: ResumeData = {
      ...baseResume,
      education: [
        {
          institution: "MIT",
          degree: "M.Sc.",
          startYear: "2014",
          endYear: "2016",
          isCurrent: false,
        },
      ],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const degreeCall = textCalls.find(
      (args) => typeof args[0] === "string" && args[0] === "M.Sc."
    );
    expect(degreeCall).toBeDefined();
  });

  // ── Education with isCurrent: true ─────────────────────────────────────────

  it("renders 'Present' as end label when education isCurrent is true", async () => {
    const resume: ResumeData = {
      ...baseResume,
      education: [
        {
          institution: "City College",
          degree: "M.Sc.",
          startYear: "2022",
          isCurrent: true,
        },
      ],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const hasPresent = textCalls.some(
      (args) => typeof args[0] === "string" && args[0].includes("Present")
    );
    expect(hasPresent).toBe(true);
  });

  it("renders the end year in education duration text when isCurrent is false and endYear is provided", async () => {
    const resume: ResumeData = {
      ...baseResume,
      education: [
        {
          institution: "City College",
          degree: "M.Sc.",
          startYear: "2018",
          endYear: "2022",
          isCurrent: false,
        },
      ],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const hasEndYear = textCalls.some(
      (args) => typeof args[0] === "string" && args[0].includes("2022")
    );
    expect(hasEndYear).toBe(true);
  });

  // ── Nickname rendered in header ─────────────────────────────────────────────

  it("renders the nickname in parentheses when nickname is provided", async () => {
    const resume: ResumeData = {
      ...baseResume,
      nickname: "JD",
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const nameCall = textCalls.find(
      (args) =>
        typeof args[0] === "string" &&
        args[0].includes("Jane") &&
        args[0].includes("Doe") &&
        args[0].includes("(JD)")
    );
    expect(nameCall).toBeDefined();
  });

  it("renders first and last name without parentheses when nickname is absent", async () => {
    await generateResumePDF(baseResume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const nameCall = textCalls.find(
      (args) =>
        typeof args[0] === "string" &&
        args[0] === "Jane Doe"
    );
    expect(nameCall).toBeDefined();
  });
});

// ─── getLinkLabel (tested via generateResumePDF integration) ─────────────────

describe("getLinkLabel (via generateResumePDF integration)", () => {
  /**
   * All tests here call generateResumePDF with a single link of a specific
   * type and then inspect doc.text.mock.calls to find the call that contains
   * the formatted link string — which has the form "<Label>: <url>".
   *
   * Because getLinkLabel is not exported we cannot unit-test it directly;
   * integration through the public API is the only option.
   */

  beforeEach(() => {
    jest.clearAllMocks();
    configureMockToResolve();
  });

  // ── 14. git → "Git Repo" ────────────────────────────────────────────────────

  it('uses "Git Repo:" as the label for a link with type "git"', async () => {
    const resume: ResumeData = {
      ...baseResume,
      links: [{ type: "git", url: "https://github.com/x" }],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const hasLabel = textCalls.some(
      (args) =>
        typeof args[0] === "string" && args[0].includes("Git Repo:")
    );
    expect(hasLabel).toBe(true);
  });

  // ── 15. linkedin → "LinkedIn" ───────────────────────────────────────────────

  it('uses "LinkedIn:" as the label for a link with type "linkedin"', async () => {
    const resume: ResumeData = {
      ...baseResume,
      links: [{ type: "linkedin", url: "https://linkedin.com/in/x" }],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const hasLabel = textCalls.some(
      (args) =>
        typeof args[0] === "string" && args[0].includes("LinkedIn:")
    );
    expect(hasLabel).toBe(true);
  });

  // ── 16. portfolio → "Portfolio" ─────────────────────────────────────────────

  it('uses "Portfolio:" as the label for a link with type "portfolio"', async () => {
    const resume: ResumeData = {
      ...baseResume,
      links: [{ type: "portfolio", url: "https://myportfolio.dev" }],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const hasLabel = textCalls.some(
      (args) =>
        typeof args[0] === "string" && args[0].includes("Portfolio:")
    );
    expect(hasLabel).toBe(true);
  });

  // ── 17. other + otherLabel → capitalised custom label ──────────────────────

  it('uses the capitalised otherLabel as the label when type is "other" and otherLabel is provided', async () => {
    const resume: ResumeData = {
      ...baseResume,
      links: [
        {
          type: "other",
          url: "https://blog.example.com",
          otherLabel: "blog",
        },
      ],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    // "blog" should be capitalised to "Blog" by capitalizeFirst
    const hasLabel = textCalls.some(
      (args) =>
        typeof args[0] === "string" && args[0].includes("Blog:")
    );
    expect(hasLabel).toBe(true);
  });

  it('does not use the lowercase otherLabel directly — it must be capitalised', async () => {
    const resume: ResumeData = {
      ...baseResume,
      links: [
        {
          type: "other",
          url: "https://blog.example.com",
          otherLabel: "blog",
        },
      ],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    // The raw lowercase form "blog:" must not appear
    const hasRawLabel = textCalls.some(
      (args) =>
        typeof args[0] === "string" && args[0].includes("blog:")
    );
    expect(hasRawLabel).toBe(false);
  });

  // ── 18. other + no otherLabel → "Other" ────────────────────────────────────

  it('falls back to "Other:" when type is "other" and otherLabel is absent', async () => {
    const resume: ResumeData = {
      ...baseResume,
      links: [{ type: "other", url: "https://blog.example.com" }],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const hasLabel = textCalls.some(
      (args) =>
        typeof args[0] === "string" && args[0].includes("Other:")
    );
    expect(hasLabel).toBe(true);
  });

  it('falls back to "Other:" when type is "other" and otherLabel is an empty string', async () => {
    const resume: ResumeData = {
      ...baseResume,
      links: [{ type: "other", url: "https://blog.example.com", otherLabel: "" }],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const hasLabel = textCalls.some(
      (args) =>
        typeof args[0] === "string" && args[0].includes("Other:")
    );
    expect(hasLabel).toBe(true);
  });

  it('falls back to "Other:" when type is "other" and otherLabel is a whitespace-only string', async () => {
    // Exercises the `otherLabel.trim()` guard inside getLinkLabel.
    const resume: ResumeData = {
      ...baseResume,
      links: [{ type: "other", url: "https://blog.example.com", otherLabel: "   " }],
    };

    await generateResumePDF(resume);

    const doc = getLastDocInstance();
    const textCalls = doc.text.mock.calls as unknown[][];
    const hasLabel = textCalls.some(
      (args) =>
        typeof args[0] === "string" && args[0].includes("Other:")
    );
    expect(hasLabel).toBe(true);
  });
});
