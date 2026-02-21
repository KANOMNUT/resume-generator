/**
 * Unit tests for lib/schema.ts
 *
 * Strategy: The resumeSchema is the single validation boundary that every
 * form submission must pass before reaching business logic.  A defect here
 * either lets bad data through (data integrity risk) or rejects valid
 * submissions (UX regression).  We therefore test:
 *
 *   1. Every required field — empty-string and missing-value failures.
 *   2. Every field with a max-length constraint — boundary at max+1 chars.
 *   3. Every enum field — each valid value plus one invalid value.
 *   4. The photo refine() — the regex is the only server-side guard against
 *      non-image data URIs being stored.
 *   5. Array-length ceilings — one entry over the declared maximum.
 *   6. Optional fields — absent values are accepted without errors.
 *
 * Zod v4 safeParse() returns { success, data, error }.
 * error.issues is the canonical array of ZodIssue objects.
 * We assert on success === false and inspect error.issues[*].message for
 * specific error strings rather than relying on snapshot matching, keeping
 * tests resilient to Zod version upgrades.
 */

import { resumeSchema } from "@/lib/schema";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Returns all error messages from a failed safeParse result as a flat array.
 * Flattening is done through the issues array rather than Zod's flatten()
 * utility so the tests do not depend on the nested fieldErrors shape.
 */
function collectMessages(result: ReturnType<typeof resumeSchema.safeParse>): string[] {
  if (result.success) return [];
  return result.error.issues.map((i) => i.message);
}

/** Repeats a string `char` exactly `n` times. Used for boundary-value tests. */
function repeat(char: string, n: number): string {
  return char.repeat(n);
}

// ---------------------------------------------------------------------------
// Minimal valid fixture
// ---------------------------------------------------------------------------

/**
 * VALID_RESUME is the canonical minimal-valid payload used as the base for
 * every negative test.  A test that wants to break one field spreads this
 * object and overrides only the field under test.  This keeps each test
 * focused on a single variable.
 *
 * All optional fields (nickname, photo, links otherLabel, experience end dates,
 * education fieldOfStudy/description, certificate year) are intentionally
 * omitted here; they appear in their own dedicated test cases.
 */
const VALID_RESUME = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  phone: "+1-555-000-0000",
  links: [],
  summary: "Experienced software engineer.",
  experience: [],
  education: [],
  languages: [],
  skills: [],
  certificates: [],
} as const;

// ---------------------------------------------------------------------------
// 1. Valid full resume
// ---------------------------------------------------------------------------

describe("resumeSchema — valid data", () => {
  it("should pass with a fully-populated resume including all optional fields", () => {
    const full = {
      ...VALID_RESUME,
      nickname: "JD",
      photo: "data:image/jpeg;base64,abc123",
      links: [
        { type: "git", url: "https://github.com/janedoe" },
        { type: "portfolio", url: "https://janedoe.dev" },
        { type: "linkedin", url: "https://linkedin.com/in/janedoe" },
        { type: "other", url: "https://blog.janedoe.dev", otherLabel: "Blog" },
      ],
      experience: [
        {
          company: "Acme Corp",
          position: "Senior Engineer",
          startMonth: "January",
          startYear: "2020",
          endMonth: "December",
          endYear: "2023",
          isCurrent: false,
          description: "Led backend development.",
          projects: [
            { name: "Project Alpha", detail: "Rebuilt the data pipeline." },
          ],
        },
      ],
      education: [
        {
          institution: "State University",
          degree: "B.Sc. Computer Science",
          fieldOfStudy: "Computer Science",
          duration: "2014 - 2018",
          description: "Graduated with honours.",
        },
      ],
      languages: [{ language: "English", level: "native" as const }],
      skills: [{ value: "TypeScript" }],
      certificates: [
        { name: "AWS Certified Developer", issuer: "Amazon", year: "2022" },
      ],
    };

    const result = resumeSchema.safeParse(full);
    expect(result.success).toBe(true);
  });

  it("should pass with only required fields and all arrays empty", () => {
    const result = resumeSchema.safeParse(VALID_RESUME);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. firstName / lastName
// ---------------------------------------------------------------------------

describe("resumeSchema — firstName", () => {
  it("should fail when firstName is an empty string", () => {
    const result = resumeSchema.safeParse({ ...VALID_RESUME, firstName: "" });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("First name is required");
  });

  it("should fail when firstName exceeds 100 characters", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      firstName: repeat("a", 101),
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("First name too long");
  });

  it("should pass when firstName is exactly 100 characters", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      firstName: repeat("a", 100),
    });
    expect(result.success).toBe(true);
  });
});

