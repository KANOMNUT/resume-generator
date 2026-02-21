/**
 * Unit tests for lib/sanitize.ts
 *
 * Strategy: sanitizeResumeData() is the last line of defence before
 * user-supplied strings reach PDF rendering and storage.  Its contract is:
 *
 *   1. Remove C0 and C1 control characters that can corrupt PDF output or
 *      trigger XSS-adjacent issues in rendered HTML (U+0000-U+0008, U+000B,
 *      U+000C, U+000E-U+001F, U+007F).
 *   2. Preserve semantically meaningful whitespace: LF (\n) and HT (\t).
 *   3. Trim leading/trailing ASCII whitespace from every string field.
 *   4. Preserve non-ASCII Unicode (international names, CJK, emoji, etc.).
 *   5. Pass optional fields through as undefined when the source is falsy.
 *   6. Pass photo and link type through without modification.
 *   7. Preserve boolean values (isCurrent) and enum values (language level)
 *      without coercion.
 *
 * Each describe block targets one logical section of the output object.
 * The baseResume fixture supplies a clean, valid starting state so that
 * individual tests only need to override the field they are probing.
 *
 * Tests intentionally do NOT import from Zod or re-validate the result —
 * that is schema.test.ts's job.  Here we care only about string mutations.
 */

import { sanitizeResumeData } from "@/lib/sanitize";
import type { ResumeData } from "@/lib/schema";

// ---------------------------------------------------------------------------
// Test fixture
// ---------------------------------------------------------------------------

/**
 * A minimal, fully-valid ResumeData object used as the base for all tests.
 * Every test spreads this and overrides only the relevant fields, so the
 * TypeScript compiler validates the shape and tests remain focused.
 */
const baseResume: ResumeData = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "+1-555-000-0000",
  links: [],
  summary: "Experienced software engineer.",
  experience: [],
  education: [],
  languages: [],
  skills: [],
  certificates: [],
};

// ---------------------------------------------------------------------------
// Helper: build a string containing every control character that must be
// stripped, plus a readable payload before and after.
// ---------------------------------------------------------------------------

/**
 * Builds a string that embeds the given control characters around a payload.
 * Format: <prefix><controls><payload><controls><suffix>
 * Used to verify that stripping does not affect the surrounding text.
 */
function withControls(payload: string, controls: string): string {
  return `${controls}${payload}${controls}`;
}

/** All code points in the ranges \x00-\x08, \x0B, \x0C, \x0E-\x1F, \x7F */
const ALL_STRIPPED_CONTROLS: string = [
  // \x00 through \x08
  "\x00\x01\x02\x03\x04\x05\x06\x07\x08",
  // \x0B (VT) and \x0C (FF) — \x09 (tab) and \x0A (LF) are intentionally kept
  "\x0B\x0C",
  // \x0E through \x1F
  "\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F",
  // DEL
  "\x7F",
].join("");

// ---------------------------------------------------------------------------
// 1. cleanString behaviour (tested indirectly through top-level string fields)
// ---------------------------------------------------------------------------

describe("sanitizeResumeData — cleanString behaviour", () => {
  it("should strip all C0/C1 control characters that are not LF or HT", () => {
    const dirty = withControls("hello", ALL_STRIPPED_CONTROLS);
    const result = sanitizeResumeData({ ...baseResume, firstName: dirty });
    // Only "hello" should survive; all control chars removed, then trimmed.
    expect(result.firstName).toBe("hello");
  });

  it("should preserve newline characters (\\n)", () => {
    const withNewline = "line one\nline two";
    const result = sanitizeResumeData({ ...baseResume, summary: withNewline });
    expect(result.summary).toBe("line one\nline two");
  });

  it("should preserve tab characters (\\t)", () => {
    const withTab = "col1\tcol2";
    const result = sanitizeResumeData({ ...baseResume, summary: withTab });
    expect(result.summary).toBe("col1\tcol2");
  });

  it("should trim leading whitespace", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      firstName: "   Alice",
    });
    expect(result.firstName).toBe("Alice");
  });

  it("should trim trailing whitespace", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      firstName: "Alice   ",
    });
    expect(result.firstName).toBe("Alice");
  });

  it("should trim both leading and trailing whitespace simultaneously", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      firstName: "  Alice  ",
    });
    expect(result.firstName).toBe("Alice");
  });

  it("should preserve internal spaces", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      firstName: "Mary Jane",
    });
    expect(result.firstName).toBe("Mary Jane");
  });

  it("should preserve non-ASCII unicode characters (Thai script)", () => {
    const thai = "สวัสดี";
    const result = sanitizeResumeData({ ...baseResume, firstName: thai });
    expect(result.firstName).toBe(thai);
  });

  it("should preserve non-ASCII unicode characters (CJK)", () => {
    const cjk = "山田 太郎";
    const result = sanitizeResumeData({ ...baseResume, firstName: cjk });
    expect(result.firstName).toBe(cjk);
  });

  it("should strip control chars and then trim so the result is clean", () => {
    // \x01 at start + real whitespace + payload + \x7F at end
    const messy = "\x01   engineer   \x7F";
    const result = sanitizeResumeData({ ...baseResume, summary: messy });
    expect(result.summary).toBe("engineer");
  });
});