describe("resumeSchema — lastName", () => {
  it("should fail when lastName is an empty string", () => {
    const result = resumeSchema.safeParse({ ...VALID_RESUME, lastName: "" });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Last name is required");
  });

  it("should fail when lastName exceeds 100 characters", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      lastName: repeat("b", 101),
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Last name too long");
  });

  it("should pass when lastName is exactly 100 characters", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      lastName: repeat("b", 100),
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. email
// ---------------------------------------------------------------------------

describe("resumeSchema — email", () => {
  it("should fail when email is an empty string", () => {
    const result = resumeSchema.safeParse({ ...VALID_RESUME, email: "" });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Email is required");
  });

  it("should fail when email has no @ symbol", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      email: "notanemail",
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Must be a valid email");
  });

  it("should fail when email has no domain", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      email: "user@",
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Must be a valid email");
  });

  it("should fail when email exceeds 254 characters", () => {
    // 245-char local part + @ + example.com = 256 chars total
    const local = repeat("a", 245);
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      email: `${local}@example.com`,
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Email too long");
  });

  it("should pass with a well-formed email address", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      email: "valid+tag@sub.example.org",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. phone
// ---------------------------------------------------------------------------

describe("resumeSchema — phone", () => {
  it("should fail when phone is an empty string", () => {
    const result = resumeSchema.safeParse({ ...VALID_RESUME, phone: "" });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Phone number is required");
  });

  it("should fail when phone exceeds 30 characters", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      phone: repeat("1", 31),
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Phone number too long");
  });

  it("should pass when phone is exactly 30 characters", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      phone: repeat("1", 30),
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. photo
// ---------------------------------------------------------------------------

describe("resumeSchema — photo", () => {
  it("should pass when photo is undefined (field is optional)", () => {
    // VALID_RESUME does not include photo, so this tests the undefined path.
    const result = resumeSchema.safeParse({ ...VALID_RESUME });
    expect(result.success).toBe(true);
  });

  it("should pass with a data:image/jpeg;base64, data URI", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      photo: "data:image/jpeg;base64,abc123",
    });
    expect(result.success).toBe(true);
  });

  it("should pass with a data:image/jpg;base64, data URI", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      photo: "data:image/jpg;base64,/9j/4AAQSkZ",
    });
    expect(result.success).toBe(true);
  });

  it("should pass with a data:image/png;base64, data URI", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      photo: "data:image/png;base64,iVBORw0KGgo=",
    });
    expect(result.success).toBe(true);
  });

  it("should pass with a data:image/webp;base64, data URI", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      photo: "data:image/webp;base64,UklGRg==",
    });
    expect(result.success).toBe(true);
  });

  it("should fail when photo has an unsupported MIME type (gif)", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      photo: "data:image/gif;base64,abc",
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain(
      "Photo must be a valid JPEG, PNG, or WebP image"
    );
  });

  it("should fail when photo is a plain URL without the data: prefix", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      photo: "https://example.com/photo.jpg",
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain(
      "Photo must be a valid JPEG, PNG, or WebP image"
    );
  });

  it("should fail when photo is a bare file path without any prefix", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      photo: "photo.jpg",
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain(
      "Photo must be a valid JPEG, PNG, or WebP image"
    );
  });
});

// ---------------------------------------------------------------------------
// 6. links
// ---------------------------------------------------------------------------

describe("resumeSchema — links", () => {
  it("should pass with type 'git'", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      links: [{ type: "git", url: "https://github.com/user" }],
    });
    expect(result.success).toBe(true);
  });

  it("should pass with type 'portfolio'", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      links: [{ type: "portfolio", url: "https://portfolio.example.com" }],
    });
    expect(result.success).toBe(true);
  });

  it("should pass with type 'linkedin'", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      links: [{ type: "linkedin", url: "https://linkedin.com/in/user" }],
    });
    expect(result.success).toBe(true);
  });

  it("should pass with type 'other' and an otherLabel", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      links: [
        {
          type: "other",
          url: "https://blog.example.com",
          otherLabel: "My Blog",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should fail with an invalid link type", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      links: [{ type: "twitter", url: "https://twitter.com/user" }],
    });
    expect(result.success).toBe(false);
  });

  it("should fail when link url is not a valid URL", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      links: [{ type: "git", url: "not-a-url" }],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Must be a valid URL");
  });

  it("should pass when otherLabel is omitted", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      links: [{ type: "other", url: "https://example.com" }],
    });
    expect(result.success).toBe(true);
  });

  it("should pass when otherLabel is an empty string", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      links: [{ type: "other", url: "https://example.com", otherLabel: "" }],
    });
    expect(result.success).toBe(true);
  });

  it("should fail when otherLabel exceeds 50 characters", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      links: [
        {
          type: "other",
          url: "https://example.com",
          otherLabel: repeat("x", 51),
        },
      ],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Label too long");
  });

  it("should fail when more than 10 links are provided", () => {
    const tooManyLinks = Array.from({ length: 11 }, () => ({
      type: "git" as const,
      url: "https://github.com/user",
    }));
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      links: tooManyLinks,
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Maximum 10 links");
  });
});

// ---------------------------------------------------------------------------
// 7. experience
// ---------------------------------------------------------------------------

describe("resumeSchema — experience", () => {
  const validExp = {
    company: "Acme Corp",
    position: "Engineer",
    startMonth: "January",
    startYear: "2020",
    isCurrent: true,
    description: "Built features.",
    projects: [],
  };

  it("should fail when startMonth is an empty string", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      experience: [{ ...validExp, startMonth: "" }],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Start month is required");
  });

  it("should fail when startYear is an empty string", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      experience: [{ ...validExp, startYear: "" }],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Start year is required");
  });

  it("should pass when isCurrent is true and endMonth/endYear are absent", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      experience: [{ ...validExp, isCurrent: true }],
    });
    expect(result.success).toBe(true);
  });

  it("should pass when isCurrent is false and endMonth/endYear are provided", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      experience: [
        {
          ...validExp,
          isCurrent: false,
          endMonth: "December",
          endYear: "2023",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should pass when endMonth and endYear are empty strings", () => {
    // The schema allows z.literal("") as an alternative for these fields.
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      experience: [
        {
          ...validExp,
          isCurrent: false,
          endMonth: "",
          endYear: "",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should fail when more than 20 experience entries are provided", () => {
    const tooMany = Array.from({ length: 21 }, () => ({ ...validExp }));
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      experience: tooMany,
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Maximum 20 experience entries");
  });

  it("should fail when a project name is an empty string", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      experience: [
        {
          ...validExp,
          projects: [{ name: "" }],
        },
      ],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Project name is required");
  });

  it("should fail when an experience entry has more than 10 projects", () => {
    const tooManyProjects = Array.from({ length: 11 }, (_, i) => ({
      name: `Project ${i + 1}`,
    }));
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      experience: [
        {
          ...validExp,
          projects: tooManyProjects,
        },
      ],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain(
      "Maximum 10 projects per experience"
    );
  });

  it("should pass when a project has an optional detail field", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      experience: [
        {
          ...validExp,
          projects: [{ name: "Alpha", detail: "Rewrote the auth service." }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should pass when a project detail is omitted", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      experience: [
        {
          ...validExp,
          projects: [{ name: "Alpha" }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 8. education
// ---------------------------------------------------------------------------

describe("resumeSchema — education", () => {
  const validEdu = {
    institution: "MIT",
    degree: "B.Sc.",
    duration: "2010 - 2014",
  };

  it("should fail when institution is an empty string", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      education: [{ ...validEdu, institution: "" }],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Institution is required");
  });

  it("should fail when degree is an empty string", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      education: [{ ...validEdu, degree: "" }],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Degree is required");
  });

  it("should fail when duration is an empty string", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      education: [{ ...validEdu, duration: "" }],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Duration is required");
  });

  it("should pass when fieldOfStudy is omitted", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      education: [{ ...validEdu }],
    });
    expect(result.success).toBe(true);
  });

  it("should pass when fieldOfStudy is an empty string", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      education: [{ ...validEdu, fieldOfStudy: "" }],
    });
    expect(result.success).toBe(true);
  });

  it("should pass when fieldOfStudy is provided", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      education: [{ ...validEdu, fieldOfStudy: "Computer Science" }],
    });
    expect(result.success).toBe(true);
  });

  it("should fail when more than 10 education entries are provided", () => {
    const tooMany = Array.from({ length: 11 }, () => ({ ...validEdu }));
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      education: tooMany,
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Maximum 10 education entries");
  });
});

// ---------------------------------------------------------------------------
// 9. languages
// ---------------------------------------------------------------------------