// ---------------------------------------------------------------------------
// 2. Top-level required string fields
// ---------------------------------------------------------------------------

describe("sanitizeResumeData — firstName", () => {
  it("should sanitize a clean value without modification", () => {
    const result = sanitizeResumeData({ ...baseResume, firstName: "Jane" });
    expect(result.firstName).toBe("Jane");
  });

  it("should strip control characters from firstName", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      firstName: `\x01Jane\x7F`,
    });
    expect(result.firstName).toBe("Jane");
  });

  it("should trim whitespace from firstName", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      firstName: "  Jane  ",
    });
    expect(result.firstName).toBe("Jane");
  });
});

describe("sanitizeResumeData — lastName", () => {
  it("should sanitize a clean value without modification", () => {
    const result = sanitizeResumeData({ ...baseResume, lastName: "Doe" });
    expect(result.lastName).toBe("Doe");
  });

  it("should strip control characters from lastName", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      lastName: `\x02Doe\x0C`,
    });
    expect(result.lastName).toBe("Doe");
  });

  it("should trim whitespace from lastName", () => {
    const result = sanitizeResumeData({ ...baseResume, lastName: "  Doe  " });
    expect(result.lastName).toBe("Doe");
  });
});

describe("sanitizeResumeData — email", () => {
  it("should strip control characters from email", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      email: "\x0Bjane@example.com\x0B",
    });
    expect(result.email).toBe("jane@example.com");
  });

  it("should trim whitespace from email", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      email: " jane@example.com ",
    });
    expect(result.email).toBe("jane@example.com");
  });
});

describe("sanitizeResumeData — phone", () => {
  it("should strip control characters from phone", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      phone: "\x1F+1-555-000-0000\x1F",
    });
    expect(result.phone).toBe("+1-555-000-0000");
  });

  it("should trim whitespace from phone", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      phone: " +1-555-000-0000 ",
    });
    expect(result.phone).toBe("+1-555-000-0000");
  });
});

describe("sanitizeResumeData — summary", () => {
  it("should strip control characters from summary", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      summary: "\x00Senior engineer\x7F",
    });
    expect(result.summary).toBe("Senior engineer");
  });

  it("should preserve newlines within summary", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      summary: "First paragraph.\nSecond paragraph.",
    });
    expect(result.summary).toBe("First paragraph.\nSecond paragraph.");
  });
});

// ---------------------------------------------------------------------------
// 3. nickname (optional)
// ---------------------------------------------------------------------------