describe("resumeSchema — languages", () => {
  const validLevels = [
    "native",
    "fluent",
    "advanced",
    "intermediate",
    "basic",
  ] as const;

  it.each(validLevels)(
    "should pass with language level '%s'",
    (level) => {
      const result = resumeSchema.safeParse({
        ...VALID_RESUME,
        languages: [{ language: "English", level }],
      });
      expect(result.success).toBe(true);
    }
  );

  it("should fail with an invalid language level", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      languages: [{ language: "English", level: "expert" }],
    });
    expect(result.success).toBe(false);
  });

  it("should fail when language name is an empty string", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      languages: [{ language: "", level: "native" }],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Language is required");
  });

  it("should fail when more than 20 language entries are provided", () => {
    const tooMany = Array.from({ length: 21 }, (_, i) => ({
      language: `Language${i}`,
      level: "basic" as const,
    }));
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      languages: tooMany,
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Maximum 20 languages");
  });
});

// ---------------------------------------------------------------------------
// 10. skills
// ---------------------------------------------------------------------------

describe("resumeSchema — skills", () => {
  it("should fail when a skill value is an empty string", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      skills: [{ value: "" }],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Skill cannot be empty");
  });

  it("should fail when a skill value exceeds 100 characters", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      skills: [{ value: repeat("x", 101) }],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Skill too long");
  });

  it("should fail when more than 50 skills are provided", () => {
    const tooMany = Array.from({ length: 51 }, (_, i) => ({
      value: `Skill${i}`,
    }));
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      skills: tooMany,
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Maximum 50 skills");
  });

  it("should pass with a valid skill value", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      skills: [{ value: "TypeScript" }],
    });
    expect(result.success).toBe(true);
  });

  it("should pass with exactly 50 skills", () => {
    const exactly50 = Array.from({ length: 50 }, (_, i) => ({
      value: `Skill${i}`,
    }));
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      skills: exactly50,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 11. certificates
// ---------------------------------------------------------------------------

describe("resumeSchema — certificates", () => {
  it("should pass without the optional year field", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      certificates: [{ name: "AWS Certified", issuer: "Amazon" }],
    });
    expect(result.success).toBe(true);
  });

  it("should pass when year is an empty string", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      certificates: [{ name: "AWS Certified", issuer: "Amazon", year: "" }],
    });
    expect(result.success).toBe(true);
  });

  it("should pass when year is provided", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      certificates: [
        { name: "AWS Certified", issuer: "Amazon", year: "2023" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should fail when certificate name is an empty string", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      certificates: [{ name: "", issuer: "Amazon" }],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Certificate name is required");
  });

  it("should fail when issuer is an empty string", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      certificates: [{ name: "AWS Certified", issuer: "" }],
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Issuer is required");
  });

  it("should fail when more than 20 certificates are provided", () => {
    const tooMany = Array.from({ length: 21 }, () => ({
      name: "Cert",
      issuer: "Issuer",
    }));
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      certificates: tooMany,
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Maximum 20 certificates");
  });
});

// ---------------------------------------------------------------------------
// 12. summary
// ---------------------------------------------------------------------------

describe("resumeSchema — summary", () => {
  it("should fail when summary is an empty string", () => {
    const result = resumeSchema.safeParse({ ...VALID_RESUME, summary: "" });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Professional summary is required");
  });

  it("should fail when summary exceeds 2000 characters", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      summary: repeat("a", 2001),
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Summary too long");
  });

  it("should pass when summary is exactly 2000 characters", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      summary: repeat("a", 2000),
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 13. nickname (optional field)
// ---------------------------------------------------------------------------

describe("resumeSchema — nickname (optional)", () => {
  it("should pass when nickname is omitted", () => {
    const result = resumeSchema.safeParse({ ...VALID_RESUME });
    expect(result.success).toBe(true);
  });

  it("should pass when nickname is an empty string", () => {
    const result = resumeSchema.safeParse({ ...VALID_RESUME, nickname: "" });
    expect(result.success).toBe(true);
  });

  it("should pass when nickname is a non-empty string within length", () => {
    const result = resumeSchema.safeParse({ ...VALID_RESUME, nickname: "JD" });
    expect(result.success).toBe(true);
  });

  it("should fail when nickname exceeds 50 characters", () => {
    const result = resumeSchema.safeParse({
      ...VALID_RESUME,
      nickname: repeat("n", 51),
    });
    expect(result.success).toBe(false);
    expect(collectMessages(result)).toContain("Nickname too long");
  });
});