describe("sanitizeResumeData — nickname", () => {
  it("should sanitize nickname when it is a non-empty string", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      nickname: "  \x01JD\x7F  ",
    });
    expect(result.nickname).toBe("JD");
  });

  it("should return undefined for nickname when the source value is undefined", () => {
    const result = sanitizeResumeData({ ...baseResume, nickname: undefined });
    expect(result.nickname).toBeUndefined();
  });

  it("should return undefined for nickname when the source value is an empty string", () => {
    // An empty string is falsy; the implementation returns undefined for it.
    const result = sanitizeResumeData({ ...baseResume, nickname: "" });
    expect(result.nickname).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 4. photo
// ---------------------------------------------------------------------------

describe("sanitizeResumeData — photo", () => {
  it("should pass a base64 photo string through unchanged", () => {
    const photo = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD=";
    const result = sanitizeResumeData({ ...baseResume, photo });
    expect(result.photo).toBe(photo);
  });

  it("should return undefined when photo is undefined", () => {
    const result = sanitizeResumeData({ ...baseResume, photo: undefined });
    expect(result.photo).toBeUndefined();
  });

  it("should not modify the base64 payload — no stripping or trimming", () => {
    // Base64 data must not be altered; even if it contains characters that
    // happen to look like whitespace in certain encodings, it must survive
    // intact.  We use a payload with a '+' and '=' that are valid base64.
    const photo = "data:image/png;base64,iVBORw0KGgo=";
    const result = sanitizeResumeData({ ...baseResume, photo });
    expect(result.photo).toBe(photo);
  });
});

// ---------------------------------------------------------------------------
// 5. links
// ---------------------------------------------------------------------------

describe("sanitizeResumeData — links", () => {
  it("should sanitize the url field of each link", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      links: [
        {
          type: "git",
          url: "  https://github.com/user  ",
        },
      ],
    });
    expect(result.links[0].url).toBe("https://github.com/user");
  });

  it("should pass the link type through without modification", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      links: [{ type: "portfolio", url: "https://example.com" }],
    });
    expect(result.links[0].type).toBe("portfolio");
  });

  it("should sanitize otherLabel when present", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      links: [
        {
          type: "other",
          url: "https://blog.example.com",
          otherLabel: "  \x01My Blog\x7F  ",
        },
      ],
    });
    expect(result.links[0].otherLabel).toBe("My Blog");
  });

  it("should set otherLabel to undefined when it is absent from the source", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      links: [{ type: "other", url: "https://example.com" }],
    });
    expect(result.links[0].otherLabel).toBeUndefined();
  });

  it("should set otherLabel to undefined when the source value is an empty string", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      links: [{ type: "other", url: "https://example.com", otherLabel: "" }],
    });
    expect(result.links[0].otherLabel).toBeUndefined();
  });

  it("should handle multiple links independently", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      links: [
        { type: "git", url: "  https://github.com/a  " },
        { type: "linkedin", url: "  https://linkedin.com/in/b  " },
      ],
    });
    expect(result.links[0].url).toBe("https://github.com/a");
    expect(result.links[1].url).toBe("https://linkedin.com/in/b");
  });
});

// ---------------------------------------------------------------------------
// 6. experience
// ---------------------------------------------------------------------------

describe("sanitizeResumeData — experience", () => {
  const cleanExp: ResumeData["experience"][number] = {
    company: "Acme",
    position: "Engineer",
    startMonth: "January",
    startYear: "2020",
    isCurrent: false,
    endMonth: "December",
    endYear: "2023",
    description: "Built things.",
    projects: [],
  };

  it("should sanitize company", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [{ ...cleanExp, company: "  \x01Acme Corp\x7F  " }],
    });
    expect(result.experience[0].company).toBe("Acme Corp");
  });

  it("should sanitize position", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [{ ...cleanExp, position: "\x0BSenior Engineer\x0B" }],
    });
    expect(result.experience[0].position).toBe("Senior Engineer");
  });

  it("should sanitize description", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [{ ...cleanExp, description: "\x00Led team.\x7F" }],
    });
    expect(result.experience[0].description).toBe("Led team.");
  });

  it("should sanitize startMonth", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [{ ...cleanExp, startMonth: " January " }],
    });
    expect(result.experience[0].startMonth).toBe("January");
  });

  it("should sanitize startYear", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [{ ...cleanExp, startYear: " 2020 " }],
    });
    expect(result.experience[0].startYear).toBe("2020");
  });

  it("should sanitize endMonth when present", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [{ ...cleanExp, endMonth: " December " }],
    });
    expect(result.experience[0].endMonth).toBe("December");
  });

  it("should set endMonth to undefined when it is absent", () => {
    const { endMonth: _em, endYear: _ey, ...expWithoutEnd } = cleanExp;
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [{ ...expWithoutEnd, isCurrent: true }],
    });
    expect(result.experience[0].endMonth).toBeUndefined();
  });

  it("should set endMonth to undefined when it is an empty string", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [{ ...cleanExp, endMonth: "" }],
    });
    expect(result.experience[0].endMonth).toBeUndefined();
  });

  it("should sanitize endYear when present", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [{ ...cleanExp, endYear: " 2023 " }],
    });
    expect(result.experience[0].endYear).toBe("2023");
  });

  it("should set endYear to undefined when it is an empty string", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [{ ...cleanExp, endYear: "" }],
    });
    expect(result.experience[0].endYear).toBeUndefined();
  });

  it("should pass isCurrent through as true without coercion", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [{ ...cleanExp, isCurrent: true }],
    });
    expect(result.experience[0].isCurrent).toBe(true);
  });

  it("should pass isCurrent through as false without coercion", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [{ ...cleanExp, isCurrent: false }],
    });
    expect(result.experience[0].isCurrent).toBe(false);
  });

  it("should sanitize project name", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [
        {
          ...cleanExp,
          projects: [{ name: " \x01Project Alpha\x7F ", detail: "details" }],
        },
      ],
    });
    expect(result.experience[0].projects[0].name).toBe("Project Alpha");
  });

  it("should sanitize project detail when present", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [
        {
          ...cleanExp,
          projects: [{ name: "Alpha", detail: " \x0CRewrote the pipeline.\x0C " }],
        },
      ],
    });
    expect(result.experience[0].projects[0].detail).toBe(
      "Rewrote the pipeline."
    );
  });

  it("should set project detail to undefined when it is absent", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [
        {
          ...cleanExp,
          projects: [{ name: "Alpha" }],
        },
      ],
    });
    expect(result.experience[0].projects[0].detail).toBeUndefined();
  });

  it("should set project detail to undefined when it is an empty string", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      experience: [
        {
          ...cleanExp,
          projects: [{ name: "Alpha", detail: "" }],
        },
      ],
    });
    expect(result.experience[0].projects[0].detail).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 7. education
// ---------------------------------------------------------------------------

describe("sanitizeResumeData — education", () => {
  const cleanEdu: ResumeData["education"][number] = {
    institution: "MIT",
    degree: "B.Sc.",
    fieldOfStudy: "Computer Science",
    duration: "2010 - 2014",
    description: "Graduated with honours.",
  };

  it("should sanitize institution", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      education: [{ ...cleanEdu, institution: " \x01MIT\x7F " }],
    });
    expect(result.education[0].institution).toBe("MIT");
  });

  it("should sanitize degree", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      education: [{ ...cleanEdu, degree: "\x0BB.Sc.\x0B" }],
    });
    expect(result.education[0].degree).toBe("B.Sc.");
  });

  it("should sanitize duration", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      education: [{ ...cleanEdu, duration: " 2010 - 2014 " }],
    });
    expect(result.education[0].duration).toBe("2010 - 2014");
  });

  it("should sanitize fieldOfStudy when present", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      education: [
        { ...cleanEdu, fieldOfStudy: " \x0EComputer Science\x0E " },
      ],
    });
    expect(result.education[0].fieldOfStudy).toBe("Computer Science");
  });

  it("should set fieldOfStudy to undefined when it is absent", () => {
    const { fieldOfStudy: _fs, ...eduWithoutField } = cleanEdu;
    const result = sanitizeResumeData({
      ...baseResume,
      education: [{ ...eduWithoutField }],
    });
    expect(result.education[0].fieldOfStudy).toBeUndefined();
  });

  it("should set fieldOfStudy to undefined when it is an empty string", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      education: [{ ...cleanEdu, fieldOfStudy: "" }],
    });
    expect(result.education[0].fieldOfStudy).toBeUndefined();
  });

  it("should sanitize description when present", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      education: [
        { ...cleanEdu, description: " \x1FGraduated with honours.\x1F " },
      ],
    });
    expect(result.education[0].description).toBe("Graduated with honours.");
  });

  it("should set description to undefined when it is absent", () => {
    const { description: _desc, ...eduWithoutDesc } = cleanEdu;
    const result = sanitizeResumeData({
      ...baseResume,
      education: [{ ...eduWithoutDesc }],
    });
    expect(result.education[0].description).toBeUndefined();
  });

  it("should set description to undefined when it is an empty string", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      education: [{ ...cleanEdu, description: "" }],
    });
    expect(result.education[0].description).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 8. languages
// ---------------------------------------------------------------------------

describe("sanitizeResumeData — languages", () => {
  it("should sanitize the language name", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      languages: [{ language: " \x01English\x7F ", level: "native" }],
    });
    expect(result.languages[0].language).toBe("English");
  });

  it("should pass the level enum value through unchanged", () => {
    const levels: ResumeData["languages"][number]["level"][] = [
      "native",
      "fluent",
      "advanced",
      "intermediate",
      "basic",
    ];
    for (const level of levels) {
      const result = sanitizeResumeData({
        ...baseResume,
        languages: [{ language: "English", level }],
      });
      expect(result.languages[0].level).toBe(level);
    }
  });
});

// ---------------------------------------------------------------------------
// 9. skills
// ---------------------------------------------------------------------------

describe("sanitizeResumeData — skills", () => {
  it("should sanitize skill value", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      skills: [{ value: " \x01TypeScript\x7F " }],
    });
    expect(result.skills[0].value).toBe("TypeScript");
  });

  it("should sanitize multiple skills independently", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      skills: [
        { value: " TypeScript " },
        { value: " \x01Node.js\x7F " },
      ],
    });
    expect(result.skills[0].value).toBe("TypeScript");
    expect(result.skills[1].value).toBe("Node.js");
  });
});

// ---------------------------------------------------------------------------
// 10. certificates
// ---------------------------------------------------------------------------

describe("sanitizeResumeData — certificates", () => {
  it("should sanitize certificate name", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      certificates: [
        { name: " \x01AWS Certified\x7F ", issuer: "Amazon" },
      ],
    });
    expect(result.certificates[0].name).toBe("AWS Certified");
  });

  it("should sanitize issuer", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      certificates: [{ name: "AWS Certified", issuer: " \x0CAmazon\x0C " }],
    });
    expect(result.certificates[0].issuer).toBe("Amazon");
  });

  it("should sanitize year when present", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      certificates: [
        { name: "AWS Certified", issuer: "Amazon", year: " 2022 " },
      ],
    });
    expect(result.certificates[0].year).toBe("2022");
  });

  it("should set year to undefined when it is absent", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      certificates: [{ name: "AWS Certified", issuer: "Amazon" }],
    });
    expect(result.certificates[0].year).toBeUndefined();
  });

  it("should set year to undefined when it is an empty string", () => {
    const result = sanitizeResumeData({
      ...baseResume,
      certificates: [{ name: "AWS Certified", issuer: "Amazon", year: "" }],
    });
    expect(result.certificates[0].year).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 11. Empty arrays
// ---------------------------------------------------------------------------

describe("sanitizeResumeData — empty arrays", () => {
  it("should return empty links array when source links is empty", () => {
    const result = sanitizeResumeData({ ...baseResume, links: [] });
    expect(result.links).toEqual([]);
  });

  it("should return empty experience array when source experience is empty", () => {
    const result = sanitizeResumeData({ ...baseResume, experience: [] });
    expect(result.experience).toEqual([]);
  });

  it("should return empty education array when source education is empty", () => {
    const result = sanitizeResumeData({ ...baseResume, education: [] });
    expect(result.education).toEqual([]);
  });

  it("should return empty languages array when source languages is empty", () => {
    const result = sanitizeResumeData({ ...baseResume, languages: [] });
    expect(result.languages).toEqual([]);
  });

  it("should return empty skills array when source skills is empty", () => {
    const result = sanitizeResumeData({ ...baseResume, skills: [] });
    expect(result.skills).toEqual([]);
  });

  it("should return empty certificates array when source certificates is empty", () => {
    const result = sanitizeResumeData({ ...baseResume, certificates: [] });
    expect(result.certificates).toEqual([]);
  });
});
